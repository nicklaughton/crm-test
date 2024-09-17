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
    ProjectRelations,
    ProjectModel,
    StaffModel,
    CompanyModel,
} from '../models';

import { ADApplication } from '../application';

import { Project } from '../objects/project';
import { ProjectArray } from '../objects/project-array';
import { Staff } from '../objects/staff';
import { StaffArray } from '../objects/staff-array';
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

import { StaffRepository } from './staff.repository';

import { CompanyRepository } from './company.repository';
import { MemoryDataSource } from '../datasources';

import { ExportImportRepositoryMixin } from '../mixins/export-import-repository.mixin';

const Debug = require('debug')('NickCrm20242:Project');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class ProjectRepository extends ExportImportRepositoryMixin<
    ProjectModel,
    Constructor<
        BaseCrudRepository<
            ProjectModel,
            typeof ProjectModel.prototype.id,
            ProjectRelations
        >
    >,
    ProjectRelations
>(BaseCrudRepository, Project, {
    keyProperties: ['name', 'companyId'],
    referenceRelationships: ['projectManager'],
}) {
    public readonly projectManager: BelongsToAccessor<
        StaffModel,
        typeof ProjectModel.prototype.id
    >;

    public readonly company: BelongsToAccessor<
        CompanyModel,
        typeof ProjectModel.prototype.id
    >;

    constructor(
        @inject('datasources.memory') dataSource: MemoryDataSource,

        @repository.getter('StaffRepository')
        protected staffRepositoryGetter: Getter<StaffRepository>,

        @repository.getter('CompanyRepository')
        protected companyRepositoryGetter: Getter<CompanyRepository>,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, ProjectModel, dataSource);

        this.projectManager = this.createBelongsToAccessorFor(
            'projectManager',
            staffRepositoryGetter
        );
        this.registerInclusionResolver(
            'projectManager',
            this.projectManager.inclusionResolver
        );

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
        entityClass: typeof ProjectModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        return modelClass;
    }
}
