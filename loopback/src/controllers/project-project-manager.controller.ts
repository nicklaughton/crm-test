import { repository } from '@loopback/repository';
import {
    param,
    get,
    getModelSchemaRef,
    Request,
    Response,
    RestBindings,
} from '@loopback/rest';
import { inject } from '@loopback/core';
import { ProjectModel, StaffModel } from '../models';
import { ProjectRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Project')
@authenticate('apex-auth')
export class ProjectProjectManagerController {
    constructor(
        @repository(ProjectRepository)
        public projectRepository: ProjectRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Projects/{id}/projectManager', {
        responses: {
            '200': {
                description: 'Staff belonging to Project',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(StaffModel),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'staff', allowedRoles: ['$authenticated'] })
    async getStaff(
        @param.path.number('id') id: typeof ProjectModel.prototype.id
    ): Promise<StaffModel> {
        return this.projectRepository.projectManager(id);
    }
}
