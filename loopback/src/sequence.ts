// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { inject } from '@loopback/core';
import {
	FindRoute,
	InvokeMethod,
	InvokeMiddleware,
	ParseParams,
	Reject,
	RequestContext,
	RestBindings,
	Send,
	SequenceHandler,
	ExpressRequestHandler
} from '@loopback/rest';
import { AuthenticationBindings, AuthenticateFn } from '@loopback/authentication';
import compression from 'compression';
import helmet from 'helmet';

const SequenceActions = RestBindings.SequenceActions;

const middlewareList: ExpressRequestHandler[] = [compression()];

middlewareList.push(
	helmet({
		frameguard: { action: 'sameorigin' },
		hsts: { maxAge: 31536000 },
		referrerPolicy: false,
		contentSecurityPolicy: {
			directives: {
				frameAncestors: ["'self'", process.env.apexDesignerURL],
				'default-src': helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc
			}
		}
	})
);

export class MySequence implements SequenceHandler {
	/**
	 * Optional invoker for registered middleware in a chain.
	 * To be injected via SequenceActions.INVOKE_MIDDLEWARE.
	 */
	@inject(SequenceActions.INVOKE_MIDDLEWARE, { optional: true })
	protected invokeMiddleware: InvokeMiddleware = () => false;

	constructor(
		@inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
		@inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
		@inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
		@inject(SequenceActions.SEND) public send: Send,
		@inject(SequenceActions.REJECT) public reject: Reject,
		@inject(AuthenticationBindings.AUTH_ACTION)
		protected authenticateRequest: AuthenticateFn
	) {}

	async handle(context: RequestContext) {
		try {
			const { request, response } = context;
			const finished = await this.invokeMiddleware(context, middlewareList);
			if (finished) return;
			const route = this.findRoute(request);

			await this.authenticateRequest(request);

			const args = await this.parseParams(request, route);
			const result = await this.invoke(route, args);
			this.send(response, result);
		} catch (err) {
			this.reject(context, err);
		}
	}
}
