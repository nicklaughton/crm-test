import {
	AuthorizationContext,
	AuthorizationDecision,
	AuthorizationMetadata,
	Authorizer
} from '@loopback/authorization';
import { inject, Provider } from '@loopback/core';
const debug = require('debug')('Auth0Loopback4:ApexAuthorizationProvider');
debug.log = console.log.bind(console);

// Class level authorizer
export class ApexAuthorizationProvider implements Provider<Authorizer> {
	constructor() {}

	/**
	 * @returns authenticateFn
	 */
	value(): Authorizer {
		return this.authorize.bind(this);
	}

	async authorize(ctx: AuthorizationContext, metadata: AuthorizationMetadata): Promise<AuthorizationDecision> {
		debug('metadata %j', metadata);

		const appUser = ctx.principals[0];
		debug('appUser %j', appUser);

		if (!metadata?.allowedRoles?.length) return AuthorizationDecision.DENY;

		if (metadata.allowedRoles.includes('$everyone')) return AuthorizationDecision.ALLOW;

		if (metadata.allowedRoles.includes('$unauthenticated') && !appUser?.id) return AuthorizationDecision.ALLOW;

		if (!appUser || !appUser.id) return AuthorizationDecision.DENY;

		if (metadata.allowedRoles.includes('$authenticated')) return AuthorizationDecision.ALLOW;

		let allow = !!appUser.appUserToRoles.find((appUserToRole: any) =>
			metadata.allowedRoles.includes(appUserToRole.role?.name)
		);
		debug('allow %j', allow);

		if (allow) return AuthorizationDecision.ALLOW;
		else return AuthorizationDecision.DENY;
	}
}
