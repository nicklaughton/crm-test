import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { Supplier } from './supplier';
import { SupplierFormArray } from './supplier-form-array';

export class SupplierFormGroup extends Supplier {
    get controls() {
        return {
            id: this.idFormControl,
            name: this.nameFormControl,
            code: this.codeFormControl,
            country: this.countryFormControl,
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

    get codeFormControl(): ApexFormControl {
        return this._getFormControl('code');
    }

    get countryFormControl(): ApexFormControl {
        return this._getFormControl('country');
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<SupplierFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<SupplierFormArray> {
        return super._createAll<SupplierFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<SupplierFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<SupplierFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<SupplierFormArray> {
        return super._find<SupplierFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<SupplierFormGroup> {
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
