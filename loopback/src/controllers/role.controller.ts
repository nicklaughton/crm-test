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

import { RoleModel } from '../models';

import { RoleRepository } from '../repositories';
import { Role } from '../objects/role';
import { RoleArray } from '../objects/role-array';

import { ExportImportControllerMixin } from '../mixins/export-import-controller.mixin';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('Role')
@authenticate('apex-auth')
export class RoleController extends ExportImportControllerMixin<
    RoleModel,
    Constructor<Object>,
    typeof RoleModel
>(Object, 'role', 'Roles', RoleModel, Role, {
    keyProperties: ['name'],
}) {
    constructor(
        @repository(RoleRepository)
        public repository: RoleRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {
        super();
    }

    @post('/api/Roles', {
        responses: {
            '200': {
                description: 'Role model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(RoleModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(RoleModel),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'role', allowedRoles: ['Administrator'] })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(RoleModel, {
                                title: 'NewRole',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(RoleModel, {
                                    title: 'NewRole',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<RoleModel, 'id'> | Omit<RoleModel, 'id'>[]
    ): Promise<RoleModel | RoleModel[] | Role | RoleArray> {
        if (data instanceof Array)
            return this.repository.createAll(data as RoleModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return Role.createWithChildren<Role>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/Roles/count', {
        responses: {
            '200': {
                description: 'Role model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({
        resource: 'role',
        allowedRoles: ['Administrator', '$authenticated'],
    })
    async count(
        @param.where(RoleModel) where?: Where<RoleModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Roles', {
        responses: {
            '200': {
                description: 'Array of Role model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(RoleModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({
        resource: 'role',
        allowedRoles: ['Administrator', '$authenticated'],
    })
    async find(
        @param.query.object('filter', getLegacyFilterSchemaFor(RoleModel))
        filter?: Filter<RoleModel>
    ): Promise<RoleModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Roles', {
        responses: {
            '200': {
                description: 'Role PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'role', allowedRoles: ['Administrator'] })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(RoleModel, { partial: true }),
                },
            },
        })
        @param.where(RoleModel)
        where: Where<RoleModel>,
        role: RoleModel
    ): Promise<Count> {
        return this.repository.updateAll(role, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Roles/{id}', {
        responses: {
            '200': {
                description: 'Role model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(RoleModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({
        resource: 'role',
        allowedRoles: ['Administrator', '$authenticated'],
    })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(RoleModel, {exclude: 'where'}) filter?: FilterExcludingWhere<RoleModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(RoleModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<RoleModel>
    ): Promise<RoleModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Roles/{id}', {
        responses: {
            '204': {
                description: 'Role PATCH success',
            },
        },
    })
    @authorize({ resource: 'role', allowedRoles: ['Administrator'] })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(RoleModel, { partial: true }),
                },
            },
        })
        role: RoleModel
    ): Promise<RoleModel> {
        await this.repository.updateById(id, role, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/Roles/{id}', {
        responses: {
            '204': {
                description: 'Role PUT success',
            },
        },
    })
    @authorize({ resource: 'role', allowedRoles: ['Administrator'] })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() role: RoleModel
    ): Promise<RoleModel> {
        await this.repository.replaceById(id, role, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/Roles/{id}', {
        responses: {
            '204': {
                description: 'Role DELETE success',
            },
        },
    })
    @authorize({ resource: 'role', allowedRoles: ['Administrator'] })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/Roles', {
        responses: {
            '200': {
                description: 'Roles DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'role', allowedRoles: ['Administrator'] })
    async delete(
        @param.query.object('where', getWhereSchemaFor(RoleModel))
        where?: Where<RoleModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }
}
