// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';

import { AppUserToRole } from '../objects/app-user-to-role';
import { AppUserToRoleArray } from '../objects/app-user-to-role-array';

import { RoleArray } from './role-array';

const metadata = {
    name: 'Role',
    pluralName: 'Roles',
    displayName: 'Role',
    pluralDisplayName: 'Roles',
    infiniteArticle: 'a',
    arrayClass: RoleArray,
    properties: [
        {
            name: 'description',
            displayName: 'Description',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'name',
            displayName: 'Name',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'created',
            displayName: 'Created',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'Date',
            },
        },
        {
            name: 'modified',
            displayName: 'Modified',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'Date',
            },
        },
    ],
    relationships: {
        appUserToRoles: {
            name: 'appUserToRoles',
            type: 'has many',
            childParentName: 'role',
            businessObject: {
                name: 'AppUserToRole',
            },
        },
    },
};

export class Role extends ApexDataObject<Role> {
    constructor();
    constructor(object: any);
    constructor(object: any, options: ApexDataOptions);
    constructor(object: any, options: ApexDataOptions, context: any);
    constructor(object?: any, options?: any, context?: any) {
        //Partial<Project>  new Account({save:'Aut'}, {})
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

        super(object, options, Role, Role._staticRepository, context);

        if (options?.isInitializeRelationships)
            this._initializeRelationships(object, ['appUserToRoles']);
    }
    public static metadata: any = metadata;

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
    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Role> {
        return super.createWithChildren<Role>(data, options, context);
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
        options: ApexDataOptions,
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

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            appUserToRoles: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: AppUserToRoleArray,
            },
        });
    }

    async export(options?: any): Promise<any> {
        return Role._staticRepository.export(
            this,

            options
        );
    }

    static referenceKey(data: any, options?: any): any {
        return Role._staticRepository.referenceKey(data, options);
    }

    async exportData(parentIdName: string, options?: any): Promise<any> {
        return Role._staticRepository.exportData(
            this,

            parentIdName,
            options
        );
    }

    static async import(exportData: any, options?: any): Promise<Role> {
        return Role._staticRepository.import(exportData, options);
    }

    static async importData(dataFromExport: any, options?: any): Promise<any> {
        return Role._staticRepository.importData(dataFromExport, options);
    }

    static async importAll(
        pathToExportFiles: string,
        options?: any
    ): Promise<void> {
        return Role._staticRepository.importAll(pathToExportFiles, options);
    }

    static async exportMany(where?: any, options?: any): Promise<void> {
        return Role._staticRepository.exportMany(where, options);
    }

    static referenceKeyWithNulls(data: any, options?: any): any {
        return Role._staticRepository.referenceKeyWithNulls(data, options);
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
