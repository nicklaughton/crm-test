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

import { ProjectModel } from '../models';

import { ProjectRepository } from '../repositories';
import { Project } from '../objects/project';
import { ProjectArray } from '../objects/project-array';

import { ExportImportControllerMixin } from '../mixins/export-import-controller.mixin';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('Project')
@authenticate('apex-auth')
export class ProjectController extends ExportImportControllerMixin<
    ProjectModel,
    Constructor<Object>,
    typeof ProjectModel
>(Object, 'project', 'Projects', ProjectModel, Project, {
    keyProperties: ['name', 'companyId'],
    referenceRelationships: ['projectManager'],
}) {
    constructor(
        @repository(ProjectRepository)
        public repository: ProjectRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {
        super();
    }

    @post('/api/Projects', {
        responses: {
            '200': {
                description: 'Project model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(ProjectModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(ProjectModel),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(ProjectModel, {
                                title: 'NewProject',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(ProjectModel, {
                                    title: 'NewProject',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<ProjectModel, 'id'> | Omit<ProjectModel, 'id'>[]
    ): Promise<ProjectModel | ProjectModel[] | Project | ProjectArray> {
        if (data instanceof Array)
            return this.repository.createAll(data as ProjectModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return Project.createWithChildren<Project>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/Projects/count', {
        responses: {
            '200': {
                description: 'Project model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async count(
        @param.where(ProjectModel) where?: Where<ProjectModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Projects', {
        responses: {
            '200': {
                description: 'Array of Project model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(ProjectModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async find(
        @param.query.object('filter', getLegacyFilterSchemaFor(ProjectModel))
        filter?: Filter<ProjectModel>
    ): Promise<ProjectModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Projects', {
        responses: {
            '200': {
                description: 'Project PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ProjectModel, { partial: true }),
                },
            },
        })
        @param.where(ProjectModel)
        where: Where<ProjectModel>,
        project: ProjectModel
    ): Promise<Count> {
        return this.repository.updateAll(project, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Projects/{id}', {
        responses: {
            '200': {
                description: 'Project model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(ProjectModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(ProjectModel, {exclude: 'where'}) filter?: FilterExcludingWhere<ProjectModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(ProjectModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<ProjectModel>
    ): Promise<ProjectModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Projects/{id}', {
        responses: {
            '204': {
                description: 'Project PATCH success',
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ProjectModel, { partial: true }),
                },
            },
        })
        project: ProjectModel
    ): Promise<ProjectModel> {
        await this.repository.updateById(id, project, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/Projects/{id}', {
        responses: {
            '204': {
                description: 'Project PUT success',
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() project: ProjectModel
    ): Promise<ProjectModel> {
        await this.repository.replaceById(id, project, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/Projects/{id}', {
        responses: {
            '204': {
                description: 'Project DELETE success',
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/Projects', {
        responses: {
            '200': {
                description: 'Projects DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async delete(
        @param.query.object('where', getWhereSchemaFor(ProjectModel))
        where?: Where<ProjectModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }
}
