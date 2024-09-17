// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

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

import { RoleRelations, RoleModel, AppUserToRoleModel } from '../models';

import { ADApplication } from '../application';

import { Role } from '../objects/role';
import { RoleArray } from '../objects/role-array';
import { AppUserToRole } from '../objects/app-user-to-role';
import { AppUserToRoleArray } from '../objects/app-user-to-role-array';

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

import { AppUserToRoleRepository } from './app-user-to-role.repository';
import { MemoryDataSource } from '../datasources';

import { ExportImportRepositoryMixin } from '../mixins/export-import-repository.mixin';

const Debug = require('debug')('Loopback4BaseLibrary:Role');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class RoleRepository extends ExportImportRepositoryMixin<
    RoleModel,
    Constructor<
        BaseCrudRepository<
            RoleModel,
            typeof RoleModel.prototype.id,
            RoleRelations
        >
    >,
    RoleRelations
>(BaseCrudRepository, Role, {
    keyProperties: ['name'],
}) {
    public readonly appUserToRoles: HasManyRepositoryFactory<
        AppUserToRoleModel,
        typeof RoleModel.prototype.id
    >;

    constructor(
        @inject('datasources.memory') dataSource: MemoryDataSource,

        @repository.getter('AppUserToRoleRepository')
        protected appUserToRoleRepositoryGetter: Getter<AppUserToRoleRepository>,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, RoleModel, dataSource);

        this.appUserToRoles = this.createHasManyRepositoryFactoryFor(
            'appUserToRoles',
            appUserToRoleRepositoryGetter
        );
        this.registerInclusionResolver(
            'appUserToRoles',
            this.appUserToRoles.inclusionResolver
        );
    }

    definePersistedModel(
        entityClass: typeof RoleModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        return modelClass;
    }
}
