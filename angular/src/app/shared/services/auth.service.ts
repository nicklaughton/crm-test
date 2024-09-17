// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Injectable } from '@angular/core';
import { Auth0Client } from '@auth0/auth0-spa-js';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

import { BaseHrefService } from './base-href.service';

import { AppUser } from '../models/app-user';

import * as Debug from 'debug';

const classDebug = Debug('Auth0Angular10Library:AuthService');

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private config: any;

	private auth0: Auth0Client;

	private _authenticated = new BehaviorSubject<boolean>(undefined);
	authenticated = this._authenticated.asObservable();

	private _appUser = new BehaviorSubject<AppUser>(undefined);
	appUser = this._appUser.asObservable();

	private _userProfile = new BehaviorSubject<any>(undefined);
	userProfile = this._userProfile.asObservable();

	errorMessage: string;

	constructor(
		private router: Router,
		private httpClient: HttpClient,
		private httpBackend: HttpBackend,
		private baseHrefService: BaseHrefService
	) {
		const debug = classDebug.extend('constructor');
		debug('constructor');

		let noInterceptorHttpClient = new HttpClient(httpBackend);

		debug('this.baseHrefService.prefix', this.baseHrefService.prefix);
		noInterceptorHttpClient
			.get(this.baseHrefService.prefix + '/api/auth0ClientConfiguration', {
				headers: new HttpHeaders().set('skipAuthInterceptor', '')
			})
			.subscribe(async (config: any) => {
				debug('config', config);

				this.config = config;

				this.auth0 = new Auth0Client({
					domain: config.domain,
					audience: config.audience,
					client_id: config.clientId,
					redirect_uri: window.location.origin + this.baseHrefService.prefix,
					useRefreshTokens: config.useRefreshTokens,
					useCookiesForTransactions: config.useCookiesForTransactions
				});
				debug('this.auth0', this.auth0);

				const params = new window['URLSearchParams'](window.location.search);
				debug('params', params);

				if (params.has('code') && params.has('state')) {
					const redirectResult = await this.auth0.handleRedirectCallback();
					debug('redirectResult', redirectResult);

					if (redirectResult?.appState?.target) {
						localStorage.setItem('auth0NextUrl', redirectResult.appState.target);
					}

					// Remove query params
					this.router.navigate([], {
						queryParams: {
							code: null,
							state: null
						},
						queryParamsHandling: 'merge'
					});

					debug('window.location', window.location);
				}

				this.auth0
					.getTokenSilently()
					.then(async (token: any) => {
						debug('token', token);
						// used for Loopback Explorer Access
						if (token) localStorage.setItem('access_token', token);

						this.auth0.getIdTokenClaims().then((claims) => {
							debug('claims', claims);
						});

						let filter = {
							include: {
								appUserToRoles: {
									include: {
										role: {}
									}
								}
							}
						};
						debug('filter', filter);

						// ensure the user exists before determining authentication status
						noInterceptorHttpClient
							.get(
								this.baseHrefService.prefix +
									'/api/AppUsers/currentUser?filter=' +
									encodeURI(JSON.stringify(filter)),
								{
									headers: { Authorization: 'Bearer ' + token }
								}
							)
							.subscribe(
								(appuser: AppUser) => {
									debug('appuser', appuser);
									this._appUser.next(appuser);
									if (appuser && appuser.id) {
										this.auth0.getUser().then((user) => {
											debug('user:', user);
											this._userProfile.next(user);
										});
										this._authenticated.next(true);
										let nextUrl = localStorage.getItem('auth0NextUrl');
										debug('nextUrl', nextUrl);
										if (nextUrl) {
											debug('navigating');
											this.router.navigateByUrl(nextUrl);
											debug('removing auth0NextUrl');
											localStorage.removeItem('auth0NextUrl');
										}
									} else {
										this._authenticated.next(false);
									}
								},
								(err) => {
									this._authenticated.next(false);
								}
							);
					})
					.catch((err: any) => {
						debug('err', '' + err);
						this.errorMessage = String(err);
						if (this.errorMessage.startsWith('Error: '))
							this.errorMessage = this.errorMessage.split('Error: ')[1];
						debug('this.errorMessage', this.errorMessage);

						this._authenticated.next(false);
					});
			});
		debug('end constructor');
	}

	private async waitForAuth0Client() {
		const debug = classDebug.extend('waitForAuth0Client');
		if (this.auth0) return;
		let retries = 0;
		debug('start waitForAuth0Client');
		while (retries < 20 && !this.auth0) {
			await new Promise<void>((resolve) => setTimeout(resolve, 100));
			retries++;
		}
		debug('end waitForAuth0Client', this.auth0);
	}

	async login(redirectPath: string = '/', promptForReauthentication?: boolean) {
		const debug = classDebug.extend('login');
		debug('redirectPath', redirectPath);
		debug('promptForReauthentication', promptForReauthentication);
		await this.waitForAuth0Client();

		let disableSignUps = 'false';

		this.auth0.loginWithRedirect({
			appState: { target: redirectPath },
			prompt: promptForReauthentication ? 'none' : 'login',
			allowSignUp: disableSignUps !== 'true'
		});
	}

	async signup(redirectPath: string = '/', promptForReauthentication?: boolean) {
		const debug = classDebug.extend('signup');
		debug('redirectPath', redirectPath);
		debug('promptForReauthentication', promptForReauthentication);
		await this.waitForAuth0Client();
		this.auth0.loginWithRedirect({
			screen_hint: 'signup',
			appState: { target: redirectPath },
			prompt: promptForReauthentication ? 'none' : 'login'
		});
	}

	async logout() {
		const debug = classDebug.extend('logout');
		let url = window.location.origin + this.baseHrefService.prefix;
		debug('url', url);

		await this.waitForAuth0Client();

		this.auth0.logout({
			returnTo: url
		});
		this._authenticated.next(false);
	}

	async getToken(): Promise<string> {
		const debug = classDebug.extend('getToken');

		let authenticated = await this.isAuthenticated();
		if (authenticated) {
			await this.waitForAuth0Client();
			let token = await this.auth0.getTokenSilently();
			debug('getToken token', token);
			// used for Loopback Explorer Access
			if (token) localStorage.setItem('access_token', token);
			return token;
		}
	}

	async getAuthToken(): Promise<string> {
		const debug = classDebug.extend('getAuthToken');
		let authToken;
		let token = await this.getToken();
		debug('getAuthToken token', token);

		if (token) {
			authToken = 'Bearer ' + token;
		}

		debug('getAuthToken authToken', authToken);
		return authToken;
	}

	async isAuthenticated(): Promise<boolean> {
		const debug = classDebug.extend('isAuthenticated');
		let authenticated = this._authenticated.getValue();
		debug('authenticated', authenticated);

		if (authenticated === undefined) {
			authenticated = await new Promise((resolve) => {
				let subscription = this.authenticated.subscribe((newValue: boolean) => {
					debug('newValue', newValue);
					if (newValue !== undefined) {
						subscription.unsubscribe();
						resolve(newValue);
					}
				});
			});
			debug('authenticated', authenticated);
		}

		return authenticated;
	}

	async currentAppUser(): Promise<AppUser> {
		const debug = classDebug.extend('currentAppUser');
		let appUser = this._appUser.getValue();
		debug('appUser', appUser);

		if (appUser === undefined) {
			appUser = await new Promise((resolve) => {
				let subscription = this.appUser.subscribe((newValue: AppUser) => {
					debug('newValue', newValue);
					if (newValue !== undefined) {
						subscription.unsubscribe();
						resolve(newValue);
					}
				});
			});
			debug('appUser', appUser);
		}

		return appUser;
	}

	async currentAppUserId(): Promise<number> {
		const debug = classDebug.extend('currentAppUserId');
		let appUser = await this.currentAppUser();
		debug('appUser', appUser);

		return appUser.id;
	}

	redirectToLoginPage() {
		const debug = classDebug.extend('redirectToLoginPage');

		debug('this.errorMessage', this.errorMessage);
		if (this.errorMessage == 'Please verify your email before logging in.') {
			debug('this.config.verifyEmailRoute', this.config.verifyEmailRoute);
			this.router.navigateByUrl(this.config.verifyEmailRoute);
		} else if (this.errorMessage == 'Login required') {
			debug('this.config.logInRoute', this.config.logInRoute);
			this.router.navigateByUrl(this.config.logInRoute);
		} else {
			debug('this.config.loginErrorRoute', this.config.loginErrorRoute);
			this.router.navigateByUrl(this.config.loginErrorRoute);
		}
	}

	async hasRole(roleName: string): Promise<boolean> {
		const debug = classDebug.extend('hasRole');
		debug('roleName', roleName);

		let authenticated = await this.isAuthenticated();
		debug('authenticated', authenticated);

		let hasRole = false;
		if (authenticated) {
			let appUser = await this.currentAppUser();

			if (!(this._appUser && this._appUser.getValue() && this._appUser.getValue().appUserToRoles)) return false;

			debug('appUser', appUser);
			hasRole = !!this._appUser
				.getValue()
				.appUserToRoles.find((appUserToRole: any) => appUserToRole.role?.name == roleName);
		}
		debug('hasRole', hasRole);
		return hasRole;
	}

	async getConfig(): Promise<any> {
		if (!this.config) {
			await new Promise<void>((resolve) => {
				let interval = setInterval(() => {
					if (this.config) {
						clearInterval(interval);
						resolve();
					}
				}, 50);
			});
		}
		return this.config;
	}
}
