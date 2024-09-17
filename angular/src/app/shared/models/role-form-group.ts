// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { Role } from './role';
import { RoleFormArray } from './role-form-array';

import { AppUserToRoleFormArray } from './app-user-to-role-form-array';

export class RoleFormGroup extends Role {
    get controls() {
        return {
            id: this.idFormControl,
            description: this.descriptionFormControl,
            name: this.nameFormControl,
            created: this.createdFormControl,
            modified: this.modifiedFormControl,
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

    get descriptionFormControl(): ApexFormControl {
        return this._getFormControl('description');
    }

    get nameFormControl(): ApexFormControl {
        return this._getFormControl('name');
    }

    get createdFormControl(): ApexFormControl {
        return this._getFormControl('created');
    }

    get modifiedFormControl(): ApexFormControl {
        return this._getFormControl('modified');
    }
    get appUserToRolesFormArray(): FormArray {
        return this._getFormRelation('appUserToRoles') as FormArray;
    }

    get appUserToRoles(): AppUserToRoleFormArray {
        return this._getListRelation('appUserToRoles', {
            roleId: this.getIdentifier(),
        });
    }
    set appUserToRoles(value: AppUserToRoleFormArray) {
        this._setListRelation('appUserToRoles', value, {
            roleId: this.getIdentifier(),
        });
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<RoleFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<RoleFormArray> {
        return super._createAll<RoleFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<RoleFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<RoleFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<RoleFormArray> {
        return super._find<RoleFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<RoleFormGroup> {
        return super._findOne(options, context);
    }

    static async import(exportData: any): Promise<RoleFormGroup> {
        const result = await super.import(exportData);
        const output = result && result.toJSON ? result.toJSON() : result;
        return new RoleFormGroup(output);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
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
