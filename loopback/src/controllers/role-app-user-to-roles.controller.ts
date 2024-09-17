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
import { RoleModel, AppUserToRoleModel } from '../models';
import { RoleRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Role')
@authenticate('apex-auth')
export class RoleAppUserToRolesController {
    constructor(
        @repository(RoleRepository) protected roleRepository: RoleRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Roles/{id}/appUserToRoles', {
        responses: {
            '200': {
                description: 'Array of Role has many AppUserToRole',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(AppUserToRoleModel),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async find(
        @param.path.number('id') id: typeof RoleModel.prototype.id,
        @param.query.object('filter') filter?: Filter<AppUserToRoleModel>
    ): Promise<AppUserToRoleModel[]> {
        return this.roleRepository
            .appUserToRoles(id)
            .find(filter, { request: this.req, response: this.res });
    }

    @post('/api/Roles/{id}/appUserToRoles', {
        responses: {
            '200': {
                description: 'Role model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(AppUserToRoleModel),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async create(
        @param.path.number('id') id: typeof RoleModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(AppUserToRoleModel, {
                        title: 'NewAppUserToRoleInRole',
                        exclude: ['id'],
                        optional: ['roleId'],
                    }),
                },
            },
        })
        appUserToRole: Omit<AppUserToRoleModel, 'id'>
    ): Promise<AppUserToRoleModel> {
        return this.roleRepository
            .appUserToRoles(id)
            .create(appUserToRole, { request: this.req, response: this.res });
    }

    @patch('/api/Roles/{id}/appUserToRoles', {
        responses: {
            '200': {
                description: 'Role.AppUserToRole PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async patch(
        @param.path.number('id') id: typeof RoleModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(AppUserToRoleModel, {
                        partial: true,
                    }),
                },
            },
        })
        appUserToRole: Partial<AppUserToRoleModel>,
        @param.query.object('where', getWhereSchemaFor(AppUserToRoleModel))
        where?: Where<AppUserToRoleModel>
    ): Promise<Count> {
        return this.roleRepository
            .appUserToRoles(id)
            .patch(appUserToRole, where);
    }

    @del('/api/Roles/{id}/appUserToRoles', {
        responses: {
            '200': {
                description: 'Role.AppUserToRole DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'appUserToRole', allowedRoles: ['Administrator'] })
    async delete(
        @param.path.number('id') id: typeof RoleModel.prototype.id,
        @param.query.object('where', getWhereSchemaFor(AppUserToRoleModel))
        where?: Where<AppUserToRoleModel>
    ): Promise<Count> {
        return this.roleRepository.appUserToRoles(id).delete(where);
    }
}
