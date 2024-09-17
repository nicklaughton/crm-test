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

import { UserModel } from '../models';

import { UserRepository } from '../repositories';
import { User } from '../objects/user';
import { UserArray } from '../objects/user-array';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('User')
@authenticate('apex-auth')
export class UserController {
    constructor(
        @repository(UserRepository)
        public repository: UserRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {}

    @post('/api/Users', {
        responses: {
            '200': {
                description: 'User model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(UserModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(UserModel),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'user', allowedRoles: ['Administrator'] })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(UserModel, {
                                title: 'NewUser',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(UserModel, {
                                    title: 'NewUser',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<UserModel, 'id'> | Omit<UserModel, 'id'>[]
    ): Promise<UserModel | UserModel[] | User | UserArray> {
        if (data instanceof Array)
            return this.repository.createAll(data as UserModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return User.createWithChildren<User>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/Users/count', {
        responses: {
            '200': {
                description: 'User model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'user', allowedRoles: ['Administrator'] })
    async count(
        @param.where(UserModel) where?: Where<UserModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Users', {
        responses: {
            '200': {
                description: 'Array of User model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(UserModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'user', allowedRoles: ['Administrator'] })
    async find(
        @param.query.object('filter', getLegacyFilterSchemaFor(UserModel))
        filter?: Filter<UserModel>
    ): Promise<UserModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Users', {
        responses: {
            '200': {
                description: 'User PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'user', allowedRoles: ['Administrator'] })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(UserModel, { partial: true }),
                },
            },
        })
        @param.where(UserModel)
        where: Where<UserModel>,
        user: UserModel
    ): Promise<Count> {
        return this.repository.updateAll(user, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Users/{id}', {
        responses: {
            '200': {
                description: 'User model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(UserModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'user', allowedRoles: ['Administrator'] })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(UserModel, {exclude: 'where'}) filter?: FilterExcludingWhere<UserModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(UserModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<UserModel>
    ): Promise<UserModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Users/{id}', {
        responses: {
            '204': {
                description: 'User PATCH success',
            },
        },
    })
    @authorize({ resource: 'user', allowedRoles: ['Administrator'] })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(UserModel, { partial: true }),
                },
            },
        })
        user: UserModel
    ): Promise<UserModel> {
        await this.repository.updateById(id, user, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/Users/{id}', {
        responses: {
            '204': {
                description: 'User PUT success',
            },
        },
    })
    @authorize({ resource: 'user', allowedRoles: ['Administrator'] })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() user: UserModel
    ): Promise<UserModel> {
        await this.repository.replaceById(id, user, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/Users/{id}', {
        responses: {
            '204': {
                description: 'User DELETE success',
            },
        },
    })
    @authorize({ resource: 'user', allowedRoles: ['Administrator'] })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/Users', {
        responses: {
            '200': {
                description: 'Users DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'user', allowedRoles: ['Administrator'] })
    async delete(
        @param.query.object('where', getWhereSchemaFor(UserModel))
        where?: Where<UserModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }
}
