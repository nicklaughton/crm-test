// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

const debug = require('debug')('Loopback4BasicAuth:BasicAuthenticationStrategy');
debug.log = console.log.bind(console);

import { AuthenticationStrategy } from '@loopback/authentication';
import { Request } from '@loopback/rest';
import { UserProfile, securityId } from '@loopback/security';

export class DefaultAuthenticationStrategy implements AuthenticationStrategy {
	name = 'apex-auth';

	constructor() {}

	async authenticate(request: Request): Promise<UserProfile> {
		return {
			[securityId]: 'abc',
			name: 'Everyone',
			email: 'everyone@demo.com',
			skipAuth: process.env.skipAuth === 'true'
		};
	}
}
