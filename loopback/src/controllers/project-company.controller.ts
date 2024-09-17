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
import { ProjectModel, CompanyModel } from '../models';
import { ProjectRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Project')
@authenticate('apex-auth')
export class ProjectCompanyController {
    constructor(
        @repository(ProjectRepository)
        public projectRepository: ProjectRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Projects/{id}/company', {
        responses: {
            '200': {
                description: 'Company belonging to Project',
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
    async getCompany(
        @param.path.number('id') id: typeof ProjectModel.prototype.id
    ): Promise<CompanyModel> {
        return this.projectRepository.company(id);
    }
}
