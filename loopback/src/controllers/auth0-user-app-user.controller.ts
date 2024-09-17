// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { repository } from '@loopback/repository';
import {
    param,
    get,
    getModelSchemaRef,
    Request,
    Response,
    RestBindings,
} from '@loopback/rest';
import { inject } from '@loopback/core';
import { Auth0UserModel, AppUserModel } from '../models';
import { Auth0UserRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Auth0 User')
@authenticate('apex-auth')
export class Auth0UserAppUserController {
    constructor(
        @repository(Auth0UserRepository)
        public auth0UserRepository: Auth0UserRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Auth0Users/{id}/appUser', {
        responses: {
            '200': {
                description: 'AppUser belonging to Auth0User',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(AppUserModel),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'appUser', allowedRoles: ['Administrator'] })
    async getAppUser(
        @param.path.number('id') id: typeof Auth0UserModel.prototype.id
    ): Promise<AppUserModel> {
        return this.auth0UserRepository.appUser(id);
    }
}
