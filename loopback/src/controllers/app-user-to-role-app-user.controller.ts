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
import { AppUserToRoleModel, AppUserModel } from '../models';
import { AppUserToRoleRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('App User To Role')
@authenticate('apex-auth')
export class AppUserToRoleAppUserController {
    constructor(
        @repository(AppUserToRoleRepository)
        public appUserToRoleRepository: AppUserToRoleRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/AppUserToRoles/{id}/appUser', {
        responses: {
            '200': {
                description: 'AppUser belonging to AppUserToRole',
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
        @param.path.number('id') id: typeof AppUserToRoleModel.prototype.id
    ): Promise<AppUserModel> {
        return this.appUserToRoleRepository.appUser(id);
    }
}
