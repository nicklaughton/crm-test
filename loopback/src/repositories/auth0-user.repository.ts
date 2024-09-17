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

import { Auth0UserRelations, Auth0UserModel, AppUserModel } from '../models';

import { ADApplication } from '../application';

import { Auth0User } from '../objects/auth0-user';
import { Auth0UserArray } from '../objects/auth0-user-array';
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

import { AppUserRepository } from './app-user.repository';
import { NickCrm20242DataSource } from '../datasources';

const Debug = require('debug')('Auth0Loopback4:Auth0User');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class Auth0UserRepository extends BaseCrudRepository<
    Auth0UserModel,
    typeof Auth0UserModel.prototype.id,
    Auth0UserRelations
> {
    public readonly appUser: BelongsToAccessor<
        AppUserModel,
        typeof Auth0UserModel.prototype.id
    >;

    constructor(
        @inject('datasources.nick-crm-2024-2')
        dataSource: NickCrm20242DataSource,

        @repository.getter('AppUserRepository')
        protected appUserRepositoryGetter: Getter<AppUserRepository>,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, Auth0UserModel, dataSource);

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
        entityClass: typeof Auth0UserModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        return modelClass;
    }
}
