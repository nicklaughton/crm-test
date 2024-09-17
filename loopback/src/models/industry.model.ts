import {
    Entity,
    model,
    property,
    belongsTo,
    hasMany,
    hasOne,
} from '@loopback/repository';
import { BaseEntity } from './base-entity';
import { CompanyModel, CompanyWithRelations } from './company.model';

import { ExportImportModelMixin } from '../mixins/export-import-model.mixin';

@model({
    settings: {
        strict: true,
        name: 'Industry',
        displayName: 'Industry',
        resourceName: 'Industries',

        memory: { table: 'industry' },

        indexes: {},
        partialIndexes: {},
        keyRelations: {
            companies: {
                type: 'hasMany',
                modelTo: 'CompanyModel',
                model: 'CompanyModel',
                foreignKey: 'industryId',
                onDelete: 'CASCADE',
            },
        },
    },
})
export class IndustryModel extends ExportImportModelMixin(BaseEntity) {
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

    @hasMany(() => CompanyModel, { keyTo: 'industryId' })
    companies: CompanyModel[];

    constructor(data?: Partial<IndustryModel>) {
        super(data);
    }
}

export interface IndustryRelations {
    // describe navigational properties here
}

export type IndustryWithRelations = IndustryModel & IndustryRelations;
