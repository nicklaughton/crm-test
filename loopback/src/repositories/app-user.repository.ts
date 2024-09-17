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
    AppUserRelations,
    AppUserModel,
    Auth0UserModel,
    AppUserToRoleModel,
} from '../models';

import { ADApplication } from '../application';

import { AppUser } from '../objects/app-user';
import { AppUserArray } from '../objects/app-user-array';
import { Auth0User } from '../objects/auth0-user';
import { Auth0UserArray } from '../objects/auth0-user-array';
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

import { Auth0UserRepository } from './auth0-user.repository';

import { AppUserToRoleRepository } from './app-user-to-role.repository';
import { MemoryDataSource } from '../datasources';

import { ExportImportRepositoryMixin } from '../mixins/export-import-repository.mixin';

const Debug = require('debug')('Loopback4BaseLibrary:AppUser');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class AppUserRepository extends ExportImportRepositoryMixin<
    AppUserModel,
    Constructor<
        BaseCrudRepository<
            AppUserModel,
            typeof AppUserModel.prototype.id,
            AppUserRelations
        >
    >,
    AppUserRelations
>(BaseCrudRepository, AppUser, {
    keyProperties: ['email'],
    includeRelationships: ['appUserToRoles'],
}) {
    public readonly auth0Users: HasManyRepositoryFactory<
        Auth0UserModel,
        typeof AppUserModel.prototype.id
    >;

    public readonly appUserToRoles: HasManyRepositoryFactory<
        AppUserToRoleModel,
        typeof AppUserModel.prototype.id
    >;

    constructor(
        @inject('datasources.memory') dataSource: MemoryDataSource,

        @repository.getter('Auth0UserRepository')
        protected auth0UserRepositoryGetter: Getter<Auth0UserRepository>,

        @repository.getter('AppUserToRoleRepository')
        protected appUserToRoleRepositoryGetter: Getter<AppUserToRoleRepository>,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, AppUserModel, dataSource);

        this.auth0Users = this.createHasManyRepositoryFactoryFor(
            'auth0Users',
            auth0UserRepositoryGetter
        );
        this.registerInclusionResolver(
            'auth0Users',
            this.auth0Users.inclusionResolver
        );

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
        entityClass: typeof AppUserModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        modelClass.observe('after save', async (ctx) => {
            if (ctx.isNewInstance) {
                let debug = Debug.extend('emitAppUserCreated');

                let _apexObjTemp = ctx.data || ctx.instance || ctx.where;
                let appUser =
                    _apexObjTemp && _apexObjTemp['id']
                        ? await AppUser.findById(
                              _apexObjTemp['id'],
                              {},
                              ctx.options
                          )
                        : _apexObjTemp;

                const _afterCreate = async (appUser) => {
                    debug('appUser %j', appUser);
                    this.app.emit('AppUser Created', appUser);
                };

                await _afterCreate(appUser);
            }
        });

        return modelClass;
    }

    async currentUser(
        filter?: any,

        options?: Options
    ): Promise<AppUser> {
        let debug = Debug.extend('currentUser');
        let app = this.app;

        debug('filter %j', filter);

        let appUserId = options?.request?.appUser?.id;
        debug('appUserId %j', appUserId);
        if (appUserId) {
            let appUser = await AppUser.findById(appUserId, filter, options);
            debug('appUser %j', appUser);
            return appUser;
        }
    }
}
