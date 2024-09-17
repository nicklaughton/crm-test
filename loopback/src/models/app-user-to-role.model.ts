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
import { RoleModel, RoleWithRelations } from './role.model';
import { AppUserModel, AppUserWithRelations } from './app-user.model';

import { ExportImportModelMixin } from '../mixins/export-import-model.mixin';

@model({
    settings: {
        strict: true,
        name: 'AppUserToRole',
        displayName: 'App User To Role',
        resourceName: 'AppUserToRoles',

        memory: { table: 'appusertorole' },

        indexes: {
            AppUserToRole_unique: {
                keys: {
                    appUserId: 1,
                    roleId: 1,
                },
                options: {
                    unique: true,
                },
            },
            AppUserToRole_RoleToUser: {
                keys: {
                    roleId: 1,
                    appUserId: 1,
                },
                options: {},
            },
        },
        partialIndexes: {},
        keyRelations: {
            role: {
                type: 'belongsTo',
                modelTo: 'RoleModel',
                model: 'RoleModel',
                foreignKey: 'roleId',
                onDelete: 'CASCADE',
            },

            appUser: {
                type: 'belongsTo',
                modelTo: 'AppUserModel',
                model: 'AppUserModel',
                foreignKey: 'appUserId',
                onDelete: 'CASCADE',
            },
        },
    },
})
export class AppUserToRoleModel extends ExportImportModelMixin(BaseEntity) {
    @property({
        type: 'number',
        id: true,
        generated: true,
    })
    id?: number;

    @belongsTo(() => RoleModel, {}, { jsonSchema: { nullable: true } })
    roleId: number;

    @belongsTo(() => AppUserModel, {}, { jsonSchema: { nullable: true } })
    appUserId: number;

    role?: RoleWithRelations;

    appUser?: AppUserWithRelations;

    constructor(data?: Partial<AppUserToRoleModel>) {
        super(data);
    }
}

export interface AppUserToRoleRelations {
    // describe navigational properties here
}

export type AppUserToRoleWithRelations = AppUserToRoleModel &
    AppUserToRoleRelations;
