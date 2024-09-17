import { FormGroup, FormArray } from '@angular/forms';
import { ApexFormControl } from './apex-form-control';
import { ApexDataOptions } from './apex-data-options';

import { Image } from './image';
import { ImageFormArray } from './image-form-array';

import { ContactFormGroup } from './contact-form-group';

export class ImageFormGroup extends Image {
    get controls() {
        return {
            id: this.idFormControl,
            fileName: this.fileNameFormControl,
            mimeType: this.mimeTypeFormControl,
            size: this.sizeFormControl,
            base64Content: this.base64ContentFormControl,
            hash: this.hashFormControl,
            contactId: this.contactIdFormControl,
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

    get fileNameFormControl(): ApexFormControl {
        return this._getFormControl('fileName');
    }

    get mimeTypeFormControl(): ApexFormControl {
        return this._getFormControl('mimeType');
    }

    get sizeFormControl(): ApexFormControl {
        return this._getFormControl('size');
    }

    get base64ContentFormControl(): ApexFormControl {
        return this._getFormControl('base64Content');
    }

    get hashFormControl(): ApexFormControl {
        return this._getFormControl('hash');
    }
    get contactIdFormControl(): ApexFormControl {
        return this._getFormControl('contactId');
    }
    get contactFormGroup(): FormGroup {
        return this._getFormRelation('contact') as FormGroup;
    }

    get contact(): ContactFormGroup {
        return this._getObjectRelation('contact', { id: this.contactId });
    }
    set contact(value: ContactFormGroup) {
        this._setObjectRelation('contact', value, 'contactId', 'id');
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<ImageFormGroup> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<ImageFormArray> {
        return super._createAll<ImageFormArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<ImageFormGroup> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<ImageFormGroup> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<ImageFormArray> {
        return super._find<ImageFormArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<ImageFormGroup> {
        return super._findOne(options, context);
    }

    static async import(exportData: any): Promise<ImageFormGroup> {
        const result = await super.import(exportData);
        const output = result && result.toJSON ? result.toJSON() : result;
        return new ImageFormGroup(output);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            contact: {
                fromType: 'has one',
                type: 'belongs to',
                classReference: ContactFormGroup,
            },
        });
    }

    applyVisibility(
        visibilityFunction: (formControls?: typeof this.controls) => void
    ) {
        super.applyVisibility(visibilityFunction);
    }
}
