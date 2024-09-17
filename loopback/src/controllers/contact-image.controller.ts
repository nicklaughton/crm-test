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
import { ContactModel, ImageModel } from '../models';
import { ContactRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { oas } from '@loopback/rest';

@oas.tags('Contact')
@authenticate('apex-auth')
export class ContactImageController {
    constructor(
        @repository(ContactRepository)
        protected contactRepository: ContactRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) private res: Response
    ) {}

    @get('/api/Contacts/{id}/image', {
        responses: {
            '200': {
                description: 'Array of Contact has one Image',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(ImageModel),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async find(
        @param.path.number('id') id: typeof ContactModel.prototype.id,
        @param.query.object('filter') filter?: Filter<ImageModel>
    ): Promise<ImageModel> {
        return this.contactRepository
            .image(id)
            .get(filter, { request: this.req, response: this.res });
    }

    @post('/api/Contacts/{id}/image', {
        responses: {
            '200': {
                description: 'Contact model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(ImageModel),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async create(
        @param.path.number('id') id: typeof ContactModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ImageModel, {
                        title: 'NewImageInContact',
                        exclude: ['id'],
                        optional: ['contactId'],
                    }),
                },
            },
        })
        image: Omit<ImageModel, 'id'>
    ): Promise<ImageModel> {
        return this.contactRepository
            .image(id)
            .create(image, { request: this.req, response: this.res });
    }

    @patch('/api/Contacts/{id}/image', {
        responses: {
            '200': {
                description: 'Contact.Image PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async patch(
        @param.path.number('id') id: typeof ContactModel.prototype.id,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ImageModel, { partial: true }),
                },
            },
        })
        image: Partial<ImageModel>,
        @param.query.object('where', getWhereSchemaFor(ImageModel))
        where?: Where<ImageModel>
    ): Promise<Count> {
        return this.contactRepository.image(id).patch(image, where);
    }

    @del('/api/Contacts/{id}/image', {
        responses: {
            '200': {
                description: 'Contact.Image DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async delete(
        @param.path.number('id') id: typeof ContactModel.prototype.id,
        @param.query.object('where', getWhereSchemaFor(ImageModel))
        where?: Where<ImageModel>
    ): Promise<Count> {
        return this.contactRepository.image(id).delete(where);
    }
}
