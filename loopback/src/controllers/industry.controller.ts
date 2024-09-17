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

import { IndustryModel } from '../models';

import { IndustryRepository } from '../repositories';
import { Industry } from '../objects/industry';
import { IndustryArray } from '../objects/industry-array';

import { ExportImportControllerMixin } from '../mixins/export-import-controller.mixin';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('Industry')
@authenticate('apex-auth')
export class IndustryController extends ExportImportControllerMixin<
    IndustryModel,
    Constructor<Object>,
    typeof IndustryModel
>(Object, 'industry', 'Industries', IndustryModel, Industry, {
    keyProperties: ['name'],
    includeRelationships: ['companies'],
}) {
    constructor(
        @repository(IndustryRepository)
        public repository: IndustryRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {
        super();
    }

    @post('/api/Industries', {
        responses: {
            '200': {
                description: 'Industry model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(IndustryModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(IndustryModel),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'industry', allowedRoles: ['$authenticated'] })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(IndustryModel, {
                                title: 'NewIndustry',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(IndustryModel, {
                                    title: 'NewIndustry',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<IndustryModel, 'id'> | Omit<IndustryModel, 'id'>[]
    ): Promise<IndustryModel | IndustryModel[] | Industry | IndustryArray> {
        if (data instanceof Array)
            return this.repository.createAll(data as IndustryModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return Industry.createWithChildren<Industry>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/Industries/count', {
        responses: {
            '200': {
                description: 'Industry model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'industry', allowedRoles: ['$authenticated'] })
    async count(
        @param.where(IndustryModel) where?: Where<IndustryModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Industries', {
        responses: {
            '200': {
                description: 'Array of Industry model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(IndustryModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'industry', allowedRoles: ['$authenticated'] })
    async find(
        @param.query.object('filter', getLegacyFilterSchemaFor(IndustryModel))
        filter?: Filter<IndustryModel>
    ): Promise<IndustryModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Industries', {
        responses: {
            '200': {
                description: 'Industry PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'industry', allowedRoles: ['$authenticated'] })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(IndustryModel, { partial: true }),
                },
            },
        })
        @param.where(IndustryModel)
        where: Where<IndustryModel>,
        industry: IndustryModel
    ): Promise<Count> {
        return this.repository.updateAll(industry, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Industries/{id}', {
        responses: {
            '200': {
                description: 'Industry model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(IndustryModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'industry', allowedRoles: ['$authenticated'] })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(IndustryModel, {exclude: 'where'}) filter?: FilterExcludingWhere<IndustryModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(IndustryModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<IndustryModel>
    ): Promise<IndustryModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Industries/{id}', {
        responses: {
            '204': {
                description: 'Industry PATCH success',
            },
        },
    })
    @authorize({ resource: 'industry', allowedRoles: ['$authenticated'] })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(IndustryModel, { partial: true }),
                },
            },
        })
        industry: IndustryModel
    ): Promise<IndustryModel> {
        await this.repository.updateById(id, industry, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/Industries/{id}', {
        responses: {
            '204': {
                description: 'Industry PUT success',
            },
        },
    })
    @authorize({ resource: 'industry', allowedRoles: ['$authenticated'] })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() industry: IndustryModel
    ): Promise<IndustryModel> {
        await this.repository.replaceById(id, industry, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/Industries/{id}', {
        responses: {
            '204': {
                description: 'Industry DELETE success',
            },
        },
    })
    @authorize({ resource: 'industry', allowedRoles: ['$authenticated'] })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/Industries', {
        responses: {
            '200': {
                description: 'Industries DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'industry', allowedRoles: ['$authenticated'] })
    async delete(
        @param.query.object('where', getWhereSchemaFor(IndustryModel))
        where?: Where<IndustryModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }
}
