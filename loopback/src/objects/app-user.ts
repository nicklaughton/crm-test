// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';

import { Auth0User } from '../objects/auth0-user';
import { Auth0UserArray } from '../objects/auth0-user-array';
import { AppUserToRole } from '../objects/app-user-to-role';
import { AppUserToRoleArray } from '../objects/app-user-to-role-array';

import { EmailAddress } from '../models';

import { AppUserArray } from './app-user-array';

const metadata = {
    name: 'AppUser',
    pluralName: 'AppUsers',
    displayName: 'App User',
    pluralDisplayName: 'App Users',
    infiniteArticle: 'an',
    arrayClass: AppUserArray,
    properties: [
        {
            name: 'email',
            displayName: 'Email',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'EmailAddress',
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
            name: 'picture',
            displayName: 'Picture',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'lastSeen',
            displayName: 'Last Seen',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'Date',
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
    ],
    relationships: {
        auth0Users: {
            name: 'auth0Users',
            type: 'has many',
            childParentName: 'appUser',
            businessObject: {
                name: 'Auth0User',
            },
        },

        appUserToRoles: {
            name: 'appUserToRoles',
            type: 'has many',
            childParentName: 'appUser',
            businessObject: {
                name: 'AppUserToRole',
            },
        },
    },
};

export class AppUser extends ApexDataObject<AppUser> {
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

        super(object, options, AppUser, AppUser._staticRepository, context);

        if (options?.isInitializeRelationships)
            this._initializeRelationships(object, [
                'auth0Users',
                'appUserToRoles',
            ]);
    }
    public static metadata: any = metadata;

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
    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUser> {
        return super.createWithChildren<AppUser>(data, options, context);
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
        options: ApexDataOptions,
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

    static async currentUser(filter?: any, options?: any): Promise<AppUser> {
        return AppUser._staticRepository.currentUser(filter, options);
    }

    async export(options?: any): Promise<any> {
        return AppUser._staticRepository.export(
            this,

            options
        );
    }

    static referenceKey(data: any, options?: any): any {
        return AppUser._staticRepository.referenceKey(data, options);
    }

    async exportData(parentIdName: string, options?: any): Promise<any> {
        return AppUser._staticRepository.exportData(
            this,

            parentIdName,
            options
        );
    }

    static async import(exportData: any, options?: any): Promise<AppUser> {
        return AppUser._staticRepository.import(exportData, options);
    }

    static async importData(dataFromExport: any, options?: any): Promise<any> {
        return AppUser._staticRepository.importData(dataFromExport, options);
    }

    static async importAll(
        pathToExportFiles: string,
        options?: any
    ): Promise<void> {
        return AppUser._staticRepository.importAll(pathToExportFiles, options);
    }

    static async exportMany(where?: any, options?: any): Promise<void> {
        return AppUser._staticRepository.exportMany(where, options);
    }

    static referenceKeyWithNulls(data: any, options?: any): any {
        return AppUser._staticRepository.referenceKeyWithNulls(data, options);
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
