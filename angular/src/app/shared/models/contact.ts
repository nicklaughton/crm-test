import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';
import { ContactArray } from './contact-array';

import { Company } from './company';
import { CompanyArray } from './company-array';
import { Image } from './image';
import { ImageArray } from './image-array';

type EmailAddress = string;

export class Contact extends ApexDataObject<Contact> {
    constructor();
    constructor(object: any);
    constructor(object: any, options: ApexDataOptions);
    constructor(object: any, options: ApexDataOptions, context: any);
    constructor(object?: any, options?: any, context?: any) {
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

        super(object, options, Contact, Contact._staticRepository);
    }
    public static metadata = {
        name: `Contact`,
        pluralName: `Contacts`,
        displayName: `Contact`,
        pluralDisplayName: `Contacts`,
        infiniteArticle: `a`,
        description: null,
        isInRootProject: true,
        isClientSideOnly: false,
        properties: [
            {
                name: `name`,
                displayName: `Name`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'string',
                },
            },
            {
                name: `email`,
                displayName: `Email`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'EmailAddress',
                    pattern: `^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$`,
                    patternMessage: `Please enter a valid email address.`,
                },
            },
            {
                name: `phoneNumber`,
                displayName: `Phone Number`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'string',
                },
            },
            {
                name: `jobTitle`,
                displayName: `Job Title`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'string',
                },
            },
        ],
        behaviors: [
            {
                name: `export`,
                displayName: `Export`,
                description: null,
                type: 'Instance Behavior',
                subType: 'Get',
                url: null,
                parameters: [],
                returnIsArray: false,
                returnType: {
                    name: 'any',
                },
            },
            {
                name: `import`,
                displayName: `Import`,
                description: 'Import JSON to create or update an item.',
                type: 'Class Behavior',
                subType: 'Post',
                url: 'null',
                parameters: [
                    {
                        name: 'exportData',
                        description: 'JSON export data.',
                        type: {
                            name: 'any',
                        },
                    },
                ],
                returnIsArray: false,
                returnType: {
                    name: 'Model',
                },
            },
            {
                name: `exportMany`,
                displayName: `Export Many`,
                description: null,
                type: 'Class Behavior',
                subType: 'Get',
                url: null,
                parameters: [
                    {
                        name: 'where',
                        description: null,
                        type: {
                            name: 'any',
                        },
                    },
                ],
                returnIsArray: false,
                returnType: {
                    name: 'void',
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
                foreignKey: 'contactId',
                childParentName: 'contact',
                businessObject: {
                    name: 'Image',
                },
            },
        },
    };

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

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Contact> {
        return super._create(data, options, context);
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
        options?: ApexDataOptions,
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

    async export(): Promise<any> {
        const _url =
            this._repository.apiUrl +
            '/' +
            encodeURIComponent(this.getIdentifier()) +
            '/' +
            `export`;

        const params = {};

        const args = { params };

        return new Promise((resolve, reject) => {
            this._repository.httpClient.get(_url, args).subscribe(
                (res) => {
                    resolve(res);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    static async import(exportData: any): Promise<Contact> {
        const _url = this._staticRepository.apiUrl + '/' + `import`;

        const params = {
            exportData: exportData,
        };
        for (let param in params)
            if (params[param] === undefined) delete params[param];

        return new Promise((resolve, reject) => {
            this._staticRepository.httpClient.post(_url, params).subscribe(
                (res) => {
                    resolve(res);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    static async exportMany(where?: any): Promise<void> {
        const _url = this._staticRepository.apiUrl + '/' + `exportMany`;

        const params = {
            where:
                where && typeof where == 'object'
                    ? JSON.stringify(where)
                    : where,
        };
        for (let param in params)
            if (params[param] === undefined) delete params[param];
        const args = { params };

        return new Promise((resolve, reject) => {
            this._staticRepository.httpClient.get(_url, args).subscribe(
                (res) => {
                    resolve(res);
                },
                (err) => {
                    reject(err);
                }
            );
        });
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
