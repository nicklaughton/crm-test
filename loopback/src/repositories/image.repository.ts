import {
    DefaultCrudRepository,
    repository,
    Options,
    HasOneRepositoryFactory,
    HasManyRepositoryFactory,
    BelongsToAccessor,
    juggler,
    Transaction as LoopbackTransaction,
    IsolationLevel,
} from '@loopback/repository';

import { ImageRelations, ImageModel, ContactModel } from '../models';

import { ADApplication } from '../application';

import { Image } from '../objects/image';
import { ImageArray } from '../objects/image-array';
import { Contact } from '../objects/contact';
import { ContactArray } from '../objects/contact-array';

import { BaseCrudRepository } from './base-crud.repository';
import {
    inject,
    Getter,
    Constructor,
    CoreBindings,
    Application,
    BindingScope,
    bind,
} from '@loopback/core';

import { ContactRepository } from './contact.repository';
import { NickCrm20242DataSource } from '../datasources';

import { ExportImportRepositoryMixin } from '../mixins/export-import-repository.mixin';

const Debug = require('debug')('NickCrm20242:Image');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class ImageRepository extends ExportImportRepositoryMixin<
    ImageModel,
    Constructor<
        BaseCrudRepository<
            ImageModel,
            typeof ImageModel.prototype.id,
            ImageRelations
        >
    >,
    ImageRelations
>(BaseCrudRepository, Image, {
    keyProperties: ['contactId'],
}) {
    public readonly contact: BelongsToAccessor<
        ContactModel,
        typeof ImageModel.prototype.id
    >;

    constructor(
        @inject('datasources.nick-crm-2024-2')
        dataSource: NickCrm20242DataSource,

        @repository.getter('ContactRepository')
        protected contactRepositoryGetter: Getter<ContactRepository>,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, ImageModel, dataSource);

        this.contact = this.createBelongsToAccessorFor(
            'contact',
            contactRepositoryGetter
        );
        this.registerInclusionResolver(
            'contact',
            this.contact.inclusionResolver
        );
    }

    definePersistedModel(
        entityClass: typeof ImageModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        modelClass.observe('before save', async (ctx) => {
            let data = ctx.data;

            let image = ctx.data || ctx.instance;

            const _beforeSave = async (image) => {
                if (image.base64Content === null) {
                    image.hash = null;
                    image.size = 0;
                } else {
                    let buffer = Buffer.from(image.base64Content, 'base64');
                    image.hash = require('crypto')
                        .createHash('sha1')
                        .update(buffer)
                        .digest('hex');
                    image.size = Buffer.byteLength(buffer);
                }
            };
            if (ctx.where) {
                let records: any[] = await Image.find(
                    { where: ctx.where },
                    ctx.options
                );
                await Promise.all(records.map((record) => _beforeSave(record)));
            } else {
                await _beforeSave(image);
            }
        });

        return modelClass;
    }

    async download(
        image: Image,

        options?: Options
    ): Promise<void> {
        let debug = Debug.extend('download');

        debug('image %j', image);

        options.response.writeHead(200, {
            'Content-Type': image.mimeType,
            'Cache-Control': 'max-age=315360000',
        });
        debug('headers set');

        options.response.end(Buffer.from(image.base64Content, 'base64'));
        debug('response ended');
    }
}
