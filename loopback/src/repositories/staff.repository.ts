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

import { StaffRelations, StaffModel, ProjectModel } from '../models';

import { ADApplication } from '../application';

import { Staff } from '../objects/staff';
import { StaffArray } from '../objects/staff-array';
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

import { ProjectRepository } from './project.repository';
import { NickCrm20242DataSource } from '../datasources';

import { ExportImportRepositoryMixin } from '../mixins/export-import-repository.mixin';

const Debug = require('debug')('NickCrm20242:Staff');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class StaffRepository extends ExportImportRepositoryMixin<
    StaffModel,
    Constructor<
        BaseCrudRepository<
            StaffModel,
            typeof StaffModel.prototype.id,
            StaffRelations
        >
    >,
    StaffRelations
>(BaseCrudRepository, Staff, {
    keyProperties: ['name'],
}) {
    public readonly projects: HasManyRepositoryFactory<
        ProjectModel,
        typeof StaffModel.prototype.id
    >;

    constructor(
        @inject('datasources.nick-crm-2024-2')
        dataSource: NickCrm20242DataSource,

        @repository.getter('ProjectRepository')
        protected projectRepositoryGetter: Getter<ProjectRepository>,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, StaffModel, dataSource);

        this.projects = this.createHasManyRepositoryFactoryFor(
            'projects',
            projectRepositoryGetter
        );
        this.registerInclusionResolver(
            'projects',
            this.projects.inclusionResolver
        );
    }

    definePersistedModel(
        entityClass: typeof StaffModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        return modelClass;
    }
}
