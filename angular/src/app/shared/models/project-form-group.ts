import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { Project } from './project';
import { ProjectFormArray } from './project-form-array';

import { StaffFormGroup } from './staff-form-group';

import { CompanyFormGroup } from './company-form-group';

export class ProjectFormGroup extends Project {
    get controls() {
        return {
            id: this.idFormControl,
            name: this.nameFormControl,
            startDate: this.startDateFormControl,
            endDate: this.endDateFormControl,
            description: this.descriptionFormControl,
            total: this.totalFormControl,
            projectManagerId: this.projectManagerIdFormControl,
            companyId: this.companyIdFormControl,
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

    get startDateFormControl(): ApexFormControl {
        return this._getFormControl('startDate');
    }

    get endDateFormControl(): ApexFormControl {
        return this._getFormControl('endDate');
    }

    get descriptionFormControl(): ApexFormControl {
        return this._getFormControl('description');
    }

    get totalFormControl(): ApexFormControl {
        return this._getFormControl('total');
    }
    get projectManagerIdFormControl(): ApexFormControl {
        return this._getFormControl('projectManagerId');
    }
    get companyIdFormControl(): ApexFormControl {
        return this._getFormControl('companyId');
    }
    get projectManagerFormGroup(): FormGroup {
        return this._getFormRelation('projectManager') as FormGroup;
    }

    get projectManager(): StaffFormGroup {
        return this._getObjectRelation('projectManager', {
            id: this.projectManagerId,
        });
    }
    set projectManager(value: StaffFormGroup) {
        this._setObjectRelation(
            'projectManager',
            value,
            'projectManagerId',
            'id'
        );
    }
    get companyFormGroup(): FormGroup {
        return this._getFormRelation('company') as FormGroup;
    }

    get company(): CompanyFormGroup {
        return this._getObjectRelation('company', { id: this.companyId });
    }
    set company(value: CompanyFormGroup) {
        this._setObjectRelation('company', value, 'companyId', 'id');
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<ProjectFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<ProjectFormArray> {
        return super._createAll<ProjectFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<ProjectFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<ProjectFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<ProjectFormArray> {
        return super._find<ProjectFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<ProjectFormGroup> {
        return super._findOne(options, context);
    }

    static async import(exportData: any): Promise<ProjectFormGroup> {
        const result = await super.import(exportData);
        const output = result && result.toJSON ? result.toJSON() : result;
        return new ProjectFormGroup(output);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            projectManager: {
                fromType: 'has many',
                type: 'belongs to',
                classReference: StaffFormGroup,
            },
            company: {
                fromType: 'has many',
                type: 'belongs to',
                classReference: CompanyFormGroup,
            },
        });
    }

    applyVisibility(
        visibilityFunction: (formControls?: typeof this.controls) => void
    ) {
        super.applyVisibility(visibilityFunction);
    }
}
