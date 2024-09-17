import { config, inject } from '@loopback/context';
import { Response, Request, RestBindings, ExpressRequestHandler } from '@loopback/rest';
import { AuthenticationStrategy, AuthenticationBindings, AuthenticationMetadata } from '@loopback/authentication';
import { UserProfile } from '@loopback/security';
import { JWT_SERVICE, KEY, Auth0Config, AUTH0_SERVICE } from './types';
import { AppUserRepository, Auth0UserRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { Application, CoreBindings, service } from '@loopback/core';
import { Auth0Service } from './auth0.service';
import got from 'got';
const jwtAuthz = require('express-jwt-authz');

const classDebug = require('debug')('Auth0Loopback4:Auth0AuthenticationStrategy');
classDebug.log = console.log.bind(console);

export class Auth0AuthenticationStrategy implements AuthenticationStrategy {
	name = 'apex-auth';
	constructor(
		@inject(RestBindings.Http.RESPONSE)
		private response: Response,
		@inject(AuthenticationBindings.METADATA)
		private metadata: AuthenticationMetadata,
		@inject(AUTH0_SERVICE) private auth0Service: Auth0Service,
		@inject(JWT_SERVICE)
		private jwtCheck: ExpressRequestHandler,
		@config({ fromBinding: KEY })
		private options: Auth0Config,
		@repository(AppUserRepository)
		public appUserRepository: AppUserRepository,
		@repository(Auth0UserRepository)
		public auth0UserRepository: Auth0UserRepository
	) {}

	async authenticate(request: Request): Promise<UserProfile | undefined> {
		const debug = classDebug.extend('authenticate');
		return new Promise<UserProfile | undefined>((resolve, reject) => {
			this.jwtCheck(request, this.response, async (err: unknown) => {
				if (err) {
					debug('jwtCheck error:', err);
					await this.handleRequestUser(request, resolve, reject);
					return;
				}

				// If the `@authenticate` requires `scopes` check
				if (this.metadata.options && this.metadata.options.scopes) {
					jwtAuthz(this.metadata.options!.scopes, { failWithError: true })(
						request,
						this.response,
						async (err2?: Error) => {
							if (err2) {
								console.error(err2);
								reject(err2);
								return;
							}
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							//resolve((request as any).user);
							await this.handleRequestUser(request, resolve, reject);
						}
					);
				} else {
					debug('request.user', (request as any).user);
					//resolve(user);
					await this.handleRequestUser(request, resolve, reject);
				}
			});
		});
	}

	async userInfo(request) {
		const debug = classDebug.extend('userInfo');
		// Make the get call to get the user profile so we have email
		debug('this.options.issuer %j', this.options.issuer);
		const url = `${this.options.issuer}userinfo`;
		debug('url %j', url);
		try {
			const userinfo = await got.get(url, { headers: { Authorization: request.headers.authorization } }).json();
			debug('userinfo %j', userinfo);
			return userinfo;
		} catch (err) {
			console.error('auth0-authentication-strategy.ts error getting userinfo: ' + err);
			throw err;
		}
	}

	async handleRequestUser(request, resolve, reject) {
		const debug = classDebug.extend('handleRequestUser');
		const user = (request as any).user;
		debug('user %j', user);

		if (!user) {
			return resolve({});
		}

		const username = user.sub;

		// If we already know which userid this is

		if (this.auth0Service.usernameToAppUser[username]) {
			this.auth0Service.addAppUserToRequest(request, username);
			return resolve(user);
		}

		// If there are requests pending, queue this one up too
		debug('HAS PENDING REQUESTS?', username, !!this.auth0Service.pendingRequestsByUsername[username]);
		if (this.auth0Service.pendingRequestsByUsername[username]) {
			this.auth0Service.pendingRequestsByUsername[username].push({ request, resolve });
			// Do nothing more for now
			return;
		}

		this.auth0Service.pendingRequestsByUsername[username] = [];
		this.auth0Service.pendingRequestsByUsername[username].push({ request, resolve });

		// find auth0 user include appUser -> appUserToRole -> role
		let auth0User = await this.auth0UserRepository.findOne({
			where: { sub: user.sub },
			include: [
				{
					relation: 'appUser',
					scope: {
						include: [
							{
								relation: 'appUserToRoles',
								scope: {
									include: [
										{
											relation: 'role',
											scope: {}
										}
									]
								}
							}
						]
					}
				}
			]
		});

		debug('auth0User %j', auth0User);

		let appUser;
		let userinfo;

		if (auth0User) {
			appUser = auth0User.appUser;
			debug('appUser %j', appUser);
		} else {
			try {
				userinfo = await this.userInfo(request);
				debug('userinfo %j', userinfo);
			} catch (err) {
				console.error('auth0-authentication-strategy.ts error getting userinfo: ' + err);
				return reject(err);
			}

			// find appUser using email only
			appUser = await this.appUserRepository.findOne({
				where: { email: userinfo.email },
				include: [
					{
						relation: 'appUserToRoles',
						scope: {
							include: [
								{
									relation: 'role',
									scope: {}
								}
							]
						}
					}
				]
			});

			debug('appUser', appUser);
		}

		let disableSignUps = 'false';

		if (appUser) {
			let udpates: any = {};

			let lastSeenThreshold = 5 * 60 * 1000;
			if (process.env.lastSeenThresholdInMinutes) {
				lastSeenThreshold = Number(process.env.lastSeenThresholdInMinutes) * 60 * 1000;
			}
			debug('lastSeenThreshold %j', lastSeenThreshold);
			let lastSeen = new Date();
			if (!appUser.lastSeen || appUser.lastSeen.getTime() < lastSeen.getTime() - lastSeenThreshold) {
				let updates: any = { lastSeen: lastSeen };

				if (!userinfo) {
					userinfo = await this.userInfo(request);
					debug('userinfo %j', userinfo);
				}

				if (appUser.name != userinfo.name) updates.name = userinfo.name;

				if (appUser.picture != userinfo.picture) updates.picture = userinfo.picture;

				debug('updates %j', updates);
				await this.appUserRepository.updateById(appUser.id, updates);

				for (const name in updates) {
					appUser[name] = updates[name];
				}
			}
		} else if (disableSignUps === 'true') {
			console.error('New sign ups are disabled.');
			this.auth0Service.usernameToAppUser[username] = {};
			this.auth0Service.handlePendingRequests(username);
			return resolve({});
		} else {
			let userData = {
				name: userinfo.name,
				email: userinfo.email,
				picture: userinfo.picture,
				created: new Date(),
				lastSeen: new Date()
			};
			debug('userData', userData);

			try {
				appUser = await this.appUserRepository.create(userData);
			} catch (err) {
				debug('err', err);
				return reject(err);
			}

			debug('appUser', appUser);
		}

		if (!auth0User) {
			let auth0UserData = {
				sub: user.sub,
				profileUpdated: new Date(),
				appUserId: appUser.id
			};
			debug('auth0UserData %j', auth0UserData);
			try {
				auth0User = await this.auth0UserRepository.create(auth0UserData);
				debug('auth0User %j', auth0User);
			} catch (err) {
				debug('err', err);
				return reject(err);
			}
		}

		this.auth0Service.usernameToAppUser[username] = appUser;
		this.auth0Service.handlePendingRequests(username);

		request.appUser = appUser;
	}
}
