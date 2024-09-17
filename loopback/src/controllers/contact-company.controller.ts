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
import { ContactModel, CompanyModel } from '../models';
import { ContactRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Contact')
@authenticate('apex-auth')
export class ContactCompanyController {
    constructor(
        @repository(ContactRepository)
        public contactRepository: ContactRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Contacts/{id}/company', {
        responses: {
            '200': {
                description: 'Company belonging to Contact',
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
        @param.path.number('id') id: typeof ContactModel.prototype.id
    ): Promise<CompanyModel> {
        return this.contactRepository.company(id);
    }
}
