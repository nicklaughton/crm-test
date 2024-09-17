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

import { SupplierRelations, SupplierModel } from '../models';

import { ADApplication } from '../application';

import { Supplier } from '../objects/supplier';
import { SupplierArray } from '../objects/supplier-array';

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

const Debug = require('debug')('NickCrm20242:Supplier');
Debug.log = console.log.bind(console);
Debug('repository loaded');

@bind({ scope: BindingScope.SINGLETON })
export class SupplierRepository extends BaseCrudRepository<
    SupplierModel,
    typeof SupplierModel.prototype.id,
    SupplierRelations
> {
    constructor(
        @inject('datasources.nick-crm-2024-2')
        dataSource: NickCrm20242DataSource,
        @inject(CoreBindings.APPLICATION_INSTANCE) public app: ADApplication
    ) {
        super(app, SupplierModel, dataSource);
    }

    definePersistedModel(
        entityClass: typeof SupplierModel
    ): typeof juggler.PersistedModel {
        const modelClass = super.definePersistedModel(entityClass);
        let app = this.app;
        // operation hooks (ex: before save)

        return modelClass;
    }
}
