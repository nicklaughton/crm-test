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

import { SupplierModel } from '../models';

import { SupplierRepository } from '../repositories';
import { Supplier } from '../objects/supplier';
import { SupplierArray } from '../objects/supplier-array';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('Supplier')
@authenticate('apex-auth')
export class SupplierController {
    constructor(
        @repository(SupplierRepository)
        public repository: SupplierRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {}

    @post('/api/Suppliers', {
        responses: {
            '200': {
                description: 'Supplier model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(SupplierModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(SupplierModel),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({
        resource: 'supplier',
        allowedRoles: ['$authenticated', '$everyone'],
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(SupplierModel, {
                                title: 'NewSupplier',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(SupplierModel, {
                                    title: 'NewSupplier',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<SupplierModel, 'id'> | Omit<SupplierModel, 'id'>[]
    ): Promise<SupplierModel | SupplierModel[] | Supplier | SupplierArray> {
        if (data instanceof Array)
            return this.repository.createAll(data as SupplierModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return Supplier.createWithChildren<Supplier>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/Suppliers/count', {
        responses: {
            '200': {
                description: 'Supplier model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({
        resource: 'supplier',
        allowedRoles: ['$authenticated', '$everyone'],
    })
    async count(
        @param.where(SupplierModel) where?: Where<SupplierModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Suppliers', {
        responses: {
            '200': {
                description: 'Array of Supplier model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(SupplierModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({
        resource: 'supplier',
        allowedRoles: ['$authenticated', '$everyone'],
    })
    async find(
        @param.query.object('filter', getLegacyFilterSchemaFor(SupplierModel))
        filter?: Filter<SupplierModel>
    ): Promise<SupplierModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Suppliers', {
        responses: {
            '200': {
                description: 'Supplier PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({
        resource: 'supplier',
        allowedRoles: ['$authenticated', '$everyone'],
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(SupplierModel, { partial: true }),
                },
            },
        })
        @param.where(SupplierModel)
        where: Where<SupplierModel>,
        supplier: SupplierModel
    ): Promise<Count> {
        return this.repository.updateAll(supplier, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Suppliers/{id}', {
        responses: {
            '200': {
                description: 'Supplier model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(SupplierModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({
        resource: 'supplier',
        allowedRoles: ['$authenticated', '$everyone'],
    })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(SupplierModel, {exclude: 'where'}) filter?: FilterExcludingWhere<SupplierModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(SupplierModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<SupplierModel>
    ): Promise<SupplierModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Suppliers/{id}', {
        responses: {
            '204': {
                description: 'Supplier PATCH success',
            },
        },
    })
    @authorize({
        resource: 'supplier',
        allowedRoles: ['$authenticated', '$everyone'],
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(SupplierModel, { partial: true }),
                },
            },
        })
        supplier: SupplierModel
    ): Promise<SupplierModel> {
        await this.repository.updateById(id, supplier, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/Suppliers/{id}', {
        responses: {
            '204': {
                description: 'Supplier PUT success',
            },
        },
    })
    @authorize({
        resource: 'supplier',
        allowedRoles: ['$authenticated', '$everyone'],
    })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() supplier: SupplierModel
    ): Promise<SupplierModel> {
        await this.repository.replaceById(id, supplier, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/Suppliers/{id}', {
        responses: {
            '204': {
                description: 'Supplier DELETE success',
            },
        },
    })
    @authorize({
        resource: 'supplier',
        allowedRoles: ['$authenticated', '$everyone'],
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/Suppliers', {
        responses: {
            '200': {
                description: 'Suppliers DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({
        resource: 'supplier',
        allowedRoles: ['$authenticated', '$everyone'],
    })
    async delete(
        @param.query.object('where', getWhereSchemaFor(SupplierModel))
        where?: Where<SupplierModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }
}
