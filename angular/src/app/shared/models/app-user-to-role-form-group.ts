// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { AppUserToRole } from './app-user-to-role';
import { AppUserToRoleFormArray } from './app-user-to-role-form-array';

import { RoleFormGroup } from './role-form-group';

import { AppUserFormGroup } from './app-user-form-group';

export class AppUserToRoleFormGroup extends AppUserToRole {
    get controls() {
        return {
            id: this.idFormControl,
            roleId: this.roleIdFormControl,
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
    get roleIdFormControl(): ApexFormControl {
        return this._getFormControl('roleId');
    }
    get appUserIdFormControl(): ApexFormControl {
        return this._getFormControl('appUserId');
    }
    get roleFormGroup(): FormGroup {
        return this._getFormRelation('role') as FormGroup;
    }

    get role(): RoleFormGroup {
        return this._getObjectRelation('role', { id: this.roleId });
    }
    set role(value: RoleFormGroup) {
        this._setObjectRelation('role', value, 'roleId', 'id');
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
    ): Promise<AppUserToRoleFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserToRoleFormArray> {
        return super._createAll<AppUserToRoleFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserToRoleFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<AppUserToRoleFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<AppUserToRoleFormArray> {
        return super._find<AppUserToRoleFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<AppUserToRoleFormGroup> {
        return super._findOne(options, context);
    }

    static async import(exportData: any): Promise<AppUserToRoleFormGroup> {
        const result = await super.import(exportData);
        const output = result && result.toJSON ? result.toJSON() : result;
        return new AppUserToRoleFormGroup(output);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            role: {
                fromType: 'has many',
                type: 'belongs to',
                classReference: RoleFormGroup,
            },
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
