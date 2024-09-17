// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';
import { AppUserArray } from './app-user-array';

import { Auth0User } from './auth0-user';
import { Auth0UserArray } from './auth0-user-array';
import { AppUserToRole } from './app-user-to-role';
import { AppUserToRoleArray } from './app-user-to-role-array';

type EmailAddress = string;

export class AppUser extends ApexDataObject<AppUser> {
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

        super(object, options, AppUser, AppUser._staticRepository);

        if (options?.isInitializeRelationships)
            this._initializeRelationships(object, [
                'auth0Users',
                'appUserToRoles',
            ]);
    }
    public static metadata = {
        name: `AppUser`,
        pluralName: `AppUsers`,
        displayName: `App User`,
        pluralDisplayName: `App Users`,
        infiniteArticle: `an`,
        description: null,

        isClientSideOnly: false,
        properties: [
            {
                name: `email`,
                displayName: `Email`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'EmailAddress',
                    pattern: `^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$`,
                    patternMessage: `Please enter a valid email address.`,
                },
            },
            {
                name: `name`,
                displayName: `Name`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'string',
                },
            },
            {
                name: `picture`,
                displayName: `Picture`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'string',
                },
            },
            {
                name: `lastSeen`,
                displayName: `Last Seen`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'Date',
                },
            },
            {
                name: `created`,
                displayName: `Created`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'Date',
                },
            },
        ],
        behaviors: [
            {
                name: `currentUser`,
                displayName: `Current User`,
                description: null,
                type: 'Class Behavior',
                subType: 'Get',
                url: null,
                parameters: [
                    {
                        name: 'filter',
                        description: null,
                        type: {
                            name: 'any',
                        },
                    },
                ],
                returnIsArray: false,
                returnType: {
                    name: 'AppUser',
                },
            },
            {
                name: `emitAppUserCreated`,
                displayName: `Emit App User Created`,
                description: null,
                type: 'Event Handler',
                subType: 'After Create',
                url: null,
                parameters: [],
                returnIsArray: false,
                returnType: {
                    name: 'void',
                },
            },
            {
                name: `export`,
                displayName: `Export`,
                description: null,
                type: 'Instance Behavior',
                subType: 'Get',
                url: null,
                parameters: [],
                returnIsArray: false,
                returnType: {
                    name: 'any',
                },
            },
            {
                name: `import`,
                displayName: `Import`,
                description: 'Import JSON to create or update an item.',
                type: 'Class Behavior',
                subType: 'Post',
                url: 'null',
                parameters: [
                    {
                        name: 'exportData',
                        description: 'JSON export data.',
                        type: {
                            name: 'any',
                        },
                    },
                ],
                returnIsArray: false,
                returnType: {
                    name: 'Model',
                },
            },
            {
                name: `exportMany`,
                displayName: `Export Many`,
                description: null,
                type: 'Class Behavior',
                subType: 'Get',
                url: null,
                parameters: [
                    {
                        name: 'where',
                        description: null,
                        type: {
                            name: 'any',
                        },
                    },
                ],
                returnIsArray: false,
                returnType: {
                    name: 'void',
                },
            },
        ],
        relationships: {
            auth0Users: {
                name: 'auth0Users',
                type: 'has many',
                foreignKey: 'appUserId',
                childParentName: 'appUser',
                businessObject: {
                    name: 'Auth0User',
                },
            },

            appUserToRoles: {
                name: 'appUserToRoles',
                type: 'has many',
                foreignKey: 'appUserId',
                childParentName: 'appUser',
                businessObject: {
                    name: 'AppUserToRole',
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
    get email(): EmailAddress {
        return this._get('email');
    }

    set email(value: EmailAddress) {
        this._updateAttribute('email', value);
    }

    get name(): string {
        return this._get('name');
    }

    set name(value: string) {
        this._updateAttribute('name', value);
    }

    get picture(): string {
        return this._get('picture');
    }

    set picture(value: string) {
        this._updateAttribute('picture', value);
    }

    get lastSeen(): Date {
        return this._get('lastSeen');
    }

    set lastSeen(value: Date) {
        this._updateAttribute('lastSeen', value);
    }

    get created(): Date {
        return this._get('created');
    }

    set created(value: Date) {
        this._updateAttribute('created', value);
    }
    get auth0Users(): Auth0UserArray {
        return this._getListRelation('auth0Users', {
            appUserId: this.getIdentifier(),
        });
    }
    set auth0Users(value: Auth0UserArray) {
        this._setListRelation('auth0Users', value, {
            appUserId: this.getIdentifier(),
        });
    }
    get appUserToRoles(): AppUserToRoleArray {
        return this._getListRelation('appUserToRoles', {
            appUserId: this.getIdentifier(),
        });
    }
    set appUserToRoles(value: AppUserToRoleArray) {
        this._setListRelation('appUserToRoles', value, {
            appUserId: this.getIdentifier(),
        });
    }
    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            auth0Users: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: Auth0UserArray,
            },

            appUserToRoles: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: AppUserToRoleArray,
            },
        });
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUser> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserArray> {
        return super._createAll<AppUserArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUser> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUser> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<AppUserArray> {
        return super._find<AppUserArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<AppUser> {
        return super._findOne(options, context);
    }

    static async currentUser(filter?: any): Promise<AppUser> {
        const _url = this._staticRepository.apiUrl + '/' + `currentUser`;

        const params = {
            filter:
                filter && typeof filter == 'object'
                    ? JSON.stringify(filter)
                    : filter,
        };
        for (let param in params)
            if (params[param] === undefined) delete params[param];
        const args = { params };

        return new Promise((resolve, reject) => {
            this._staticRepository.httpClient.get(_url, args).subscribe(
                (res) => {
                    resolve(new AppUser(res));
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    async export(): Promise<any> {
        const _url =
            this._repository.apiUrl +
            '/' +
            encodeURIComponent(this.getIdentifier()) +
            '/' +
            `export`;

        const params = {};

        const args = { params };

        return new Promise((resolve, reject) => {
            this._repository.httpClient.get(_url, args).subscribe(
                (res) => {
                    resolve(res);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    static async import(exportData: any): Promise<AppUser> {
        const _url = this._staticRepository.apiUrl + '/' + `import`;

        const params = {
            exportData: exportData,
        };
        for (let param in params)
            if (params[param] === undefined) delete params[param];

        return new Promise((resolve, reject) => {
            this._staticRepository.httpClient.post(_url, params).subscribe(
                (res) => {
                    resolve(res);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    static async exportMany(where?: any): Promise<void> {
        const _url = this._staticRepository.apiUrl + '/' + `exportMany`;

        const params = {
            where:
                where && typeof where == 'object'
                    ? JSON.stringify(where)
                    : where,
        };
        for (let param in params)
            if (params[param] === undefined) delete params[param];
        const args = { params };

        return new Promise((resolve, reject) => {
            this._staticRepository.httpClient.get(_url, args).subscribe(
                (res) => {
                    resolve(res);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }
}
Object.defineProperty(AppUser.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(AppUser.prototype, 'email', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(AppUser.prototype, 'name', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(AppUser.prototype, 'picture', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(AppUser.prototype, 'lastSeen', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(AppUser.prototype, 'created', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(AppUser.prototype, 'auth0Users', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(AppUser.prototype, 'appUserToRoles', {
    enumerable: true,
    configurable: true,
});
