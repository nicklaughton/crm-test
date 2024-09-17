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
import { CompanyModel, ContactModel } from '../models';
import { CompanyRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Company')
@authenticate('apex-auth')
export class CompanyContactsController {
    constructor(
        @repository(CompanyRepository)
        protected companyRepository: CompanyRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Companies/{id}/contacts', {
        responses: {
            '200': {
                description: 'Array of Company has many Contact',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(ContactModel),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async find(
        @param.path.number('id') id: typeof CompanyModel.prototype.id,
        @param.query.object('filter') filter?: Filter<ContactModel>
    ): Promise<ContactModel[]> {
        return this.companyRepository
            .contacts(id)
            .find(filter, { request: this.req, response: this.res });
    }

    @post('/api/Companies/{id}/contacts', {
        responses: {
            '200': {
                description: 'Company model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(ContactModel),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async create(
        @param.path.number('id') id: typeof CompanyModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ContactModel, {
                        title: 'NewContactInCompany',
                        exclude: ['id'],
                        optional: ['companyId'],
                    }),
                },
            },
        })
        contact: Omit<ContactModel, 'id'>
    ): Promise<ContactModel> {
        return this.companyRepository
            .contacts(id)
            .create(contact, { request: this.req, response: this.res });
    }

    @patch('/api/Companies/{id}/contacts', {
        responses: {
            '200': {
                description: 'Company.Contact PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async patch(
        @param.path.number('id') id: typeof CompanyModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ContactModel, { partial: true }),
                },
            },
        })
        contact: Partial<ContactModel>,
        @param.query.object('where', getWhereSchemaFor(ContactModel))
        where?: Where<ContactModel>
    ): Promise<Count> {
        return this.companyRepository.contacts(id).patch(contact, where);
    }

    @del('/api/Companies/{id}/contacts', {
        responses: {
            '200': {
                description: 'Company.Contact DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async delete(
        @param.path.number('id') id: typeof CompanyModel.prototype.id,
        @param.query.object('where', getWhereSchemaFor(ContactModel))
        where?: Where<ContactModel>
    ): Promise<Count> {
        return this.companyRepository.contacts(id).delete(where);
    }
}
