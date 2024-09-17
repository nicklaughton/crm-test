// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHrefService } from './base-href.service';

import * as Debug from 'debug';
const debug = Debug('BaseHrefInterceptor');

@Injectable()
export class BaseHrefInterceptor implements HttpInterceptor {
	constructor(private baseHrefService: BaseHrefService) {
		debug('baseHrefService.prefix', baseHrefService.prefix);
	}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		debug('req.url', req.url);

		if (req.url.startsWith('http')) {
			return next.handle(req);
		} else if (this.baseHrefService.prefix) {
			const apiReq = req.clone({ url: `${this.baseHrefService.prefix}${req.url}` });
			return next.handle(apiReq);
		} else {
			return next.handle(req);
		}
	}
}
