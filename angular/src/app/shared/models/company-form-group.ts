import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { Company } from './company';
import { CompanyFormArray } from './company-form-array';

import { ContactFormArray } from './contact-form-array';

import { ProjectFormArray } from './project-form-array';

import { IndustryFormGroup } from './industry-form-group';

export class CompanyFormGroup extends Company {
    get controls() {
        return {
            id: this.idFormControl,
            name: this.nameFormControl,
            description: this.descriptionFormControl,
            website: this.websiteFormControl,
            image: this.imageFormControl,
            industryId: this.industryIdFormControl,
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

    get descriptionFormControl(): ApexFormControl {
        return this._getFormControl('description');
    }

    get websiteFormControl(): ApexFormControl {
        return this._getFormControl('website');
    }

    get imageFormControl(): ApexFormControl {
        return this._getFormControl('image');
    }
    get industryIdFormControl(): ApexFormControl {
        return this._getFormControl('industryId');
    }
    get contactsFormArray(): FormArray {
        return this._getFormRelation('contacts') as FormArray;
    }

    get contacts(): ContactFormArray {
        return this._getListRelation('contacts', {
            companyId: this.getIdentifier(),
        });
    }
    set contacts(value: ContactFormArray) {
        this._setListRelation('contacts', value, {
            companyId: this.getIdentifier(),
        });
    }
    get projectsFormArray(): FormArray {
        return this._getFormRelation('projects') as FormArray;
    }

    get projects(): ProjectFormArray {
        return this._getListRelation('projects', {
            companyId: this.getIdentifier(),
        });
    }
    set projects(value: ProjectFormArray) {
        this._setListRelation('projects', value, {
            companyId: this.getIdentifier(),
        });
    }
    get industryFormGroup(): FormGroup {
        return this._getFormRelation('industry') as FormGroup;
    }

    get industry(): IndustryFormGroup {
        return this._getObjectRelation('industry', { id: this.industryId });
    }
    set industry(value: IndustryFormGroup) {
        this._setObjectRelation('industry', value, 'industryId', 'id');
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<CompanyFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<CompanyFormArray> {
        return super._createAll<CompanyFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<CompanyFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<CompanyFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<CompanyFormArray> {
        return super._find<CompanyFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<CompanyFormGroup> {
        return super._findOne(options, context);
    }

    static async import(exportData: any): Promise<CompanyFormGroup> {
        const result = await super.import(exportData);
        const output = result && result.toJSON ? result.toJSON() : result;
        return new CompanyFormGroup(output);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            contacts: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: ContactFormArray,
            },

            projects: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: ProjectFormArray,
            },
            industry: {
                fromType: 'has many',
                type: 'belongs to',
                classReference: IndustryFormGroup,
            },
        });
    }

    applyVisibility(
        visibilityFunction: (formControls?: typeof this.controls) => void
    ) {
        super.applyVisibility(visibilityFunction);
    }
}
