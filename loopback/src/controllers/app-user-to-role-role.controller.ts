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
import { AppUserToRoleModel, RoleModel } from '../models';
import { AppUserToRoleRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('App User To Role')
@authenticate('apex-auth')
export class AppUserToRoleRoleController {
    constructor(
        @repository(AppUserToRoleRepository)
        public appUserToRoleRepository: AppUserToRoleRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/AppUserToRoles/{id}/role', {
        responses: {
            '200': {
                description: 'Role belonging to AppUserToRole',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(RoleModel),
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
    async getRole(
        @param.path.number('id') id: typeof AppUserToRoleModel.prototype.id
    ): Promise<RoleModel> {
        return this.appUserToRoleRepository.role(id);
    }
}
