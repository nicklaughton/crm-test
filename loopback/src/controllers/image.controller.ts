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

import { ImageModel } from '../models';

import { ImageRepository } from '../repositories';
import { Image } from '../objects/image';
import { ImageArray } from '../objects/image-array';

import { ExportImportControllerMixin } from '../mixins/export-import-controller.mixin';

import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { getLegacyFilterSchemaFor } from '../utilities/legacy-filter';
import { oas } from '@loopback/rest';

@oas.tags('Image')
@authenticate('apex-auth')
export class ImageController extends ExportImportControllerMixin<
    ImageModel,
    Constructor<Object>,
    typeof ImageModel
>(Object, 'image', 'Images', ImageModel, Image, {
    keyProperties: ['contactId'],
}) {
    constructor(
        @repository(ImageRepository)
        public repository: ImageRepository,
        @inject(RestBindings.Http.REQUEST) public req: Request,
        @inject(RestBindings.Http.RESPONSE) public res: Response
    ) {
        super();
    }

    @post('/api/Images', {
        responses: {
            '200': {
                description: 'Image model instance or array of instances',
                content: {
                    'application/json': {
                        schema: {
                            anyOf: [
                                getModelSchemaRef(ImageModel),
                                {
                                    type: 'array',
                                    items: getModelSchemaRef(ImageModel),
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        anyOf: [
                            getModelSchemaRef(ImageModel, {
                                title: 'NewImage',
                                includeRelations: true,
                            }),
                            {
                                type: 'array',
                                items: getModelSchemaRef(ImageModel, {
                                    title: 'NewImage',
                                }),
                            },
                        ],
                    },
                },
            },
        })
        data: Omit<ImageModel, 'id'> | Omit<ImageModel, 'id'>[]
    ): Promise<ImageModel | ImageModel[] | Image | ImageArray> {
        if (data instanceof Array)
            return this.repository.createAll(data as ImageModel[], {
                request: this.req,
                response: this.res,
            });
        else
            return Image.createWithChildren<Image>(
                data,
                { saveAutomatically: true },
                { request: this.req, response: this.res }
            );
    }

    @get('/api/Images/count', {
        responses: {
            '200': {
                description: 'Image model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async count(
        @param.where(ImageModel) where?: Where<ImageModel>
    ): Promise<Count> {
        return this.repository.count(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Images', {
        responses: {
            '200': {
                description: 'Array of Image model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(ImageModel, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async find(
        @param.query.object('filter', getLegacyFilterSchemaFor(ImageModel))
        filter?: Filter<ImageModel>
    ): Promise<ImageModel[]> {
        return this.repository.find(filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Images', {
        responses: {
            '200': {
                description: 'Image PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ImageModel, { partial: true }),
                },
            },
        })
        @param.where(ImageModel)
        where: Where<ImageModel>,
        image: ImageModel
    ): Promise<Count> {
        return this.repository.updateAll(image, where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Images/{id}', {
        responses: {
            '200': {
                description: 'Image model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(ImageModel, {
                            includeRelations: true,
                        }),
                    },
                },
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async findById(
        @param.path.number('id') id: number,
        //@param.filter(ImageModel, {exclude: 'where'}) filter?: FilterExcludingWhere<ImageModel>
        @param.query.object(
            'filter',
            getLegacyFilterSchemaFor(ImageModel, { exclude: 'where' })
        )
        filter?: FilterExcludingWhere<ImageModel>
    ): Promise<ImageModel> {
        return this.repository.findById(id, filter, {
            request: this.req,
            response: this.res,
        });
    }

    @patch('/api/Images/{id}', {
        responses: {
            '204': {
                description: 'Image PATCH success',
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ImageModel, { partial: true }),
                },
            },
        })
        image: ImageModel
    ): Promise<ImageModel> {
        await this.repository.updateById(id, image, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @put('/api/Images/{id}', {
        responses: {
            '204': {
                description: 'Image PUT success',
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() image: ImageModel
    ): Promise<ImageModel> {
        await this.repository.replaceById(id, image, {
            request: this.req,
            response: this.res,
        });
        return this.repository.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );
    }

    @del('/api/Images/{id}', {
        responses: {
            '204': {
                description: 'Image DELETE success',
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        return this.repository.deleteById(id, {
            request: this.req,
            response: this.res,
        });
    }

    @del('/api/Images', {
        responses: {
            '200': {
                description: 'Images DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$authenticated'] })
    async delete(
        @param.query.object('where', getWhereSchemaFor(ImageModel))
        where?: Where<ImageModel>
    ): Promise<Count> {
        return this.repository.deleteAll(where, {
            request: this.req,
            response: this.res,
        });
    }

    @get('/api/Images/{id}/download', {
        responses: {
            '200': {
                description: 'Success',
            },
        },
    })
    @authorize({ resource: 'image', allowedRoles: ['$everyone'] })
    async download(@param.path.number('id') id: number): Promise<void> {
        let image: Image = await Image.findById(
            id,
            {},
            { request: this.req, response: this.res }
        );

        return this.repository.download(
            image,

            { request: this.req, response: this.res }
        );
    }
}
