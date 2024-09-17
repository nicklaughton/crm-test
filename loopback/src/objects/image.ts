import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';

import { Contact } from '../objects/contact';
import { ContactArray } from '../objects/contact-array';

import { ImageArray } from './image-array';

const metadata = {
    name: 'Image',
    pluralName: 'Images',
    displayName: 'Image',
    pluralDisplayName: 'Images',
    infiniteArticle: 'an',
    arrayClass: ImageArray,
    properties: [
        {
            name: 'fileName',
            displayName: 'File Name',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'mimeType',
            displayName: 'Mime Type',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'size',
            displayName: 'Size',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'number',
            },
        },
        {
            name: 'base64Content',
            displayName: 'Base64 Content',
            isRequired: false,
            isHidden: true,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'hash',
            displayName: 'Hash',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
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

export class Image extends ApexDataObject<Image> {
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

        super(object, options, Image, Image._staticRepository, context);
    }
    public static metadata: any = metadata;

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
    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Image> {
        return super.createWithChildren<Image>(data, options, context);
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
        options: ApexDataOptions,
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

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            contact: {
                fromType: 'has one',
                type: 'belongs to',
                classReference: Contact,
            },
        });
    }

    async download(options?: any): Promise<void> {
        return Image._staticRepository.download(
            this,

            options
        );
    }

    async export(options?: any): Promise<any> {
        return Image._staticRepository.export(
            this,

            options
        );
    }

    static referenceKey(data: any, options?: any): any {
        return Image._staticRepository.referenceKey(data, options);
    }

    async exportData(parentIdName: string, options?: any): Promise<any> {
        return Image._staticRepository.exportData(
            this,

            parentIdName,
            options
        );
    }

    static async import(exportData: any, options?: any): Promise<Image> {
        return Image._staticRepository.import(exportData, options);
    }

    static async importData(dataFromExport: any, options?: any): Promise<any> {
        return Image._staticRepository.importData(dataFromExport, options);
    }

    static async importAll(
        pathToExportFiles: string,
        options?: any
    ): Promise<void> {
        return Image._staticRepository.importAll(pathToExportFiles, options);
    }

    static async exportMany(where?: any, options?: any): Promise<void> {
        return Image._staticRepository.exportMany(where, options);
    }

    static referenceKeyWithNulls(data: any, options?: any): any {
        return Image._staticRepository.referenceKeyWithNulls(data, options);
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
