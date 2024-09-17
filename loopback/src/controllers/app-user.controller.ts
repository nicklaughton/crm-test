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

import { AppUserModel } from '../models';

import { AppUserRepository } from '../repositories';
import { AppUser } from '../objects/app-user';
import { AppUserArray } from '../objects/app-user-array';

import { ExportImportControllerMixin } from '../mixins/export-import-controller.mixin';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('App User')
@authenticate('apex-auth')
export class AppUserController extends ExportImportControllerMixin<
    AppUserModel,
    Constructor<Object>,
    typeof AppUserModel
>(Object, 'appUser', 'AppUsers', AppUserModel, AppUser, {
    keyProperties: ['email'],
    includeRelationships: ['appUserToRoles'],
}) {
    constructor(
        @repository(AppUserRepository)
        public repository: AppUserRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {
        super();
    }

    @post('/api/AppUsers', {
        responses: {
            '200': {
                description: 'AppUser model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(AppUserModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(AppUserModel),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'appUser', allowedRoles: ['Administrator'] })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(AppUserModel, {
                                title: 'NewAppUser',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(AppUserModel, {
                                    title: 'NewAppUser',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<AppUserModel, 'id'> | Omit<AppUserModel, 'id'>[]
    ): Promise<AppUserModel | AppUserModel[] | AppUser | AppUserArray> {
        if (data instanceof Array)
            return this.repository.createAll(data as AppUserModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return AppUser.createWithChildren<AppUser>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/AppUsers/count', {
        responses: {
            '200': {
                description: 'AppUser model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'appUser', allowedRoles: ['Administrator'] })
    async count(
        @param.where(AppUserModel) where?: Where<AppUserModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/AppUsers', {
        responses: {
            '200': {
                description: 'Array of AppUser model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(AppUserModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'appUser', allowedRoles: ['Administrator'] })
    async find(
        @param.query.object('filter', getLegacyFilterSchemaFor(AppUserModel))
        filter?: Filter<AppUserModel>
    ): Promise<AppUserModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/AppUsers', {
        responses: {
            '200': {
                description: 'AppUser PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'appUser', allowedRoles: ['Administrator'] })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(AppUserModel, { partial: true }),
                },
            },
        })
        @param.where(AppUserModel)
        where: Where<AppUserModel>,
        appUser: AppUserModel
    ): Promise<Count> {
        return this.repository.updateAll(appUser, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/AppUsers/{id}', {
        responses: {
            '200': {
                description: 'AppUser model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(AppUserModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'appUser', allowedRoles: ['Administrator'] })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(AppUserModel, {exclude: 'where'}) filter?: FilterExcludingWhere<AppUserModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(AppUserModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<AppUserModel>
    ): Promise<AppUserModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/AppUsers/{id}', {
        responses: {
            '204': {
                description: 'AppUser PATCH success',
            },
        },
    })
    @authorize({ resource: 'appUser', allowedRoles: ['Administrator'] })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(AppUserModel, { partial: true }),
                },
            },
        })
        appUser: AppUserModel
    ): Promise<AppUserModel> {
        await this.repository.updateById(id, appUser, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/AppUsers/{id}', {
        responses: {
            '204': {
                description: 'AppUser PUT success',
            },
        },
    })
    @authorize({ resource: 'appUser', allowedRoles: ['Administrator'] })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() appUser: AppUserModel
    ): Promise<AppUserModel> {
        await this.repository.replaceById(id, appUser, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/AppUsers/{id}', {
        responses: {
            '204': {
                description: 'AppUser DELETE success',
            },
        },
    })
    @authorize({ resource: 'appUser', allowedRoles: ['Administrator'] })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/AppUsers', {
        responses: {
            '200': {
                description: 'AppUsers DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'appUser', allowedRoles: ['Administrator'] })
    async delete(
        @param.query.object('where', getWhereSchemaFor(AppUserModel))
        where?: Where<AppUserModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/AppUsers/currentUser', {
        responses: {
            '200': {
                description: 'Success',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(AppUserModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({
        resource: 'appUser',
        allowedRoles: ['$authenticated', 'Administrator'],
    })
    async currentUser(
        @param.query.object('filter') filter: any
    ): Promise<AppUser> {
        return this.repository.currentUser(
            filter,

            { request: this.req, response: this.res }
        );
    }
}
