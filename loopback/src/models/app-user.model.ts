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
import { Auth0UserModel, Auth0UserWithRelations } from './auth0-user.model';
import {
    AppUserToRoleModel,
    AppUserToRoleWithRelations,
} from './app-user-to-role.model';

import { EmailAddress } from './';

import { ExportImportModelMixin } from '../mixins/export-import-model.mixin';

@model({
    settings: {
        strict: true,
        name: 'AppUser',
        displayName: 'App User',
        resourceName: 'AppUsers',

        postgresql: { table: 'appuser' },

        indexes: {},
        partialIndexes: {},
        keyRelations: {
            auth0Users: {
                type: 'hasMany',
                modelTo: 'Auth0UserModel',
                model: 'Auth0UserModel',
                foreignKey: 'appUserId',
                onDelete: 'CASCADE',
            },

            appUserToRoles: {
                type: 'hasMany',
                modelTo: 'AppUserToRoleModel',
                model: 'AppUserToRoleModel',
                foreignKey: 'appUserId',
                onDelete: 'CASCADE',
            },
        },
    },
})
export class AppUserModel extends ExportImportModelMixin(BaseEntity) {
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
    email?: EmailAddress;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    name?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    picture?: string;

    @property({
        type: 'Date',
        jsonSchema: { nullable: true },
    })
    lastSeen?: Date;

    @property({
        type: 'Date',
        jsonSchema: { nullable: true },
    })
    created?: Date;

    @hasMany(() => Auth0UserModel, { keyTo: 'appUserId' })
    auth0Users: Auth0UserModel[];

    @hasMany(() => AppUserToRoleModel, { keyTo: 'appUserId' })
    appUserToRoles: AppUserToRoleModel[];

    constructor(data?: Partial<AppUserModel>) {
        super(data);
    }
}

export interface AppUserRelations {
    // describe navigational properties here
}

export type AppUserWithRelations = AppUserModel & AppUserRelations;
