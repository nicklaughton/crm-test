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

import { AppUserToRoleModel } from '../models';

import { AppUserToRoleRepository } from '../repositories';
import { AppUserToRole } from '../objects/app-user-to-role';
import { AppUserToRoleArray } from '../objects/app-user-to-role-array';

import { ExportImportControllerMixin } from '../mixins/export-import-controller.mixin';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('App User To Role')
@authenticate('apex-auth')
export class AppUserToRoleController extends ExportImportControllerMixin<
    AppUserToRoleModel,
    Constructor<Object>,
    typeof AppUserToRoleModel
>(
    Object,
    'appUserToRole',
    'AppUserToRoles',
    AppUserToRoleModel,
    AppUserToRole,
    {
        keyProperties: ['appUserId', 'roleId'],
        referenceRelationships: ['role'],
    }
) {
    constructor(
        @repository(AppUserToRoleRepository)
        public repository: AppUserToRoleRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {
        super();
    }

    @post('/api/AppUserToRoles', {
        responses: {
            '200': {
                description:
                    'AppUserToRole model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(AppUserToRoleModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(
                                        AppUserToRoleModel
                                    ),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(AppUserToRoleModel, {
                                title: 'NewAppUserToRole',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(AppUserToRoleModel, {
                                    title: 'NewAppUserToRole',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<AppUserToRoleModel, 'id'> | Omit<AppUserToRoleModel, 'id'>[]
    ): Promise<
        | AppUserToRoleModel
        | AppUserToRoleModel[]
        | AppUserToRole
        | AppUserToRoleArray
    > {
        if (data instanceof Array)
            return this.repository.createAll(data as AppUserToRoleModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return AppUserToRole.createWithChildren<AppUserToRole>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/AppUserToRoles/count', {
        responses: {
            '200': {
                description: 'AppUserToRole model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async count(
        @param.where(AppUserToRoleModel) where?: Where<AppUserToRoleModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/AppUserToRoles', {
        responses: {
            '200': {
                description: 'Array of AppUserToRole model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(AppUserToRoleModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async find(
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(AppUserToRoleModel)
        )
        filter?: Filter<AppUserToRoleModel>
    ): Promise<AppUserToRoleModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/AppUserToRoles', {
        responses: {
            '200': {
                description: 'AppUserToRole PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(AppUserToRoleModel, {
                        partial: true,
                    }),
                },
            },
        })
        @param.where(AppUserToRoleModel)
        where: Where<AppUserToRoleModel>,
        appUserToRole: AppUserToRoleModel
    ): Promise<Count> {
        return this.repository.updateAll(appUserToRole, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/AppUserToRoles/{id}', {
        responses: {
            '200': {
                description: 'AppUserToRole model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(AppUserToRoleModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(AppUserToRoleModel, {exclude: 'where'}) filter?: FilterExcludingWhere<AppUserToRoleModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(AppUserToRoleModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<AppUserToRoleModel>
    ): Promise<AppUserToRoleModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/AppUserToRoles/{id}', {
        responses: {
            '204': {
                description: 'AppUserToRole PATCH success',
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(AppUserToRoleModel, {
                        partial: true,
                    }),
                },
            },
        })
        appUserToRole: AppUserToRoleModel
    ): Promise<AppUserToRoleModel> {
        await this.repository.updateById(id, appUserToRole, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/AppUserToRoles/{id}', {
        responses: {
            '204': {
                description: 'AppUserToRole PUT success',
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() appUserToRole: AppUserToRoleModel
    ): Promise<AppUserToRoleModel> {
        await this.repository.replaceById(id, appUserToRole, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/AppUserToRoles/{id}', {
        responses: {
            '204': {
                description: 'AppUserToRole DELETE success',
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/AppUserToRoles', {
        responses: {
            '200': {
                description: 'AppUserToRoles DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async delete(
        @param.query.object('where', getWhereSchemaFor(AppUserToRoleModel))
        where?: Where<AppUserToRoleModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }
}
