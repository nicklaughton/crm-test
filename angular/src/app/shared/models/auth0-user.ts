// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';
import { Auth0UserArray } from './auth0-user-array';

import { AppUser } from './app-user';
import { AppUserArray } from './app-user-array';

export class Auth0User extends ApexDataObject<Auth0User> {
    constructor();
    constructor(object: any);
    constructor(object: any, options: ApexDataOptions);
    constructor(object: any, options: ApexDataOptions, context: any);
    constructor(object?: any, options?: any, context?: any) {
        if (
            object &&
            object.http &&
            (object.save !== undefined || object.read !== undefined)
        ) {
            let temp = options;
            options = object;
            options.readAutomatically =
                options.readAutomatically || options.read == 'Automatically';
            options.saveAutomatically =
                options.saveAutomatically || options.save == 'Automatically';
            object = temp;
        }

        super(object, options, Auth0User, Auth0User._staticRepository);
    }
    public static metadata = {
        name: `Auth0User`,
        pluralName: `Auth0Users`,
        displayName: `Auth0 User`,
        pluralDisplayName: `Auth0 Users`,
        infiniteArticle: `an`,
        description: null,

        isClientSideOnly: false,
        properties: [
            {
                name: `sub`,
                displayName: `Sub`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'string',
                },
            },
            {
                name: `profileUpdated`,
                displayName: `Profile Updated`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'Date',
                },
            },
        ],
        behaviors: [],
        relationships: {
            appUser: {
                name: 'appUser',
                type: 'belongs to',
                foreignKey: 'appUserId',
                parentChildName: 'auth0Users',
                businessObject: {
                    name: 'AppUser',
                },
            },
        },
    };

    protected static _idProperty: string = 'id';

    get id(): number {
        return this.getIdentifier();
    }
    set id(value: number) {
        this._updateId('id', value);
    }
    get sub(): string {
        return this._get('sub');
    }

    set sub(value: string) {
        this._updateAttribute('sub', value);
    }

    get profileUpdated(): Date {
        return this._get('profileUpdated');
    }

    set profileUpdated(value: Date) {
        this._updateAttribute('profileUpdated', value);
    }

    get appUserId(): number {
        return this._get('appUserId');
    }
    set appUserId(value: number) {
        this._updateAttribute('appUserId', value);
    }
    get appUser(): AppUser {
        return this._getObjectRelation('appUser', { id: this.appUserId });
    }
    set appUser(value: AppUser) {
        this._setObjectRelation('appUser', value, 'appUserId', 'id');
    }
    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            appUser: {
                fromType: 'has many',
                type: 'belongs to',
                classReference: AppUser,
            },
        });
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Auth0User> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<Auth0UserArray> {
        return super._createAll<Auth0UserArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Auth0User> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Auth0User> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<Auth0UserArray> {
        return super._find<Auth0UserArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<Auth0User> {
        return super._findOne(options, context);
    }
}
Object.defineProperty(Auth0User.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Auth0User.prototype, 'sub', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Auth0User.prototype, 'profileUpdated', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Auth0User.prototype, 'appUser', {
    enumerable: true,
    configurable: true,
});
