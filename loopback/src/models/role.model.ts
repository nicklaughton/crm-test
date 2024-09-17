// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
    Entity,
    model,
    property,
    belongsTo,
    hasMany,
    hasOne,
} from '@loopback/repository';
import { BaseEntity } from './base-entity';
import {
    AppUserToRoleModel,
    AppUserToRoleWithRelations,
} from './app-user-to-role.model';

import { ExportImportModelMixin } from '../mixins/export-import-model.mixin';

@model({
    settings: {
        strict: true,
        name: 'Role',
        displayName: 'Role',
        resourceName: 'Roles',

        postgresql: { table: 'role' },

        indexes: {
            Role_name: {
                keys: {
                    name: 1,
                },
                options: {
                    unique: true,
                },
            },
        },
        partialIndexes: {},
        keyRelations: {
            appUserToRoles: {
                type: 'hasMany',
                modelTo: 'AppUserToRoleModel',
                model: 'AppUserToRoleModel',
                foreignKey: 'roleId',
                onDelete: 'CASCADE',
            },
        },
    },
})
export class RoleModel extends ExportImportModelMixin(BaseEntity) {
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
    description?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    name?: string;

    @property({
        type: 'Date',
        jsonSchema: { nullable: true },
    })
    created?: Date;

    @property({
        type: 'Date',
        jsonSchema: { nullable: true },
    })
    modified?: Date;

    @hasMany(() => AppUserToRoleModel, { keyTo: 'roleId' })
    appUserToRoles: AppUserToRoleModel[];

    constructor(data?: Partial<RoleModel>) {
        super(data);
    }
}

export interface RoleRelations {
    // describe navigational properties here
}

export type RoleWithRelations = RoleModel & RoleRelations;
