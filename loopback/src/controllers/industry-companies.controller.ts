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
import { IndustryModel, CompanyModel } from '../models';
import { IndustryRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Industry')
@authenticate('apex-auth')
export class IndustryCompaniesController {
    constructor(
        @repository(IndustryRepository)
        protected industryRepository: IndustryRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Industries/{id}/companies', {
        responses: {
            '200': {
                description: 'Array of Industry has many Company',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(CompanyModel),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async find(
        @param.path.number('id') id: typeof IndustryModel.prototype.id,
        @param.query.object('filter') filter?: Filter<CompanyModel>
    ): Promise<CompanyModel[]> {
        return this.industryRepository
            .companies(id)
            .find(filter, { request: this.req, response: this.res });
    }

    @post('/api/Industries/{id}/companies', {
        responses: {
            '200': {
                description: 'Industry model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(CompanyModel),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async create(
        @param.path.number('id') id: typeof IndustryModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CompanyModel, {
                        title: 'NewCompanyInIndustry',
                        exclude: ['id'],
                        optional: ['industryId'],
                    }),
                },
            },
        })
        company: Omit<CompanyModel, 'id'>
    ): Promise<CompanyModel> {
        return this.industryRepository
            .companies(id)
            .create(company, { request: this.req, response: this.res });
    }

    @patch('/api/Industries/{id}/companies', {
        responses: {
            '200': {
                description: 'Industry.Company PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async patch(
        @param.path.number('id') id: typeof IndustryModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CompanyModel, { partial: true }),
                },
            },
        })
        company: Partial<CompanyModel>,
        @param.query.object('where', getWhereSchemaFor(CompanyModel))
        where?: Where<CompanyModel>
    ): Promise<Count> {
        return this.industryRepository.companies(id).patch(company, where);
    }

    @del('/api/Industries/{id}/companies', {
        responses: {
            '200': {
                description: 'Industry.Company DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'company', allowedRoles: ['$authenticated'] })
    async delete(
        @param.path.number('id') id: typeof IndustryModel.prototype.id,
        @param.query.object('where', getWhereSchemaFor(CompanyModel))
        where?: Where<CompanyModel>
    ): Promise<Count> {
        return this.industryRepository.companies(id).delete(where);
    }
}
