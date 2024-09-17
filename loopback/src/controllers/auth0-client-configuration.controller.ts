// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
    Request,
    Response,
    RestBindings,
    param,
    requestBody,
    getModelSchemaRef,
    get,
} from '@loopback/rest';
import { inject, CoreBindings } from '@loopback/core';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { ADApplication } from '../application';

const fs = require('fs-extra');

let debug = require('debug')('Auth0Loopback4:Auth0ClientConfiguration');
debug.log = console.log.bind(console);
debug('server function loaded');

@authenticate('apex-auth')
export class Auth0ClientConfigurationController {
    constructor(
        @inject(RestBindings.Http.REQUEST) private req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {}

    @authorize({
        resource: 'auth0ClientConfiguration',
        allowedRoles: ['$everyone'],
    })
    @get('/api/auth0ClientConfiguration', {
        responses: {
            '200': {
                description: 'Returns the Auth0 configuration',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                        },
                    },
                },
            },
        },
    })
    async auth0ClientConfiguration(): Promise<any> {
        let options = { request: this.req, response: this.res };

        let authConfig: any;
        if (process.env.auth0Config) {
            authConfig = JSON.parse(process.env.auth0Config);
        } else {
            authConfig = require('../../auth0Config.json');
        }
        return authConfig;
    }
}
