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

import { ContactModel } from '../models';

import { ContactRepository } from '../repositories';
import { Contact } from '../objects/contact';
import { ContactArray } from '../objects/contact-array';

import { ExportImportControllerMixin } from '../mixins/export-import-controller.mixin';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('Contact')
@authenticate('apex-auth')
export class ContactController extends ExportImportControllerMixin<
    ContactModel,
    Constructor<Object>,
    typeof ContactModel
>(Object, 'contact', 'Contacts', ContactModel, Contact, {
    keyProperties: ['name', 'companyId'],
    includeRelationships: ['image'],
}) {
    constructor(
        @repository(ContactRepository)
        public repository: ContactRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {
        super();
    }

    @post('/api/Contacts', {
        responses: {
            '200': {
                description: 'Contact model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(ContactModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(ContactModel),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(ContactModel, {
                                title: 'NewContact',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(ContactModel, {
                                    title: 'NewContact',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<ContactModel, 'id'> | Omit<ContactModel, 'id'>[]
    ): Promise<ContactModel | ContactModel[] | Contact | ContactArray> {
        if (data instanceof Array)
            return this.repository.createAll(data as ContactModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return Contact.createWithChildren<Contact>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/Contacts/count', {
        responses: {
            '200': {
                description: 'Contact model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async count(
        @param.where(ContactModel) where?: Where<ContactModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Contacts', {
        responses: {
            '200': {
                description: 'Array of Contact model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(ContactModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async find(
        @param.query.object('filter', getLegacyFilterSchemaFor(ContactModel))
        filter?: Filter<ContactModel>
    ): Promise<ContactModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Contacts', {
        responses: {
            '200': {
                description: 'Contact PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ContactModel, { partial: true }),
                },
            },
        })
        @param.where(ContactModel)
        where: Where<ContactModel>,
        contact: ContactModel
    ): Promise<Count> {
        return this.repository.updateAll(contact, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Contacts/{id}', {
        responses: {
            '200': {
                description: 'Contact model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(ContactModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(ContactModel, {exclude: 'where'}) filter?: FilterExcludingWhere<ContactModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(ContactModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<ContactModel>
    ): Promise<ContactModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Contacts/{id}', {
        responses: {
            '204': {
                description: 'Contact PATCH success',
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ContactModel, { partial: true }),
                },
            },
        })
        contact: ContactModel
    ): Promise<ContactModel> {
        await this.repository.updateById(id, contact, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/Contacts/{id}', {
        responses: {
            '204': {
                description: 'Contact PUT success',
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() contact: ContactModel
    ): Promise<ContactModel> {
        await this.repository.replaceById(id, contact, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/Contacts/{id}', {
        responses: {
            '204': {
                description: 'Contact DELETE success',
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/Contacts', {
        responses: {
            '200': {
                description: 'Contacts DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async delete(
        @param.query.object('where', getWhereSchemaFor(ContactModel))
        where?: Where<ContactModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }
}
