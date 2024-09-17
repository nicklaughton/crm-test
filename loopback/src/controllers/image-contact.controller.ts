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
import { ImageModel, ContactModel } from '../models';
import { ImageRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Image')
@authenticate('apex-auth')
export class ImageContactController {
    constructor(
        @repository(ImageRepository)
        public imageRepository: ImageRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Images/{id}/contact', {
        responses: {
            '200': {
                description: 'Contact belonging to Image',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(ContactModel),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'contact', allowedRoles: ['$authenticated'] })
    async getContact(
        @param.path.number('id') id: typeof ImageModel.prototype.id
    ): Promise<ContactModel> {
        return this.imageRepository.contact(id);
    }
}
