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
    CompanyRelations,
    CompanyModel,
    IndustryModel,
    ContactModel,
    ProjectModel,
} from '../models';

import { ADApplication } from '../application';

import { Company } from '../objects/company';
import { CompanyArray } from '../objects/company-array';
import { Industry } from '../objects/industry';
import { IndustryArray } from '../objects/industry-array';
import { Contact } from '../objects/contact';
import { ContactArray } from '../objects/contact-array';
import { Project } from '../objects/project';
import { ProjectArray } from '../objects/project-array';

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

import { ProjectRepository } from './project.repository';

import { IndustryRepository } from './industry.repository';
import { MemoryDataSource } from '../datasources';

import { ExportImportRepositoryMixin } from '../mixins/export-import-repository.mixin';

const Debug = require('debug')('NickCrm20242:Company');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class CompanyRepository extends ExportImportRepositoryMixin<
    CompanyModel,
    Constructor<
        BaseCrudRepository<
            CompanyModel,
            typeof CompanyModel.prototype.id,
            CompanyRelations
        >
    >,
    CompanyRelations
>(BaseCrudRepository, Company, {
    keyProperties: ['name', 'industryId'],
    includeRelationships: ['contacts', 'projects'],
    referenceRelationships: ['industry'],
}) {
    public readonly contacts: HasManyRepositoryFactory<
        ContactModel,
        typeof CompanyModel.prototype.id
    >;

    public readonly projects: HasManyRepositoryFactory<
        ProjectModel,
        typeof CompanyModel.prototype.id
    >;

    public readonly industry: BelongsToAccessor<
        IndustryModel,
        typeof CompanyModel.prototype.id
    >;

    constructor(
        @inject('datasources.memory') dataSource: MemoryDataSource,

        @repository.getter('ContactRepository')
        protected contactRepositoryGetter: Getter<ContactRepository>,

        @repository.getter('ProjectRepository')
        protected projectRepositoryGetter: Getter<ProjectRepository>,

        @repository.getter('IndustryRepository')
        protected industryRepositoryGetter: Getter<IndustryRepository>,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, CompanyModel, dataSource);

        this.contacts = this.createHasManyRepositoryFactoryFor(
            'contacts',
            contactRepositoryGetter
        );
        this.registerInclusionResolver(
            'contacts',
            this.contacts.inclusionResolver
        );

        this.projects = this.createHasManyRepositoryFactoryFor(
            'projects',
            projectRepositoryGetter
        );
        this.registerInclusionResolver(
            'projects',
            this.projects.inclusionResolver
        );

        this.industry = this.createBelongsToAccessorFor(
            'industry',
            industryRepositoryGetter
        );
        this.registerInclusionResolver(
            'industry',
            this.industry.inclusionResolver
        );
    }

    definePersistedModel(
        entityClass: typeof CompanyModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        return modelClass;
    }
}
