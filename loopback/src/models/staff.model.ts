import {
    Entity,
    model,
    property,
    belongsTo,
    hasMany,
    hasOne,
} from '@loopback/repository';
import { BaseEntity } from './base-entity';
import { ProjectModel, ProjectWithRelations } from './project.model';

import { StaffRole } from './';

import { ExportImportModelMixin } from '../mixins/export-import-model.mixin';

@model({
    settings: {
        strict: true,
        name: 'Staff',
        displayName: 'Staff',
        resourceName: 'Staff',

        memory: { table: 'staff' },

        indexes: {},
        partialIndexes: {},
        keyRelations: {
            projects: {
                type: 'hasMany',
                modelTo: 'ProjectModel',
                model: 'ProjectModel',
                foreignKey: 'projectManagerId',
                onDelete: 'SET NULL',
            },
        },
    },
})
export class StaffModel extends ExportImportModelMixin(BaseEntity) {
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
    role?: StaffRole;

    @hasMany(() => ProjectModel, { keyTo: 'projectManagerId' })
    projects: ProjectModel[];

    constructor(data?: Partial<StaffModel>) {
        super(data);
    }
}

export interface StaffRelations {
    // describe navigational properties here
}

export type StaffWithRelations = StaffModel & StaffRelations;
