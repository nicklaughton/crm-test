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

import { CompanyModel } from '../models';

import { CompanyRepository } from '../repositories';
import { Company } from '../objects/company';
import { CompanyArray } from '../objects/company-array';

import { ExportImportControllerMixin } from '../mixins/export-import-controller.mixin';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('Company')
@authenticate('apex-auth')
export class CompanyController extends ExportImportControllerMixin<
    CompanyModel,
    Constructor<Object>,
    typeof CompanyModel
>(Object, 'company', 'Companies', CompanyModel, Company, {
    keyProperties: ['name', 'industryId'],
    includeRelationships: ['contacts', 'projects'],
    referenceRelationships: ['industry'],
}) {
    constructor(
        @repository(CompanyRepository)
        public repository: CompanyRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {
        super();
    }

    @post('/api/Companies', {
        responses: {
            '200': {
                description: 'Company model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(CompanyModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(CompanyModel),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(CompanyModel, {
                                title: 'NewCompany',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(CompanyModel, {
                                    title: 'NewCompany',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<CompanyModel, 'id'> | Omit<CompanyModel, 'id'>[]
    ): Promise<CompanyModel | CompanyModel[] | Company | CompanyArray> {
        if (data instanceof Array)
            return this.repository.createAll(data as CompanyModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return Company.createWithChildren<Company>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/Companies/count', {
        responses: {
            '200': {
                description: 'Company model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async count(
        @param.where(CompanyModel) where?: Where<CompanyModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Companies', {
        responses: {
            '200': {
                description: 'Array of Company model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(CompanyModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async find(
        @param.query.object('filter', getLegacyFilterSchemaFor(CompanyModel))
        filter?: Filter<CompanyModel>
    ): Promise<CompanyModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Companies', {
        responses: {
            '200': {
                description: 'Company PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CompanyModel, { partial: true }),
                },
            },
        })
        @param.where(CompanyModel)
        where: Where<CompanyModel>,
        company: CompanyModel
    ): Promise<Count> {
        return this.repository.updateAll(company, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Companies/{id}', {
        responses: {
            '200': {
                description: 'Company model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(CompanyModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(CompanyModel, {exclude: 'where'}) filter?: FilterExcludingWhere<CompanyModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(CompanyModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<CompanyModel>
    ): Promise<CompanyModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Companies/{id}', {
        responses: {
            '204': {
                description: 'Company PATCH success',
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CompanyModel, { partial: true }),
                },
            },
        })
        company: CompanyModel
    ): Promise<CompanyModel> {
        await this.repository.updateById(id, company, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/Companies/{id}', {
        responses: {
            '204': {
                description: 'Company PUT success',
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() company: CompanyModel
    ): Promise<CompanyModel> {
        await this.repository.replaceById(id, company, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/Companies/{id}', {
        responses: {
            '204': {
                description: 'Company DELETE success',
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/Companies', {
        responses: {
            '200': {
                description: 'Companies DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async delete(
        @param.query.object('where', getWhereSchemaFor(CompanyModel))
        where?: Where<CompanyModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }
}
