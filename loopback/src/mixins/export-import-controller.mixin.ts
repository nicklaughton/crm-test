// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
    Count,
    CountSchema,
    Filter,
    FilterExcludingWhere,
    repository,
    Where,
    Model,
} from '@loopback/repository';
import {
    post,
    param,
    get,
    getModelSchemaRef,
    patch,
    put,
    del,
    requestBody,
} from '@loopback/rest';
import { MixinTarget } from '@loopback/core';
import { BaseEntity } from '../models/base-entity';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';

export function ExportImportControllerMixin<
    M extends Model,
    T extends MixinTarget<object>,
    CL extends typeof BaseEntity
>(
    superClass: T,
    resourceName: string,
    pluralName: string,
    modelClass: CL,
    Model: any,
    mixinOptions: any
) {
    class MixedController extends superClass {
        public repository: any;
        public req: any;
        public res: any;

        @get('/api/' + pluralName + '/{id}/export', {
            responses: {
                '200': {
                    description: 'Success',
                    content: {
                        'application/json': { schema: { type: 'object' } },
                    },
                },
            },
        })
        @authorize({ resource: resourceName, allowedRoles: ['Administrator'] })
        async export(
            @param.path.string('id') id: string | number
        ): Promise<any> {
            let model = await Model.findById(
                id,
                {},
                { request: this.req, response: this.res }
            );

            return this.repository.export(
                model,

                { request: this.req, response: this.res }
            );
        }

        @post('/api/' + pluralName + '/import', {
            responses: {
                '200': {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: getModelSchemaRef(modelClass, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        })
        @authorize({ resource: resourceName, allowedRoles: ['Administrator'] })
        async import(
            @requestBody({
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                exportData: {
                                    type: 'object',
                                },
                            },
                        },
                    },
                },
            })
            body: any
        ): Promise<typeof Model> {
            return this.repository.import(
                body.exportData,

                { request: this.req, response: this.res }
            );
        }

        @get('/api/' + pluralName + '/exportMany', {
            responses: {
                '200': {
                    description: 'Success',
                },
            },
        })
        @authorize({ resource: resourceName, allowedRoles: ['Administrator'] })
        async exportMany(
            @param.query.object('where') where: any
        ): Promise<void> {
            return this.repository.exportMany(
                where,

                { request: this.req, response: this.res }
            );
        }
    }
    return MixedController;
}
