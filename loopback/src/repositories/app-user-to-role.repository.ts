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

import {
    AppUserToRoleRelations,
    AppUserToRoleModel,
    RoleModel,
    AppUserModel,
} from '../models';

import { ADApplication } from '../application';

import { AppUserToRole } from '../objects/app-user-to-role';
import { AppUserToRoleArray } from '../objects/app-user-to-role-array';
import { Role } from '../objects/role';
import { RoleArray } from '../objects/role-array';
import { AppUser } from '../objects/app-user';
import { AppUserArray } from '../objects/app-user-array';

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

import { RoleRepository } from './role.repository';

import { AppUserRepository } from './app-user.repository';
import { NickCrm20242DataSource } from '../datasources';

import { ExportImportRepositoryMixin } from '../mixins/export-import-repository.mixin';

const Debug = require('debug')('Loopback4BaseLibrary:AppUserToRole');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class AppUserToRoleRepository extends ExportImportRepositoryMixin<
    AppUserToRoleModel,
    Constructor<
        BaseCrudRepository<
            AppUserToRoleModel,
            typeof AppUserToRoleModel.prototype.id,
            AppUserToRoleRelations
        >
    >,
    AppUserToRoleRelations
>(BaseCrudRepository, AppUserToRole, {
    keyProperties: ['appUserId', 'roleId'],
    referenceRelationships: ['role'],
}) {
    public readonly role: BelongsToAccessor<
        RoleModel,
        typeof AppUserToRoleModel.prototype.id
    >;

    public readonly appUser: BelongsToAccessor<
        AppUserModel,
        typeof AppUserToRoleModel.prototype.id
    >;

    constructor(
        @inject('datasources.nick-crm-2024-2')
        dataSource: NickCrm20242DataSource,

        @repository.getter('RoleRepository')
        protected roleRepositoryGetter: Getter<RoleRepository>,

        @repository.getter('AppUserRepository')
        protected appUserRepositoryGetter: Getter<AppUserRepository>,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, AppUserToRoleModel, dataSource);

        this.role = this.createBelongsToAccessorFor(
            'role',
            roleRepositoryGetter
        );
        this.registerInclusionResolver('role', this.role.inclusionResolver);

        this.appUser = this.createBelongsToAccessorFor(
            'appUser',
            appUserRepositoryGetter
        );
        this.registerInclusionResolver(
            'appUser',
            this.appUser.inclusionResolver
        );
    }

    definePersistedModel(
        entityClass: typeof AppUserToRoleModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        return modelClass;
    }
}
