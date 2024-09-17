// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';

import { Role } from '../objects/role';
import { RoleArray } from '../objects/role-array';
import { AppUser } from '../objects/app-user';
import { AppUserArray } from '../objects/app-user-array';

import { AppUserToRoleArray } from './app-user-to-role-array';

const metadata = {
    name: 'AppUserToRole',
    pluralName: 'AppUserToRoles',
    displayName: 'App User To Role',
    pluralDisplayName: 'App User To Roles',
    infiniteArticle: 'an',
    arrayClass: AppUserToRoleArray,
    properties: [],
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

export class AppUserToRole extends ApexDataObject<AppUserToRole> {
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

        super(
            object,
            options,
            AppUserToRole,
            AppUserToRole._staticRepository,
            context
        );
    }
    public static metadata: any = metadata;

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
    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserToRole> {
        return super.createWithChildren<AppUserToRole>(data, options, context);
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
        options: ApexDataOptions,
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

    async export(options?: any): Promise<any> {
        return AppUserToRole._staticRepository.export(
            this,

            options
        );
    }

    static referenceKey(data: any, options?: any): any {
        return AppUserToRole._staticRepository.referenceKey(data, options);
    }

    async exportData(parentIdName: string, options?: any): Promise<any> {
        return AppUserToRole._staticRepository.exportData(
            this,

            parentIdName,
            options
        );
    }

    static async import(
        exportData: any,
        options?: any
    ): Promise<AppUserToRole> {
        return AppUserToRole._staticRepository.import(exportData, options);
    }

    static async importData(dataFromExport: any, options?: any): Promise<any> {
        return AppUserToRole._staticRepository.importData(
            dataFromExport,
            options
        );
    }

    static async importAll(
        pathToExportFiles: string,
        options?: any
    ): Promise<void> {
        return AppUserToRole._staticRepository.importAll(
            pathToExportFiles,
            options
        );
    }

    static async exportMany(where?: any, options?: any): Promise<void> {
        return AppUserToRole._staticRepository.exportMany(where, options);
    }

    static referenceKeyWithNulls(data: any, options?: any): any {
        return AppUserToRole._staticRepository.referenceKeyWithNulls(
            data,
            options
        );
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
