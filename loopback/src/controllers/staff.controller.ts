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

import { StaffModel } from '../models';

import { StaffRepository } from '../repositories';
import { Staff } from '../objects/staff';
import { StaffArray } from '../objects/staff-array';

import { ExportImportControllerMixin } from '../mixins/export-import-controller.mixin';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('Staff')
@authenticate('apex-auth')
export class StaffController extends ExportImportControllerMixin<
    StaffModel,
    Constructor<Object>,
    typeof StaffModel
>(Object, 'staff', 'Staff', StaffModel, Staff, {
    keyProperties: ['name'],
}) {
    constructor(
        @repository(StaffRepository)
        public repository: StaffRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {
        super();
    }

    @post('/api/Staff', {
        responses: {
            '200': {
                description: 'Staff model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(StaffModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(StaffModel),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'staff', allowedRoles: ['$authenticated'] })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(StaffModel, {
                                title: 'NewStaff',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(StaffModel, {
                                    title: 'NewStaff',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<StaffModel, 'id'> | Omit<StaffModel, 'id'>[]
    ): Promise<StaffModel | StaffModel[] | Staff | StaffArray> {
        if (data instanceof Array)
            return this.repository.createAll(data as StaffModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return Staff.createWithChildren<Staff>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/Staff/count', {
        responses: {
            '200': {
                description: 'Staff model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'staff', allowedRoles: ['$authenticated'] })
    async count(
        @param.where(StaffModel) where?: Where<StaffModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Staff', {
        responses: {
            '200': {
                description: 'Array of Staff model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(StaffModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'staff', allowedRoles: ['$authenticated'] })
    async find(
        @param.query.object('filter', getLegacyFilterSchemaFor(StaffModel))
        filter?: Filter<StaffModel>
    ): Promise<StaffModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Staff', {
        responses: {
            '200': {
                description: 'Staff PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'staff', allowedRoles: ['$authenticated'] })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(StaffModel, { partial: true }),
                },
            },
        })
        @param.where(StaffModel)
        where: Where<StaffModel>,
        staff: StaffModel
    ): Promise<Count> {
        return this.repository.updateAll(staff, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Staff/{id}', {
        responses: {
            '200': {
                description: 'Staff model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(StaffModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'staff', allowedRoles: ['$authenticated'] })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(StaffModel, {exclude: 'where'}) filter?: FilterExcludingWhere<StaffModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(StaffModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<StaffModel>
    ): Promise<StaffModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Staff/{id}', {
        responses: {
            '204': {
                description: 'Staff PATCH success',
            },
        },
    })
    @authorize({ resource: 'staff', allowedRoles: ['$authenticated'] })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(StaffModel, { partial: true }),
                },
            },
        })
        staff: StaffModel
    ): Promise<StaffModel> {
        await this.repository.updateById(id, staff, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/Staff/{id}', {
        responses: {
            '204': {
                description: 'Staff PUT success',
            },
        },
    })
    @authorize({ resource: 'staff', allowedRoles: ['$authenticated'] })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() staff: StaffModel
    ): Promise<StaffModel> {
        await this.repository.replaceById(id, staff, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/Staff/{id}', {
        responses: {
            '204': {
                description: 'Staff DELETE success',
            },
        },
    })
    @authorize({ resource: 'staff', allowedRoles: ['$authenticated'] })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/Staff', {
        responses: {
            '200': {
                description: 'Staff DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'staff', allowedRoles: ['$authenticated'] })
    async delete(
        @param.query.object('where', getWhereSchemaFor(StaffModel))
        where?: Where<StaffModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }
}
