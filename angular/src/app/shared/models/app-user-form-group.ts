// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { AppUser } from './app-user';
import { AppUserFormArray } from './app-user-form-array';

import { Auth0UserFormArray } from './auth0-user-form-array';

import { AppUserToRoleFormArray } from './app-user-to-role-form-array';

export class AppUserFormGroup extends AppUser {
    get controls() {
        return {
            id: this.idFormControl,
            email: this.emailFormControl,
            name: this.nameFormControl,
            picture: this.pictureFormControl,
            lastSeen: this.lastSeenFormControl,
            created: this.createdFormControl,
        };
    }

    constructor();
    constructor(object: any);
    constructor(object: any, options: ApexDataOptions);
    constructor(object: any, options: ApexDataOptions, context: any);
    constructor(object?: any, options?: any, context?: any) {
        if (
            object &&
            object.http &&
            (object.save !== undefined || object.read !== undefined)
        )
            object['isForms'] = true;
        else if (!options) options = { isForms: true };
        else options['isForms'] = true;
        super(object, options, context);
    }

    get idFormControl(): ApexFormControl {
        return this._getFormControl('id');
    }

    get emailFormControl(): ApexFormControl {
        return this._getFormControl('email');
    }

    get nameFormControl(): ApexFormControl {
        return this._getFormControl('name');
    }

    get pictureFormControl(): ApexFormControl {
        return this._getFormControl('picture');
    }

    get lastSeenFormControl(): ApexFormControl {
        return this._getFormControl('lastSeen');
    }

    get createdFormControl(): ApexFormControl {
        return this._getFormControl('created');
    }
    get auth0UsersFormArray(): FormArray {
        return this._getFormRelation('auth0Users') as FormArray;
    }

    get auth0Users(): Auth0UserFormArray {
        return this._getListRelation('auth0Users', {
            appUserId: this.getIdentifier(),
        });
    }
    set auth0Users(value: Auth0UserFormArray) {
        this._setListRelation('auth0Users', value, {
            appUserId: this.getIdentifier(),
        });
    }
    get appUserToRolesFormArray(): FormArray {
        return this._getFormRelation('appUserToRoles') as FormArray;
    }

    get appUserToRoles(): AppUserToRoleFormArray {
        return this._getListRelation('appUserToRoles', {
            appUserId: this.getIdentifier(),
        });
    }
    set appUserToRoles(value: AppUserToRoleFormArray) {
        this._setListRelation('appUserToRoles', value, {
            appUserId: this.getIdentifier(),
        });
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserFormArray> {
        return super._createAll<AppUserFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<AppUserFormArray> {
        return super._find<AppUserFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<AppUserFormGroup> {
        return super._findOne(options, context);
    }

    static async currentUser(filter?: any): Promise<AppUserFormGroup> {
        const result = await super.currentUser(filter);
        const output = result && result.toJSON ? result.toJSON() : result;
        return new AppUserFormGroup(output);
    }

    static async import(exportData: any): Promise<AppUserFormGroup> {
        const result = await super.import(exportData);
        const output = result && result.toJSON ? result.toJSON() : result;
        return new AppUserFormGroup(output);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            auth0Users: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: Auth0UserFormArray,
            },

            appUserToRoles: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: AppUserToRoleFormArray,
            },
        });
    }

    applyVisibility(
        visibilityFunction: (formControls?: typeof this.controls) => void
    ) {
        super.applyVisibility(visibilityFunction);
    }
}
