import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { Industry } from './industry';
import { IndustryFormArray } from './industry-form-array';

import { CompanyFormArray } from './company-form-array';

export class IndustryFormGroup extends Industry {
    get controls() {
        return {
            id: this.idFormControl,
            name: this.nameFormControl,
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
    get companiesFormArray(): FormArray {
        return this._getFormRelation('companies') as FormArray;
    }

    get companies(): CompanyFormArray {
        return this._getListRelation('companies', {
            industryId: this.getIdentifier(),
        });
    }
    set companies(value: CompanyFormArray) {
        this._setListRelation('companies', value, {
            industryId: this.getIdentifier(),
        });
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<IndustryFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<IndustryFormArray> {
        return super._createAll<IndustryFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<IndustryFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<IndustryFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<IndustryFormArray> {
        return super._find<IndustryFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<IndustryFormGroup> {
        return super._findOne(options, context);
    }

    static async import(exportData: any): Promise<IndustryFormGroup> {
        const result = await super.import(exportData);
        const output = result && result.toJSON ? result.toJSON() : result;
        return new IndustryFormGroup(output);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            companies: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: CompanyFormArray,
            },
        });
    }

    applyVisibility(
        visibilityFunction: (formControls?: typeof this.controls) => void
    ) {
        super.applyVisibility(visibilityFunction);
    }
}
