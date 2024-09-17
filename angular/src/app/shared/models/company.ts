import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';
import { CompanyArray } from './company-array';

import { Industry } from './industry';
import { IndustryArray } from './industry-array';
import { Contact } from './contact';
import { ContactArray } from './contact-array';
import { Project } from './project';
import { ProjectArray } from './project-array';

export class Company extends ApexDataObject<Company> {
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

        super(object, options, Company, Company._staticRepository);

        if (options?.isInitializeRelationships)
            this._initializeRelationships(object, ['contacts', 'projects']);
    }
    public static metadata = {
        name: `Company`,
        pluralName: `Companies`,
        displayName: `Company`,
        pluralDisplayName: `Companies`,
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
                name: `description`,
                displayName: `Description`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'string',
                },
            },
            {
                name: `website`,
                displayName: `Website`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'string',
                },
            },
            {
                name: `image`,
                displayName: `Image`,
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
                foreignKey: 'companyId',
                childParentName: 'company',
                businessObject: {
                    name: 'Contact',
                },
            },

            projects: {
                name: 'projects',
                type: 'has many',
                foreignKey: 'companyId',
                childParentName: 'company',
                businessObject: {
                    name: 'Project',
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

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Company> {
        return super._create(data, options, context);
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
        options?: ApexDataOptions,
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

    static async import(exportData: any): Promise<Company> {
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
