// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
	/* inject, Application, CoreBindings, */
	lifeCycleObserver,
	LifeCycleObserver,
	inject,
	CoreBindings,
	Application
} from '@loopback/core';
import { ApexAuthorizationProvider } from '../authorizers/apex.authorizer';
import { AuthorizationComponent, AuthorizationTags } from '@loopback/authorization';
import { AuthenticationComponent } from '@loopback/authentication';

@lifeCycleObserver('initialized')
export class ApexAuthorizerObserver implements LifeCycleObserver {
	constructor(@inject(CoreBindings.APPLICATION_INSTANCE) private app: Application) {}

	/**
	 * This method will be invoked when the application starts
	 */
	async start(): Promise<void> {
		this.app.component(AuthenticationComponent);
		this.app.component(AuthorizationComponent);
		this.app
			.bind('authorizationProviders.apex-provider')
			.toProvider(ApexAuthorizationProvider)
			.tag(AuthorizationTags.AUTHORIZER);
	}
}
