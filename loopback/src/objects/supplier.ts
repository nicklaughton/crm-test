import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';

import { Country } from '../models';

import { SupplierArray } from './supplier-array';

const metadata = {
    name: 'Supplier',
    pluralName: 'Suppliers',
    displayName: 'Supplier',
    pluralDisplayName: 'Suppliers',
    infiniteArticle: 'a',
    arrayClass: SupplierArray,
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
            name: 'code',
            displayName: 'Code',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'country',
            displayName: 'Country',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'Country',
            },
        },
    ],
    relationships: {},
};

export class Supplier extends ApexDataObject<Supplier> {
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

        super(object, options, Supplier, Supplier._staticRepository, context);
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

    get code(): string {
        return this._get('code');
    }
    set code(value: string) {
        this._updateAttribute('code', value);
    }

    get country(): Country {
        return this._get('country');
    }
    set country(value: Country) {
        this._updateAttribute('country', value);
    }
    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Supplier> {
        return super.createWithChildren<Supplier>(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<SupplierArray> {
        return super._createAll<SupplierArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Supplier> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options: ApexDataOptions,
        context?: any
    ): Promise<Supplier> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<SupplierArray> {
        return super._find<SupplierArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<Supplier> {
        return super._findOne(options, context);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {});
    }
}
Object.defineProperty(Supplier.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Supplier.prototype, 'name', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Supplier.prototype, 'code', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Supplier.prototype, 'country', {
    enumerable: true,
    configurable: true,
});
