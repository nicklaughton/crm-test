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
import { CompanyModel, IndustryModel } from '../models';
import { CompanyRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Company')
@authenticate('apex-auth')
export class CompanyIndustryController {
    constructor(
        @repository(CompanyRepository)
        public companyRepository: CompanyRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Companies/{id}/industry', {
        responses: {
            '200': {
                description: 'Industry belonging to Company',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(IndustryModel),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'industry', allowedRoles: ['$authenticated'] })
    async getIndustry(
        @param.path.number('id') id: typeof CompanyModel.prototype.id
    ): Promise<IndustryModel> {
        return this.companyRepository.industry(id);
    }
}
