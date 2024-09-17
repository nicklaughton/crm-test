import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';
import { ProjectArray } from './project-array';

import { Staff } from './staff';
import { StaffArray } from './staff-array';
import { Company } from './company';
import { CompanyArray } from './company-array';

type Currency = number;

export class Project extends ApexDataObject<Project> {
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

        super(object, options, Project, Project._staticRepository);
    }
    public static metadata = {
        name: `Project`,
        pluralName: `Projects`,
        displayName: `Project`,
        pluralDisplayName: `Projects`,
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
                name: `startDate`,
                displayName: `Start Date`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'Date',
                },
            },
            {
                name: `endDate`,
                displayName: `End Date`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'Date',
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
                name: `total`,
                displayName: `Total`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'Currency',
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
            projectManager: {
                name: 'projectManager',
                type: 'belongs to',
                foreignKey: 'projectManagerId',
                parentChildName: 'projects',
                businessObject: {
                    name: 'Staff',
                },
            },

            company: {
                name: 'company',
                type: 'belongs to',
                foreignKey: 'companyId',
                parentChildName: 'projects',
                businessObject: {
                    name: 'Company',
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

    get startDate(): Date {
        return this._get('startDate');
    }

    set startDate(value: Date) {
        this._updateAttribute('startDate', value);
    }

    get endDate(): Date {
        return this._get('endDate');
    }

    set endDate(value: Date) {
        this._updateAttribute('endDate', value);
    }

    get description(): string {
        return this._get('description');
    }

    set description(value: string) {
        this._updateAttribute('description', value);
    }

    get total(): Currency {
        return this._get('total');
    }

    set total(value: Currency) {
        this._updateAttribute('total', value);
    }

    get projectManagerId(): number {
        return this._get('projectManagerId');
    }
    set projectManagerId(value: number) {
        this._updateAttribute('projectManagerId', value);
    }

    get companyId(): number {
        return this._get('companyId');
    }
    set companyId(value: number) {
        this._updateAttribute('companyId', value);
    }
    get projectManager(): Staff {
        return this._getObjectRelation('projectManager', {
            id: this.projectManagerId,
        });
    }
    set projectManager(value: Staff) {
        this._setObjectRelation(
            'projectManager',
            value,
            'projectManagerId',
            'id'
        );
    }
    get company(): Company {
        return this._getObjectRelation('company', { id: this.companyId });
    }
    set company(value: Company) {
        this._setObjectRelation('company', value, 'companyId', 'id');
    }
    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            projectManager: {
                fromType: 'has many',
                type: 'belongs to',
                classReference: Staff,
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
    ): Promise<Project> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<ProjectArray> {
        return super._createAll<ProjectArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Project> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Project> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<ProjectArray> {
        return super._find<ProjectArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<Project> {
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

    static async import(exportData: any): Promise<Project> {
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
Object.defineProperty(Project.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Project.prototype, 'name', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Project.prototype, 'startDate', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Project.prototype, 'endDate', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Project.prototype, 'description', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Project.prototype, 'total', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Project.prototype, 'projectManager', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Project.prototype, 'company', {
    enumerable: true,
    configurable: true,
});
