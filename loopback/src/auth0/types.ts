import { BindingKey } from '@loopback/context';
import jwt from 'express-jwt';
import { AuthenticationStrategy, AuthenticationBindings } from '@loopback/authentication';

import { bind } from '@loopback/core';
import {
	asSpecEnhancer,
	mergeOpenAPISpec,
	OASEnhancer,
	OpenApiSpec,
	ReferenceObject,
	SecuritySchemeObject
} from '@loopback/openapi-v3';
import { inspect } from 'util';
import { Auth0Service } from './auth0.service';

export interface Auth0Config {
	jwksUri: string;
	audience: string;
	issuer: string;
	algorithms: string[];
}

export const JWT_SERVICE = BindingKey.create<jwt.RequestHandler>('services.JWTService');

export const AUTH0_SERVICE = BindingKey.create<Auth0Service>('services.AUTH0Service');

export const KEY = BindingKey.create<AuthenticationStrategy>(
	`${AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME}.Auth0AuthenticationStrategy`
);
/*
export const OPERATION_SECURITY_SPEC = [
	{
		// secure all endpoints with 'jwt'
		jwt: [],
	},
];

export const SECURITY_SCHEME_SPEC: SecuritySchemeObjects = {
	jwt: {
		type: 'http',
		scheme: 'bearer',
		bearerFormat: 'JWT',
	},
};
@bind(asSpecEnhancer)
export class SecuritySpecEnhancer implements OASEnhancer {
	name = 'bearerAuth';

	modifySpec(spec: OpenApiSpec): OpenApiSpec {
		const patchSpec = {
			components: {
				securitySchemes: SECURITY_SCHEME_SPEC,
			},
			security: OPERATION_SECURITY_SPEC,
		};
		const mergedSpec = mergeOpenAPISpec(spec, patchSpec);
		console.log(`security spec extension, merged spec: ${inspect(mergedSpec)}`);
		return mergedSpec;
	}
}*/
