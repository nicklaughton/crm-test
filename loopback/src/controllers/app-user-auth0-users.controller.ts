// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
    Count,
    CountSchema,
    Filter,
    repository,
    Where,
} from '@loopback/repository';
import {
    del,
    get,
    getModelSchemaRef,
    getWhereSchemaFor,
    param,
    patch,
    post,
    requestBody,
    Request,
    Response,
    RestBindings,
} from '@loopback/rest';
import { inject } from '@loopback/core';
import { AppUserModel, Auth0UserModel } from '../models';
import { AppUserRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('App User')
@authenticate('apex-auth')
export class AppUserAuth0UsersController {
    constructor(
        @repository(AppUserRepository)
        protected appUserRepository: AppUserRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/AppUsers/{id}/auth0Users', {
        responses: {
            '200': {
                description: 'Array of AppUser has many Auth0User',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(Auth0UserModel),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async find(
        @param.path.number('id') id: typeof AppUserModel.prototype.id,
        @param.query.object('filter') filter?: Filter<Auth0UserModel>
    ): Promise<Auth0UserModel[]> {
        return this.appUserRepository
            .auth0Users(id)
            .find(filter, { request: this.req, response: this.res });
    }

    @post('/api/AppUsers/{id}/auth0Users', {
        responses: {
            '200': {
                description: 'AppUser model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Auth0UserModel),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async create(
        @param.path.number('id') id: typeof AppUserModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Auth0UserModel, {
                        title: 'NewAuth0UserInAppUser',
                        exclude: ['id'],
                        optional: ['appUserId'],
                    }),
                },
            },
        })
        auth0User: Omit<Auth0UserModel, 'id'>
    ): Promise<Auth0UserModel> {
        return this.appUserRepository
            .auth0Users(id)
            .create(auth0User, { request: this.req, response: this.res });
    }

    @patch('/api/AppUsers/{id}/auth0Users', {
        responses: {
            '200': {
                description: 'AppUser.Auth0User PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async patch(
        @param.path.number('id') id: typeof AppUserModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Auth0UserModel, {
                        partial: true,
                    }),
                },
            },
        })
        auth0User: Partial<Auth0UserModel>,
        @param.query.object('where', getWhereSchemaFor(Auth0UserModel))
        where?: Where<Auth0UserModel>
    ): Promise<Count> {
        return this.appUserRepository.auth0Users(id).patch(auth0User, where);
    }

    @del('/api/AppUsers/{id}/auth0Users', {
        responses: {
            '200': {
                description: 'AppUser.Auth0User DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async delete(
        @param.path.number('id') id: typeof AppUserModel.prototype.id,
        @param.query.object('where', getWhereSchemaFor(Auth0UserModel))
        where?: Where<Auth0UserModel>
    ): Promise<Count> {
        return this.appUserRepository.auth0Users(id).delete(where);
    }
}
