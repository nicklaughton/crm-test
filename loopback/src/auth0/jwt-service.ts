import { config, Provider, bind, BindingScope, ContextTags } from '@loopback/context';
import jwt, { RequestHandler } from 'express-jwt';
import { KEY, Auth0Config, JWT_SERVICE } from './types';

const jwks = require('jwks-rsa');

const debug = require('debug')('JWTServiceProvider');
debug.log = console.log.bind(console);

@bind({ tags: { [ContextTags.KEY]: JWT_SERVICE }, scope: BindingScope.SINGLETON })
export class JWTServiceProvider implements Provider<RequestHandler> {
	constructor(
		@config({ fromBinding: KEY })
		private options: Auth0Config
	) {}

	count: number = 0;

	value() {
		const auth0Config = this.options || {
			audience: undefined,
			issuer: undefined,
			algorithms: undefined,
			jwksUri: undefined
		};
		// Use `express-jwt` to verify the Auth0 JWT token
		return jwt({
			secret: jwks.expressJwtSecret({
				cache: true,
				rateLimit: true,
				jwksRequestsPerMinute: 5,
				jwksUri: auth0Config.jwksUri
			}),
			audience: auth0Config.audience,
			issuer: auth0Config.issuer,
			algorithms: auth0Config.algorithms || ['RS256'],
			// Customize `getToken` to allow `access_token` query string in addition
			// to `Authorization` header
			getToken: (req) => {
				debug('req.url', req.url);
				debug('req.query', req.query);
				if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
					debug('req.headers.authorization', req.headers.authorization);
					return req.headers.authorization.split(' ')[1];
				} else if (req.query && req.query.access_token) {
					debug('req.query.access_token', req.query.access_token);
					// Add the header so that other code can be simpler
					req.headers.authorization = 'Bearer ' + req.query.access_token;
					return req.query.access_token;
				}
			}
		});
	}
}
