// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { Auth0User } from './auth0-user';
import { Auth0UserFormArray } from './auth0-user-form-array';

import { AppUserFormGroup } from './app-user-form-group';

export class Auth0UserFormGroup extends Auth0User {
    get controls() {
        return {
            id: this.idFormControl,
            sub: this.subFormControl,
            profileUpdated: this.profileUpdatedFormControl,
            appUserId: this.appUserIdFormControl,
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

    get subFormControl(): ApexFormControl {
        return this._getFormControl('sub');
    }

    get profileUpdatedFormControl(): ApexFormControl {
        return this._getFormControl('profileUpdated');
    }
    get appUserIdFormControl(): ApexFormControl {
        return this._getFormControl('appUserId');
    }
    get appUserFormGroup(): FormGroup {
        return this._getFormRelation('appUser') as FormGroup;
    }

    get appUser(): AppUserFormGroup {
        return this._getObjectRelation('appUser', { id: this.appUserId });
    }
    set appUser(value: AppUserFormGroup) {
        this._setObjectRelation('appUser', value, 'appUserId', 'id');
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Auth0UserFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<Auth0UserFormArray> {
        return super._createAll<Auth0UserFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Auth0UserFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Auth0UserFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<Auth0UserFormArray> {
        return super._find<Auth0UserFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<Auth0UserFormGroup> {
        return super._findOne(options, context);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            appUser: {
                fromType: 'has many',
                type: 'belongs to',
                classReference: AppUserFormGroup,
            },
        });
    }

    applyVisibility(
        visibilityFunction: (formControls?: typeof this.controls) => void
    ) {
        super.applyVisibility(visibilityFunction);
    }
}
