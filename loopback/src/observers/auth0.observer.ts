import {
	/* inject, Application, CoreBindings, */
	lifeCycleObserver,
	LifeCycleObserver,
	inject,
	CoreBindings,
	Application
} from '@loopback/core';
import { Auth0Component } from '../auth0/auth0.component';
import { ApexAuthorizationProvider } from '../authorizers/apex.authorizer';
import { AuthorizationComponent, AuthorizationTags } from '@loopback/authorization';

@lifeCycleObserver('initialized')
export class Auth0Observer implements LifeCycleObserver {
	constructor(@inject(CoreBindings.APPLICATION_INSTANCE) private app: Application) {}

	/**
	 * This method will be invoked when the application starts
	 */
	async init(): Promise<void> {
		// Add your logic for start
		this.app.component(Auth0Component);

		this.app.component(AuthorizationComponent);
		this.app
			.bind('authorizationProviders.apex-provider')
			.toProvider(ApexAuthorizationProvider)
			.tag(AuthorizationTags.AUTHORIZER);
	}
}
