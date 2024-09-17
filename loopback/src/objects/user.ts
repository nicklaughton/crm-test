// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';

import { UserArray } from './user-array';

const metadata = {
    name: 'User',
    pluralName: 'Users',
    displayName: 'User',
    pluralDisplayName: 'Users',
    infiniteArticle: 'an',
    arrayClass: UserArray,
    properties: [
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
            name: 'username',
            displayName: 'Username',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'email',
            displayName: 'Email',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'emailVerified',
            displayName: 'Email Verified',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'boolean',
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
            name: 'realm',
            displayName: 'Realm',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'verificationToken',
            displayName: 'Verification Token',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'password',
            displayName: 'Password',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
    ],
    relationships: {},
};

export class User extends ApexDataObject<User> {
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

        super(object, options, User, User._staticRepository, context);
    }
    public static metadata: any = metadata;

    protected static _idProperty: string = 'id';

    get id(): number {
        return this.getIdentifier();
    }
    set id(value: number) {
        this._updateId('id', value);
    }
    get name(): string {
        return this._get('name');
    }
    set name(value: string) {
        this._updateAttribute('name', value);
    }

    get username(): string {
        return this._get('username');
    }
    set username(value: string) {
        this._updateAttribute('username', value);
    }

    get email(): string {
        return this._get('email');
    }
    set email(value: string) {
        this._updateAttribute('email', value);
    }

    get emailVerified(): boolean {
        return this._get('emailVerified');
    }
    set emailVerified(value: boolean) {
        this._updateAttribute('emailVerified', value);
    }

    get picture(): string {
        return this._get('picture');
    }
    set picture(value: string) {
        this._updateAttribute('picture', value);
    }

    get realm(): string {
        return this._get('realm');
    }
    set realm(value: string) {
        this._updateAttribute('realm', value);
    }

    get verificationToken(): string {
        return this._get('verificationToken');
    }
    set verificationToken(value: string) {
        this._updateAttribute('verificationToken', value);
    }

    get password(): string {
        return this._get('password');
    }
    set password(value: string) {
        this._updateAttribute('password', value);
    }
    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<User> {
        return super.createWithChildren<User>(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<UserArray> {
        return super._createAll<UserArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<User> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options: ApexDataOptions,
        context?: any
    ): Promise<User> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<UserArray> {
        return super._find<UserArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<User> {
        return super._findOne(options, context);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {});
    }
}
Object.defineProperty(User.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(User.prototype, 'name', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(User.prototype, 'username', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(User.prototype, 'email', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(User.prototype, 'emailVerified', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(User.prototype, 'picture', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(User.prototype, 'realm', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(User.prototype, 'verificationToken', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(User.prototype, 'password', {
    enumerable: true,
    configurable: true,
});
