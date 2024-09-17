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
import { CompanyModel, ProjectModel } from '../models';
import { CompanyRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Company')
@authenticate('apex-auth')
export class CompanyProjectsController {
    constructor(
        @repository(CompanyRepository)
        protected companyRepository: CompanyRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Companies/{id}/projects', {
        responses: {
            '200': {
                description: 'Array of Company has many Project',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(ProjectModel),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async find(
        @param.path.number('id') id: typeof CompanyModel.prototype.id,
        @param.query.object('filter') filter?: Filter<ProjectModel>
    ): Promise<ProjectModel[]> {
        return this.companyRepository
            .projects(id)
            .find(filter, { request: this.req, response: this.res });
    }

    @post('/api/Companies/{id}/projects', {
        responses: {
            '200': {
                description: 'Company model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(ProjectModel),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async create(
        @param.path.number('id') id: typeof CompanyModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ProjectModel, {
                        title: 'NewProjectInCompany',
                        exclude: ['id'],
                        optional: ['companyId'],
                    }),
                },
            },
        })
        project: Omit<ProjectModel, 'id'>
    ): Promise<ProjectModel> {
        return this.companyRepository
            .projects(id)
            .create(project, { request: this.req, response: this.res });
    }

    @patch('/api/Companies/{id}/projects', {
        responses: {
            '200': {
                description: 'Company.Project PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async patch(
        @param.path.number('id') id: typeof CompanyModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ProjectModel, { partial: true }),
                },
            },
        })
        project: Partial<ProjectModel>,
        @param.query.object('where', getWhereSchemaFor(ProjectModel))
        where?: Where<ProjectModel>
    ): Promise<Count> {
        return this.companyRepository.projects(id).patch(project, where);
    }

    @del('/api/Companies/{id}/projects', {
        responses: {
            '200': {
                description: 'Company.Project DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async delete(
        @param.path.number('id') id: typeof CompanyModel.prototype.id,
        @param.query.object('where', getWhereSchemaFor(ProjectModel))
        where?: Where<ProjectModel>
    ): Promise<Count> {
        return this.companyRepository.projects(id).delete(where);
    }
}
