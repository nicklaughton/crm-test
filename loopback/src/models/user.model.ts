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

@model({
    settings: {
        strict: true,
        name: 'User',
        displayName: 'User',
        resourceName: 'Users',

        postgresql: { table: 'user' },

        indexes: {},
        partialIndexes: {},
        keyRelations: {},
    },
})
export class UserModel extends BaseEntity {
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
    username?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    email?: string;

    @property({
        type: 'boolean',
        jsonSchema: { nullable: true },
    })
    emailVerified?: boolean;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    picture?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    realm?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    verificationToken?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    password?: string;

    constructor(data?: Partial<UserModel>) {
        super(data);
    }
}

export interface UserRelations {
    // describe navigational properties here
}

export type UserWithRelations = UserModel & UserRelations;
