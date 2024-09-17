import {
	Application,
	bind,
	Component,
	ContextTags,
	CoreBindings,
	inject,
	ProviderMap,
	createBindingFromClass
} from '@loopback/core';
import {
	AuthenticationBindings,
	AuthenticationComponent,
	registerAuthenticationStrategy
} from '@loopback/authentication';
import { Auth0ServiceProvider } from './auth0.service';
import { Auth0AuthenticationStrategy, SecuritySpecEnhancer, KEY, JWTServiceProvider } from './';

@bind({ tags: { [ContextTags.KEY]: AuthenticationBindings.COMPONENT } })
export class Auth0Component extends AuthenticationComponent {
	constructor(@inject(CoreBindings.APPLICATION_INSTANCE) public app: Application) {
		super();
		app.service(Auth0ServiceProvider);
		app.service(JWTServiceProvider);

		let authConfig: any = require('../../auth0Config.json');
		if (process.env.auth0Config) {
			let configFromEnv = JSON.parse(process.env.auth0Config);
			for (let name in configFromEnv) {
				authConfig[name] = configFromEnv[name];
			}
		}

		registerAuthenticationStrategy(app, Auth0AuthenticationStrategy);

		app.add(createBindingFromClass(SecuritySpecEnhancer));

		app.configure(KEY).to({
			jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
			audience: authConfig.audience,
			issuer: `https://${authConfig.domain}/`,
			algorithms: ['RS256']
		});
	}
}
