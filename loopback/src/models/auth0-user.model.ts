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
import { AppUserModel, AppUserWithRelations } from './app-user.model';

@model({
    settings: {
        strict: true,
        name: 'Auth0User',
        displayName: 'Auth0 User',
        resourceName: 'Auth0Users',

        postgresql: { table: 'auth0user' },

        indexes: {},
        partialIndexes: {},
        keyRelations: {
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
export class Auth0UserModel extends BaseEntity {
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
    sub?: string;

    @property({
        type: 'Date',
        jsonSchema: { nullable: true },
    })
    profileUpdated?: Date;

    @belongsTo(() => AppUserModel, {}, { jsonSchema: { nullable: true } })
    appUserId: number;

    appUser?: AppUserWithRelations;

    constructor(data?: Partial<Auth0UserModel>) {
        super(data);
    }
}

export interface Auth0UserRelations {
    // describe navigational properties here
}

export type Auth0UserWithRelations = Auth0UserModel & Auth0UserRelations;
