import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';
import { ImageArray } from './image-array';

import { Contact } from './contact';
import { ContactArray } from './contact-array';

export class Image extends ApexDataObject<Image> {
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

        super(object, options, Image, Image._staticRepository);
    }
    public static metadata = {
        name: `Image`,
        pluralName: `Images`,
        displayName: `Image`,
        pluralDisplayName: `Images`,
        infiniteArticle: `an`,
        description: null,
        isInRootProject: true,
        isClientSideOnly: false,
        properties: [
            {
                name: `fileName`,
                displayName: `File Name`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'string',
                },
            },
            {
                name: `mimeType`,
                displayName: `Mime Type`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'string',
                },
            },
            {
                name: `size`,
                displayName: `Size`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'number',
                },
            },
            {
                name: `base64Content`,
                displayName: `Base64 Content`,
                isRequired: false,
                isHidden: true,
                isId: false,
                type: {
                    name: 'string',
                },
            },
            {
                name: `hash`,
                displayName: `Hash`,
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
                name: `download`,
                displayName: `Download`,
                description: null,
                type: 'Instance Behavior',
                subType: 'Get',
                url: null,
                parameters: [],
                returnIsArray: false,
                returnType: {
                    name: 'void',
                },
            },
            {
                name: `updateHash`,
                displayName: `Update Hash`,
                description: null,
                type: 'Event Handler',
                subType: 'Before Save',
                url: null,
                parameters: [],
                returnIsArray: false,
                returnType: {
                    name: 'void',
                },
            },
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
            contact: {
                name: 'contact',
                type: 'belongs to',
                foreignKey: 'contactId',
                parentChildName: 'image',
                businessObject: {
                    name: 'Contact',
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
    get fileName(): string {
        return this._get('fileName');
    }

    set fileName(value: string) {
        this._updateAttribute('fileName', value);
    }

    get mimeType(): string {
        return this._get('mimeType');
    }

    set mimeType(value: string) {
        this._updateAttribute('mimeType', value);
    }

    get size(): number {
        return this._get('size');
    }

    set size(value: number) {
        this._updateAttribute('size', value);
    }

    get base64Content(): string {
        return this._get('base64Content');
    }

    set base64Content(value: string) {
        this._updateAttribute('base64Content', value);
    }

    get hash(): string {
        return this._get('hash');
    }

    set hash(value: string) {
        this._updateAttribute('hash', value);
    }

    get contactId(): number {
        return this._get('contactId');
    }
    set contactId(value: number) {
        this._updateAttribute('contactId', value);
    }
    get contact(): Contact {
        return this._getObjectRelation('contact', { id: this.contactId });
    }
    set contact(value: Contact) {
        this._setObjectRelation('contact', value, 'contactId', 'id');
    }
    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            contact: {
                fromType: 'has one',
                type: 'belongs to',
                classReference: Contact,
            },
        });
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Image> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<ImageArray> {
        return super._createAll<ImageArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Image> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Image> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<ImageArray> {
        return super._find<ImageArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<Image> {
        return super._findOne(options, context);
    }

    async download(): Promise<void> {
        const _url =
            this._repository.apiUrl +
            '/' +
            encodeURIComponent(this.getIdentifier()) +
            '/' +
            `download`;

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

    static async import(exportData: any): Promise<Image> {
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
Object.defineProperty(Image.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Image.prototype, 'fileName', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Image.prototype, 'mimeType', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Image.prototype, 'size', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Image.prototype, 'base64Content', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Image.prototype, 'hash', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Image.prototype, 'contact', {
    enumerable: true,
    configurable: true,
});
