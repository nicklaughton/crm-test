import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { Staff } from './staff';
import { StaffFormArray } from './staff-form-array';

import { ProjectFormArray } from './project-form-array';

export class StaffFormGroup extends Staff {
    get controls() {
        return {
            id: this.idFormControl,
            name: this.nameFormControl,
            role: this.roleFormControl,
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

    get roleFormControl(): ApexFormControl {
        return this._getFormControl('role');
    }
    get projectsFormArray(): FormArray {
        return this._getFormRelation('projects') as FormArray;
    }

    get projects(): ProjectFormArray {
        return this._getListRelation('projects', {
            projectManagerId: this.getIdentifier(),
        });
    }
    set projects(value: ProjectFormArray) {
        this._setListRelation('projects', value, {
            projectManagerId: this.getIdentifier(),
        });
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<StaffFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<StaffFormArray> {
        return super._createAll<StaffFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<StaffFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<StaffFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<StaffFormArray> {
        return super._find<StaffFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<StaffFormGroup> {
        return super._findOne(options, context);
    }

    static async import(exportData: any): Promise<StaffFormGroup> {
        const result = await super.import(exportData);
        const output = result && result.toJSON ? result.toJSON() : result;
        return new StaffFormGroup(output);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            projects: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: ProjectFormArray,
            },
        });
    }

    applyVisibility(
        visibilityFunction: (formControls?: typeof this.controls) => void
    ) {
        super.applyVisibility(visibilityFunction);
    }
}
