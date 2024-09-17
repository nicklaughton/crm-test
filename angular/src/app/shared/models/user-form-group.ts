// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { User } from './user';
import { UserFormArray } from './user-form-array';

export class UserFormGroup extends User {
    get controls() {
        return {
            id: this.idFormControl,
            name: this.nameFormControl,
            username: this.usernameFormControl,
            email: this.emailFormControl,
            emailVerified: this.emailVerifiedFormControl,
            picture: this.pictureFormControl,
            realm: this.realmFormControl,
            verificationToken: this.verificationTokenFormControl,
            password: this.passwordFormControl,
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

    get nameFormControl(): ApexFormControl {
        return this._getFormControl('name');
    }

    get usernameFormControl(): ApexFormControl {
        return this._getFormControl('username');
    }

    get emailFormControl(): ApexFormControl {
        return this._getFormControl('email');
    }

    get emailVerifiedFormControl(): ApexFormControl {
        return this._getFormControl('emailVerified');
    }

    get pictureFormControl(): ApexFormControl {
        return this._getFormControl('picture');
    }

    get realmFormControl(): ApexFormControl {
        return this._getFormControl('realm');
    }

    get verificationTokenFormControl(): ApexFormControl {
        return this._getFormControl('verificationToken');
    }

    get passwordFormControl(): ApexFormControl {
        return this._getFormControl('password');
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<UserFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<UserFormArray> {
        return super._createAll<UserFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<UserFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<UserFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<UserFormArray> {
        return super._find<UserFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<UserFormGroup> {
        return super._findOne(options, context);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {});
    }

    applyVisibility(
        visibilityFunction: (formControls?: typeof this.controls) => void
    ) {
        super.applyVisibility(visibilityFunction);
    }
}
