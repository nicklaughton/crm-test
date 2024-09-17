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

import { UserRelations, UserModel } from '../models';

import { ADApplication } from '../application';

import { User } from '../objects/user';
import { UserArray } from '../objects/user-array';

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
import { NickCrm20242DataSource } from '../datasources';

const Debug = require('debug')('Loopback4BaseLibrary:User');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class UserRepository extends BaseCrudRepository<
    UserModel,
    typeof UserModel.prototype.id,
    UserRelations
> {
    constructor(
        @inject('datasources.nick-crm-2024-2')
        dataSource: NickCrm20242DataSource,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, UserModel, dataSource);
    }

    definePersistedModel(
        entityClass: typeof UserModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        return modelClass;
    }
}
