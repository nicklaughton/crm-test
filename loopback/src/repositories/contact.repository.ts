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

import {
    ContactRelations,
    ContactModel,
    CompanyModel,
    ImageModel,
} from '../models';

import { ADApplication } from '../application';

import { Contact } from '../objects/contact';
import { ContactArray } from '../objects/contact-array';
import { Company } from '../objects/company';
import { CompanyArray } from '../objects/company-array';
import { Image } from '../objects/image';
import { ImageArray } from '../objects/image-array';

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

import { ImageRepository } from './image.repository';

import { CompanyRepository } from './company.repository';
import { NickCrm20242DataSource } from '../datasources';

import { ExportImportRepositoryMixin } from '../mixins/export-import-repository.mixin';

const Debug = require('debug')('NickCrm20242:Contact');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class ContactRepository extends ExportImportRepositoryMixin<
    ContactModel,
    Constructor<
        BaseCrudRepository<
            ContactModel,
            typeof ContactModel.prototype.id,
            ContactRelations
        >
    >,
    ContactRelations
>(BaseCrudRepository, Contact, {
    keyProperties: ['name', 'companyId'],
    includeRelationships: ['image'],
}) {
    public readonly image: HasOneRepositoryFactory<
        ImageModel,
        typeof ContactModel.prototype.id
    >;

    public readonly company: BelongsToAccessor<
        CompanyModel,
        typeof ContactModel.prototype.id
    >;

    constructor(
        @inject('datasources.nick-crm-2024-2')
        dataSource: NickCrm20242DataSource,

        @repository.getter('ImageRepository')
        protected imageRepositoryGetter: Getter<ImageRepository>,

        @repository.getter('CompanyRepository')
        protected companyRepositoryGetter: Getter<CompanyRepository>,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, ContactModel, dataSource);

        this.image = this.createHasOneRepositoryFactoryFor(
            'image',
            imageRepositoryGetter
        );
        this.registerInclusionResolver('image', this.image.inclusionResolver);

        this.company = this.createBelongsToAccessorFor(
            'company',
            companyRepositoryGetter
        );
        this.registerInclusionResolver(
            'company',
            this.company.inclusionResolver
        );
    }

    definePersistedModel(
        entityClass: typeof ContactModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        return modelClass;
    }
}
