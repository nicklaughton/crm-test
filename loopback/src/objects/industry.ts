import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';

import { Company } from '../objects/company';
import { CompanyArray } from '../objects/company-array';

import { IndustryArray } from './industry-array';

const metadata = {
    name: 'Industry',
    pluralName: 'Industries',
    displayName: 'Industry',
    pluralDisplayName: 'Industries',
    infiniteArticle: 'an',
    arrayClass: IndustryArray,
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
    ],
    relationships: {
        companies: {
            name: 'companies',
            type: 'has many',
            childParentName: 'industry',
            businessObject: {
                name: 'Company',
            },
        },
    },
};

export class Industry extends ApexDataObject<Industry> {
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

        super(object, options, Industry, Industry._staticRepository, context);

        if (options?.isInitializeRelationships)
            this._initializeRelationships(object, ['companies']);
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
    get companies(): CompanyArray {
        return this._getListRelation('companies', {
            industryId: this.getIdentifier(),
        });
    }
    set companies(value: CompanyArray) {
        this._setListRelation('companies', value, {
            industryId: this.getIdentifier(),
        });
    }
    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Industry> {
        return super.createWithChildren<Industry>(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<IndustryArray> {
        return super._createAll<IndustryArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Industry> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options: ApexDataOptions,
        context?: any
    ): Promise<Industry> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<IndustryArray> {
        return super._find<IndustryArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<Industry> {
        return super._findOne(options, context);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            companies: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: CompanyArray,
            },
        });
    }

    async export(options?: any): Promise<any> {
        return Industry._staticRepository.export(
            this,

            options
        );
    }

    static referenceKey(data: any, options?: any): any {
        return Industry._staticRepository.referenceKey(data, options);
    }

    async exportData(parentIdName: string, options?: any): Promise<any> {
        return Industry._staticRepository.exportData(
            this,

            parentIdName,
            options
        );
    }

    static async import(exportData: any, options?: any): Promise<Industry> {
        return Industry._staticRepository.import(exportData, options);
    }

    static async importData(dataFromExport: any, options?: any): Promise<any> {
        return Industry._staticRepository.importData(dataFromExport, options);
    }

    static async importAll(
        pathToExportFiles: string,
        options?: any
    ): Promise<void> {
        return Industry._staticRepository.importAll(pathToExportFiles, options);
    }

    static async exportMany(where?: any, options?: any): Promise<void> {
        return Industry._staticRepository.exportMany(where, options);
    }

    static referenceKeyWithNulls(data: any, options?: any): any {
        return Industry._staticRepository.referenceKeyWithNulls(data, options);
    }
}
Object.defineProperty(Industry.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Industry.prototype, 'name', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Industry.prototype, 'companies', {
    enumerable: true,
    configurable: true,
});
