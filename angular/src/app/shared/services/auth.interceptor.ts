// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, from } from 'rxjs';

import * as Debug from 'debug';

const debug = Debug('Auth0Angular10Library:AuthInterceptor');

@Injectable({
	providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
	constructor(private auth: AuthService) {}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return from(this.handleRequest(req, next));
	}

	async handleRequest(req: HttpRequest<any>, next: HttpHandler) {
		debug('req.url', req.url);
		if (req.url.startsWith('http')) {
			return next.handle(req).toPromise();
		} else {
			debug('this.auth', this.auth);

			debug('getting token');

			let authToken = await this.auth.getAuthToken();
			debug('handleRequest authToken', authToken);

			if (authToken) {
				const authReq = req.clone({
					setHeaders: {
						Authorization: authToken
					}
				});
				return next.handle(authReq).toPromise();
			} else {
				return next.handle(req).toPromise();
			}
		}
	}
}
