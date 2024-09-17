// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';
import { AppUserToRoleArray } from './app-user-to-role-array';

import { Role } from './role';
import { RoleArray } from './role-array';
import { AppUser } from './app-user';
import { AppUserArray } from './app-user-array';

export class AppUserToRole extends ApexDataObject<AppUserToRole> {
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

        super(object, options, AppUserToRole, AppUserToRole._staticRepository);
    }
    public static metadata = {
        name: `AppUserToRole`,
        pluralName: `AppUserToRoles`,
        displayName: `App User To Role`,
        pluralDisplayName: `App User To Roles`,
        infiniteArticle: `an`,
        description: null,

        isClientSideOnly: false,
        properties: [],
        behaviors: [
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
            role: {
                name: 'role',
                type: 'belongs to',
                foreignKey: 'roleId',
                parentChildName: 'appUserToRoles',
                businessObject: {
                    name: 'Role',
                },
            },

            appUser: {
                name: 'appUser',
                type: 'belongs to',
                foreignKey: 'appUserId',
                parentChildName: 'appUserToRoles',
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
    get roleId(): number {
        return this._get('roleId');
    }
    set roleId(value: number) {
        this._updateAttribute('roleId', value);
    }

    get appUserId(): number {
        return this._get('appUserId');
    }
    set appUserId(value: number) {
        this._updateAttribute('appUserId', value);
    }
    get role(): Role {
        return this._getObjectRelation('role', { id: this.roleId });
    }
    set role(value: Role) {
        this._setObjectRelation('role', value, 'roleId', 'id');
    }
    get appUser(): AppUser {
        return this._getObjectRelation('appUser', { id: this.appUserId });
    }
    set appUser(value: AppUser) {
        this._setObjectRelation('appUser', value, 'appUserId', 'id');
    }
    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            role: {
                fromType: 'has many',
                type: 'belongs to',
                classReference: Role,
            },
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
    ): Promise<AppUserToRole> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserToRoleArray> {
        return super._createAll<AppUserToRoleArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserToRole> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserToRole> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<AppUserToRoleArray> {
        return super._find<AppUserToRoleArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<AppUserToRole> {
        return super._findOne(options, context);
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

    static async import(exportData: any): Promise<AppUserToRole> {
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
Object.defineProperty(AppUserToRole.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(AppUserToRole.prototype, 'role', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(AppUserToRole.prototype, 'appUser', {
    enumerable: true,
    configurable: true,
});
