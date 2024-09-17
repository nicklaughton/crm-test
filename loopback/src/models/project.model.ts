import {
    Entity,
    model,
    property,
    belongsTo,
    hasMany,
    hasOne,
} from '@loopback/repository';
import { BaseEntity } from './base-entity';
import { StaffModel, StaffWithRelations } from './staff.model';
import { CompanyModel, CompanyWithRelations } from './company.model';

import { Currency } from './';

import { ExportImportModelMixin } from '../mixins/export-import-model.mixin';

@model({
    settings: {
        strict: true,
        name: 'Project',
        displayName: 'Project',
        resourceName: 'Projects',

        memory: { table: 'project' },

        indexes: {},
        partialIndexes: {},
        keyRelations: {
            projectManager: {
                type: 'belongsTo',
                modelTo: 'StaffModel',
                model: 'StaffModel',
                foreignKey: 'projectManagerId',
                onDelete: 'SET NULL',
            },

            company: {
                type: 'belongsTo',
                modelTo: 'CompanyModel',
                model: 'CompanyModel',
                foreignKey: 'companyId',
                onDelete: 'CASCADE',
            },
        },
    },
})
export class ProjectModel extends ExportImportModelMixin(BaseEntity) {
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
        type: 'Date',
        jsonSchema: { nullable: true },
    })
    startDate?: Date;

    @property({
        type: 'Date',
        jsonSchema: { nullable: true },
    })
    endDate?: Date;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    description?: string;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
    })
    total?: Currency;

    @belongsTo(() => StaffModel, {}, { jsonSchema: { nullable: true } })
    projectManagerId: number;

    @belongsTo(() => CompanyModel, {}, { jsonSchema: { nullable: true } })
    companyId: number;

    projectManager?: StaffWithRelations;

    company?: CompanyWithRelations;

    constructor(data?: Partial<ProjectModel>) {
        super(data);
    }
}

export interface ProjectRelations {
    // describe navigational properties here
}

export type ProjectWithRelations = ProjectModel & ProjectRelations;
