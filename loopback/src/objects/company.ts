import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';

import { Industry } from '../objects/industry';
import { IndustryArray } from '../objects/industry-array';
import { Contact } from '../objects/contact';
import { ContactArray } from '../objects/contact-array';
import { Project } from '../objects/project';
import { ProjectArray } from '../objects/project-array';

import { CompanyArray } from './company-array';

const metadata = {
    name: 'Company',
    pluralName: 'Companies',
    displayName: 'Company',
    pluralDisplayName: 'Companies',
    infiniteArticle: 'a',
    arrayClass: CompanyArray,
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
            name: 'description',
            displayName: 'Description',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'website',
            displayName: 'Website',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
        {
            name: 'image',
            displayName: 'Image',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'string',
            },
        },
    ],
    relationships: {
        industry: {
            name: 'industry',
            type: 'belongs to',
            foreignKey: 'industryId',
            parentChildName: 'companies',
            businessObject: {
                name: 'Industry',
            },
        },

        contacts: {
            name: 'contacts',
            type: 'has many',
            childParentName: 'company',
            businessObject: {
                name: 'Contact',
            },
        },

        projects: {
            name: 'projects',
            type: 'has many',
            childParentName: 'company',
            businessObject: {
                name: 'Project',
            },
        },
    },
};

export class Company extends ApexDataObject<Company> {
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

        super(object, options, Company, Company._staticRepository, context);

        if (options?.isInitializeRelationships)
            this._initializeRelationships(object, ['contacts', 'projects']);
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

    get description(): string {
        return this._get('description');
    }
    set description(value: string) {
        this._updateAttribute('description', value);
    }

    get website(): string {
        return this._get('website');
    }
    set website(value: string) {
        this._updateAttribute('website', value);
    }

    get image(): string {
        return this._get('image');
    }
    set image(value: string) {
        this._updateAttribute('image', value);
    }

    get industryId(): number {
        return this._get('industryId');
    }
    set industryId(value: number) {
        this._updateAttribute('industryId', value);
    }
    get contacts(): ContactArray {
        return this._getListRelation('contacts', {
            companyId: this.getIdentifier(),
        });
    }
    set contacts(value: ContactArray) {
        this._setListRelation('contacts', value, {
            companyId: this.getIdentifier(),
        });
    }
    get projects(): ProjectArray {
        return this._getListRelation('projects', {
            companyId: this.getIdentifier(),
        });
    }
    set projects(value: ProjectArray) {
        this._setListRelation('projects', value, {
            companyId: this.getIdentifier(),
        });
    }
    get industry(): Industry {
        return this._getObjectRelation('industry', { id: this.industryId });
    }
    set industry(value: Industry) {
        this._setObjectRelation('industry', value, 'industryId', 'id');
    }
    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Company> {
        return super.createWithChildren<Company>(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<CompanyArray> {
        return super._createAll<CompanyArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Company> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options: ApexDataOptions,
        context?: any
    ): Promise<Company> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<CompanyArray> {
        return super._find<CompanyArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<Company> {
        return super._findOne(options, context);
    }

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            contacts: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: ContactArray,
            },

            projects: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: ProjectArray,
            },
            industry: {
                fromType: 'has many',
                type: 'belongs to',
                classReference: Industry,
            },
        });
    }

    async export(options?: any): Promise<any> {
        return Company._staticRepository.export(
            this,

            options
        );
    }

    static referenceKey(data: any, options?: any): any {
        return Company._staticRepository.referenceKey(data, options);
    }

    async exportData(parentIdName: string, options?: any): Promise<any> {
        return Company._staticRepository.exportData(
            this,

            parentIdName,
            options
        );
    }

    static async import(exportData: any, options?: any): Promise<Company> {
        return Company._staticRepository.import(exportData, options);
    }

    static async importData(dataFromExport: any, options?: any): Promise<any> {
        return Company._staticRepository.importData(dataFromExport, options);
    }

    static async importAll(
        pathToExportFiles: string,
        options?: any
    ): Promise<void> {
        return Company._staticRepository.importAll(pathToExportFiles, options);
    }

    static async exportMany(where?: any, options?: any): Promise<void> {
        return Company._staticRepository.exportMany(where, options);
    }

    static referenceKeyWithNulls(data: any, options?: any): any {
        return Company._staticRepository.referenceKeyWithNulls(data, options);
    }
}
Object.defineProperty(Company.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Company.prototype, 'name', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Company.prototype, 'description', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Company.prototype, 'website', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Company.prototype, 'image', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Company.prototype, 'industry', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Company.prototype, 'contacts', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Company.prototype, 'projects', {
    enumerable: true,
    configurable: true,
});
