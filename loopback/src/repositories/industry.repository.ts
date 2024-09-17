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

import { IndustryRelations, IndustryModel, CompanyModel } from '../models';

import { ADApplication } from '../application';

import { Industry } from '../objects/industry';
import { IndustryArray } from '../objects/industry-array';
import { Company } from '../objects/company';
import { CompanyArray } from '../objects/company-array';

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

import { CompanyRepository } from './company.repository';
import { NickCrm20242DataSource } from '../datasources';

import { ExportImportRepositoryMixin } from '../mixins/export-import-repository.mixin';

const Debug = require('debug')('NickCrm20242:Industry');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class IndustryRepository extends ExportImportRepositoryMixin<
    IndustryModel,
    Constructor<
        BaseCrudRepository<
            IndustryModel,
            typeof IndustryModel.prototype.id,
            IndustryRelations
        >
    >,
    IndustryRelations
>(BaseCrudRepository, Industry, {
    keyProperties: ['name'],
    includeRelationships: ['companies'],
}) {
    public readonly companies: HasManyRepositoryFactory<
        CompanyModel,
        typeof IndustryModel.prototype.id
    >;

    constructor(
        @inject('datasources.nick-crm-2024-2')
        dataSource: NickCrm20242DataSource,

        @repository.getter('CompanyRepository')
        protected companyRepositoryGetter: Getter<CompanyRepository>,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, IndustryModel, dataSource);

        this.companies = this.createHasManyRepositoryFactoryFor(
            'companies',
            companyRepositoryGetter
        );
        this.registerInclusionResolver(
            'companies',
            this.companies.inclusionResolver
        );
    }

    definePersistedModel(
        entityClass: typeof IndustryModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        return modelClass;
    }
}
