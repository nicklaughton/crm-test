import { inject, CoreBindings, Application } from '@loopback/core';
import { config, Provider, bind, BindingScope, ContextTags } from '@loopback/context';
import { AUTH0_SERVICE, Auth0Config, JWT_SERVICE, KEY } from './index';
import { repository } from '@loopback/repository';
const classDebug = require('debug')('Auth0Loopback4:Auth0Service');
classDebug.log = console.log.bind(console);
export type Auth0Provider = unknown;

export interface Auth0Service {
	usernameToAppUser: object;
	pendingRequestsByUsername: object;
	addAppUserToRequest(req: any, username: string);
	handlePendingRequests(username: string);
}

export class Auth0ServiceHelper implements Auth0Service {
	constructor() {}

	// Change to usernameToAppUser
	usernameToAppUser: object = {};
	// Change to pendingRequestsByUsername
	pendingRequestsByUsername: object = {};

	addAppUserToRequest(req: any, username: string) {
		const debug = classDebug.extend('addAppUserToRequest');
		debug('username', username);
		const appUser = this.usernameToAppUser[username];

		req.appUser = appUser;
		debug('req.appUser', req.appUser);
	}

	async handlePendingRequests(username: string) {
		const debug = classDebug.extend('handlePendingRequests');
		debug('username', username);
		debug('pendingRequestsByUsername', this.pendingRequestsByUsername);
		for (let pendingRequest of this.pendingRequestsByUsername[username] || []) {
			this.addAppUserToRequest(pendingRequest.request, username);
			pendingRequest.resolve((pendingRequest.request as any).appUser);
		}
		delete this.pendingRequestsByUsername[username];
		delete this.usernameToAppUser[username];
	}
}

@bind({ tags: { [ContextTags.KEY]: AUTH0_SERVICE }, scope: BindingScope.SINGLETON })
export class Auth0ServiceProvider implements Provider<Auth0Service> {
	constructor() {}
	value() {
		return new Auth0ServiceHelper();
	}
}
