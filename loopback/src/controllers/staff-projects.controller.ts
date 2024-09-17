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
import { StaffModel, ProjectModel } from '../models';
import { StaffRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Staff')
@authenticate('apex-auth')
export class StaffProjectsController {
    constructor(
        @repository(StaffRepository) protected staffRepository: StaffRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Staff/{id}/projects', {
        responses: {
            '200': {
                description: 'Array of Staff has many Project',
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
        @param.path.number('id') id: typeof StaffModel.prototype.id,
        @param.query.object('filter') filter?: Filter<ProjectModel>
    ): Promise<ProjectModel[]> {
        return this.staffRepository
            .projects(id)
            .find(filter, { request: this.req, response: this.res });
    }

    @post('/api/Staff/{id}/projects', {
        responses: {
            '200': {
                description: 'Staff model instance',
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
        @param.path.number('id') id: typeof StaffModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ProjectModel, {
                        title: 'NewProjectInStaff',
                        exclude: ['id'],
                        optional: ['projectManagerId'],
                    }),
                },
            },
        })
        project: Omit<ProjectModel, 'id'>
    ): Promise<ProjectModel> {
        return this.staffRepository
            .projects(id)
            .create(project, { request: this.req, response: this.res });
    }

    @patch('/api/Staff/{id}/projects', {
        responses: {
            '200': {
                description: 'Staff.Project PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async patch(
        @param.path.number('id') id: typeof StaffModel.prototype.id,
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
        return this.staffRepository.projects(id).patch(project, where);
    }

    @del('/api/Staff/{id}/projects', {
        responses: {
            '200': {
                description: 'Staff.Project DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'project', allowedRoles: ['$authenticated'] })
    async delete(
        @param.path.number('id') id: typeof StaffModel.prototype.id,
        @param.query.object('where', getWhereSchemaFor(ProjectModel))
        where?: Where<ProjectModel>
    ): Promise<Count> {
        return this.staffRepository.projects(id).delete(where);
    }
}
