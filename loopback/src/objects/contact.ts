import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';

import { Company } from '../objects/company';
import { CompanyArray } from '../objects/company-array';
import { Image } from '../objects/image';
import { ImageArray } from '../objects/image-array';

import { EmailAddress } from '../models';

import { ContactArray } from './contact-array';

const metadata = {
    name: 'Contact',
    pluralName: 'Contacts',
    displayName: 'Contact',
    pluralDisplayName: 'Contacts',
    infiniteArticle: 'a',
    arrayClass: ContactArray,
    properties: [
        {
            name: 'name',
            displayName: 'Name',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'email',
            displayName: 'Email',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'EmailAddress',
            },
        },
        {
            name: 'phoneNumber',
            displayName: 'Phone Number',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'jobTitle',
            displayName: 'Job Title',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
    ],
    relationships: {
        company: {
            name: 'company',
            type: 'belongs to',
            foreignKey: 'companyId',
            parentChildName: 'contacts',
            businessObject: {
                name: 'Company',
            },
        },

        image: {
            name: 'image',
            type: 'has one',
            childParentName: 'contact',
            businessObject: {
                name: 'Image',
            },
        },
    },
};

export class Contact extends ApexDataObject<Contact> {
    constructor();
    constructor(object: any);
    constructor(object: any, options: ApexDataOptions);
    constructor(object: any, options: ApexDataOptions, context: any);
    constructor(object?: any, options?: any, context?: any) {
        //Partial<Project>  new Account({save:'Aut'}, {})
        if (
            object &&
            object.http &&
            (object.save !== undefined || object.read !== undefined)
        ) {
            let temp = options;
            options = object;
            options.readAutomatically =
                options.readAutomatically || options.read == 'Automatically';
            options.saveAutomatically =
                options.saveAutomatically || options.save == 'Automatically';
            object = temp;
        }

        super(object, options, Contact, Contact._staticRepository, context);
    }
    public static metadata: any = metadata;

    protected static _idProperty: string = 'id';

    get id(): number {
        return this.getIdentifier();
    }
    set id(value: number) {
        this._updateId('id', value);
    }
    get name(): string {
        return this._get('name');
    }
    set name(value: string) {
        this._updateAttribute('name', value);
    }

    get email(): EmailAddress {
        return this._get('email');
    }
    set email(value: EmailAddress) {
        this._updateAttribute('email', value);
    }

    get phoneNumber(): string {
        return this._get('phoneNumber');
    }
    set phoneNumber(value: string) {
        this._updateAttribute('phoneNumber', value);
    }

    get jobTitle(): string {
        return this._get('jobTitle');
    }
    set jobTitle(value: string) {
        this._updateAttribute('jobTitle', value);
    }

    get companyId(): number {
        return this._get('companyId');
    }
    set companyId(value: number) {
        this._updateAttribute('companyId', value);
    }
    get image(): Image {
        return this._getObjectRelation('image', {
            contactId: this.getIdentifier(),
        });
    }
    set image(value: Image) {
        this._setObjectRelation('image', value, '', '', {
            contactId: this.getIdentifier(),
        });
    }
    get company(): Company {
        return this._getObjectRelation('company', { id: this.companyId });
    }
    set company(value: Company) {
        this._setObjectRelation('company', value, 'companyId', 'id');
    }
    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Contact> {
        return super.createWithChildren<Contact>(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<ContactArray> {
        return super._createAll<ContactArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Contact> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options: ApexDataOptions,
        context?: any
    ): Promise<Contact> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<ContactArray> {
        return super._find<ContactArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<Contact> {
        return super._findOne(options, context);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            image: {
                type: 'has one',
                fromType: 'belongs to',
                classReference: Image,
                foreignKey: 'contactId',
            },
            company: {
                fromType: 'has many',
                type: 'belongs to',
                classReference: Company,
            },
        });
    }

    async export(options?: any): Promise<any> {
        return Contact._staticRepository.export(
            this,

            options
        );
    }

    static referenceKey(data: any, options?: any): any {
        return Contact._staticRepository.referenceKey(data, options);
    }

    async exportData(parentIdName: string, options?: any): Promise<any> {
        return Contact._staticRepository.exportData(
            this,

            parentIdName,
            options
        );
    }

    static async import(exportData: any, options?: any): Promise<Contact> {
        return Contact._staticRepository.import(exportData, options);
    }

    static async importData(dataFromExport: any, options?: any): Promise<any> {
        return Contact._staticRepository.importData(dataFromExport, options);
    }

    static async importAll(
        pathToExportFiles: string,
        options?: any
    ): Promise<void> {
        return Contact._staticRepository.importAll(pathToExportFiles, options);
    }

    static async exportMany(where?: any, options?: any): Promise<void> {
        return Contact._staticRepository.exportMany(where, options);
    }

    static referenceKeyWithNulls(data: any, options?: any): any {
        return Contact._staticRepository.referenceKeyWithNulls(data, options);
    }
}
Object.defineProperty(Contact.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Contact.prototype, 'name', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Contact.prototype, 'email', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Contact.prototype, 'phoneNumber', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Contact.prototype, 'jobTitle', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Contact.prototype, 'company', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Contact.prototype, 'image', {
    enumerable: true,
    configurable: true,
});
