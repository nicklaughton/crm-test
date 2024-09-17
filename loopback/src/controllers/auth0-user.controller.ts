// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
    Count,
    CountSchema,
    Filter,
    FilterExcludingWhere,
    repository,
    Where,
} from '@loopback/repository';
import { Constructor, inject } from '@loopback/core';
import {
    post,
    param,
    get,
    getModelSchemaRef,
    patch,
    put,
    del,
    requestBody,
    getWhereSchemaFor,
    RestBindings,
    Request,
    Response,
} from '@loopback/rest';

import { Auth0UserModel } from '../models';

import { Auth0UserRepository } from '../repositories';
import { Auth0User } from '../objects/auth0-user';
import { Auth0UserArray } from '../objects/auth0-user-array';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('Auth0 User')
@authenticate('apex-auth')
export class Auth0UserController {
    constructor(
        @repository(Auth0UserRepository)
        public repository: Auth0UserRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {}

    @post('/api/Auth0Users', {
        responses: {
            '200': {
                description: 'Auth0User model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(Auth0UserModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(Auth0UserModel),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(Auth0UserModel, {
                                title: 'NewAuth0User',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(Auth0UserModel, {
                                    title: 'NewAuth0User',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<Auth0UserModel, 'id'> | Omit<Auth0UserModel, 'id'>[]
    ): Promise<Auth0UserModel | Auth0UserModel[] | Auth0User | Auth0UserArray> {
        if (data instanceof Array)
            return this.repository.createAll(data as Auth0UserModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return Auth0User.createWithChildren<Auth0User>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/Auth0Users/count', {
        responses: {
            '200': {
                description: 'Auth0User model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async count(
        @param.where(Auth0UserModel) where?: Where<Auth0UserModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Auth0Users', {
        responses: {
            '200': {
                description: 'Array of Auth0User model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(Auth0UserModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async find(
        @param.query.object('filter', getLegacyFilterSchemaFor(Auth0UserModel))
        filter?: Filter<Auth0UserModel>
    ): Promise<Auth0UserModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Auth0Users', {
        responses: {
            '200': {
                description: 'Auth0User PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Auth0UserModel, {
                        partial: true,
                    }),
                },
            },
        })
        @param.where(Auth0UserModel)
        where: Where<Auth0UserModel>,
        auth0User: Auth0UserModel
    ): Promise<Count> {
        return this.repository.updateAll(auth0User, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Auth0Users/{id}', {
        responses: {
            '200': {
                description: 'Auth0User model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Auth0UserModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(Auth0UserModel, {exclude: 'where'}) filter?: FilterExcludingWhere<Auth0UserModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(Auth0UserModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<Auth0UserModel>
    ): Promise<Auth0UserModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Auth0Users/{id}', {
        responses: {
            '204': {
                description: 'Auth0User PATCH success',
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Auth0UserModel, {
                        partial: true,
                    }),
                },
            },
        })
        auth0User: Auth0UserModel
    ): Promise<Auth0UserModel> {
        await this.repository.updateById(id, auth0User, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/Auth0Users/{id}', {
        responses: {
            '204': {
                description: 'Auth0User PUT success',
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() auth0User: Auth0UserModel
    ): Promise<Auth0UserModel> {
        await this.repository.replaceById(id, auth0User, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/Auth0Users/{id}', {
        responses: {
            '204': {
                description: 'Auth0User DELETE success',
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/Auth0Users', {
        responses: {
            '200': {
                description: 'Auth0Users DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'auth0User', allowedRoles: ['$authenticated'] })
    async delete(
        @param.query.object('where', getWhereSchemaFor(Auth0UserModel))
        where?: Where<Auth0UserModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }
}
