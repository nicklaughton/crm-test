import {
    Entity,
    model,
    property,
    belongsTo,
    hasMany,
    hasOne,
} from '@loopback/repository';
import { BaseEntity } from './base-entity';
import { IndustryModel, IndustryWithRelations } from './industry.model';
import { ContactModel, ContactWithRelations } from './contact.model';
import { ProjectModel, ProjectWithRelations } from './project.model';

import { ExportImportModelMixin } from '../mixins/export-import-model.mixin';

@model({
    settings: {
        strict: true,
        name: 'Company',
        displayName: 'Company',
        resourceName: 'Companies',

        postgresql: { table: 'company' },

        indexes: {},
        partialIndexes: {},
        keyRelations: {
            contacts: {
                type: 'hasMany',
                modelTo: 'ContactModel',
                model: 'ContactModel',
                foreignKey: 'companyId',
                onDelete: 'CASCADE',
            },

            projects: {
                type: 'hasMany',
                modelTo: 'ProjectModel',
                model: 'ProjectModel',
                foreignKey: 'companyId',
                onDelete: 'CASCADE',
            },

            industry: {
                type: 'belongsTo',
                modelTo: 'IndustryModel',
                model: 'IndustryModel',
                foreignKey: 'industryId',
                onDelete: 'CASCADE',
            },
        },
    },
})
export class CompanyModel extends ExportImportModelMixin(BaseEntity) {
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
    description?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    website?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    image?: string;

    @belongsTo(() => IndustryModel, {}, { jsonSchema: { nullable: true } })
    industryId: number;

    @hasMany(() => ContactModel, { keyTo: 'companyId' })
    contacts: ContactModel[];

    @hasMany(() => ProjectModel, { keyTo: 'companyId' })
    projects: ProjectModel[];

    industry?: IndustryWithRelations;

    constructor(data?: Partial<CompanyModel>) {
        super(data);
    }
}

export interface CompanyRelations {
    // describe navigational properties here
}

export type CompanyWithRelations = CompanyModel & CompanyRelations;
