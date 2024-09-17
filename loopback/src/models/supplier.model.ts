import {
    Entity,
    model,
    property,
    belongsTo,
    hasMany,
    hasOne,
} from '@loopback/repository';
import { BaseEntity } from './base-entity';

import { Country } from './';

@model({
    settings: {
        strict: true,
        name: 'Supplier',
        displayName: 'Supplier',
        resourceName: 'Suppliers',

        memory: { table: 'supplier' },

        indexes: {},
        partialIndexes: {},
        keyRelations: {},
    },
})
export class SupplierModel extends BaseEntity {
    @property({
        type: 'number',
        id: true,
        generated: true,
    })
    id?: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    name?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    code?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    country?: Country;

    constructor(data?: Partial<SupplierModel>) {
        super(data);
    }
}

export interface SupplierRelations {
    // describe navigational properties here
}

export type SupplierWithRelations = SupplierModel & SupplierRelations;
