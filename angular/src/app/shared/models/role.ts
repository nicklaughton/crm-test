// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';
import { RoleArray } from './role-array';

import { AppUserToRole } from './app-user-to-role';
import { AppUserToRoleArray } from './app-user-to-role-array';

export class Role extends ApexDataObject<Role> {
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

        super(object, options, Role, Role._staticRepository);

        if (options?.isInitializeRelationships)
            this._initializeRelationships(object, ['appUserToRoles']);
    }
    public static metadata = {
        name: `Role`,
        pluralName: `Roles`,
        displayName: `Role`,
        pluralDisplayName: `Roles`,
        infiniteArticle: `a`,
        description: null,

        isClientSideOnly: false,
        properties: [
            {
                name: `description`,
                displayName: `Description`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'string',
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
                name: `created`,
                displayName: `Created`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'Date',
                },
            },
            {
                name: `modified`,
                displayName: `Modified`,
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
            appUserToRoles: {
                name: 'appUserToRoles',
                type: 'has many',
                foreignKey: 'roleId',
                childParentName: 'role',
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
    get description(): string {
        return this._get('description');
    }

    set description(value: string) {
        this._updateAttribute('description', value);
    }

    get name(): string {
        return this._get('name');
    }

    set name(value: string) {
        this._updateAttribute('name', value);
    }

    get created(): Date {
        return this._get('created');
    }

    set created(value: Date) {
        this._updateAttribute('created', value);
    }

    get modified(): Date {
        return this._get('modified');
    }

    set modified(value: Date) {
        this._updateAttribute('modified', value);
    }
    get appUserToRoles(): AppUserToRoleArray {
        return this._getListRelation('appUserToRoles', {
            roleId: this.getIdentifier(),
        });
    }
    set appUserToRoles(value: AppUserToRoleArray) {
        this._setListRelation('appUserToRoles', value, {
            roleId: this.getIdentifier(),
        });
    }
    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
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
    ): Promise<Role> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<RoleArray> {
        return super._createAll<RoleArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Role> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Role> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<RoleArray> {
        return super._find<RoleArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<Role> {
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

    static async import(exportData: any): Promise<Role> {
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
Object.defineProperty(Role.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Role.prototype, 'description', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Role.prototype, 'name', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Role.prototype, 'created', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Role.prototype, 'modified', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Role.prototype, 'appUserToRoles', {
    enumerable: true,
    configurable: true,
});
