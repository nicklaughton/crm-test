import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { Contact } from './contact';
import { ContactFormArray } from './contact-form-array';

import { ImageFormGroup } from './image-form-group';

import { CompanyFormGroup } from './company-form-group';

export class ContactFormGroup extends Contact {
    get controls() {
        return {
            id: this.idFormControl,
            name: this.nameFormControl,
            email: this.emailFormControl,
            phoneNumber: this.phoneNumberFormControl,
            jobTitle: this.jobTitleFormControl,
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

    get emailFormControl(): ApexFormControl {
        return this._getFormControl('email');
    }

    get phoneNumberFormControl(): ApexFormControl {
        return this._getFormControl('phoneNumber');
    }

    get jobTitleFormControl(): ApexFormControl {
        return this._getFormControl('jobTitle');
    }
    get companyIdFormControl(): ApexFormControl {
        return this._getFormControl('companyId');
    }
    get imageFormGroup(): FormGroup {
        return this._getFormRelation('image') as FormGroup;
    }

    get image(): ImageFormGroup {
        return this._getObjectRelation('image', {
            contactId: this.getIdentifier(),
        });
    }
    set image(value: ImageFormGroup) {
        this._setObjectRelation('image', value, '', '', {
            contactId: this.getIdentifier(),
        });
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
    ): Promise<ContactFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<ContactFormArray> {
        return super._createAll<ContactFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<ContactFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<ContactFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<ContactFormArray> {
        return super._find<ContactFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<ContactFormGroup> {
        return super._findOne(options, context);
    }

    static async import(exportData: any): Promise<ContactFormGroup> {
        const result = await super.import(exportData);
        const output = result && result.toJSON ? result.toJSON() : result;
        return new ContactFormGroup(output);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            image: {
                type: 'has one',
                fromType: 'belongs to',
                classReference: ImageFormGroup,
                foreignKey: 'contactId',
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
