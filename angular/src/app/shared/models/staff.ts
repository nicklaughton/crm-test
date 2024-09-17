import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';
import { StaffArray } from './staff-array';

import { Project } from './project';
import { ProjectArray } from './project-array';

type StaffRole = 'Manager' | 'Developer' | 'Architect';

export class Staff extends ApexDataObject<Staff> {
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

        super(object, options, Staff, Staff._staticRepository);

        if (options?.isInitializeRelationships)
            this._initializeRelationships(object, ['projects']);
    }
    public static metadata = {
        name: `Staff`,
        pluralName: `Staff`,
        displayName: `Staff`,
        pluralDisplayName: `Staff`,
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
                name: `role`,
                displayName: `Role`,
                isRequired: false,
                isHidden: false,
                isId: false,
                type: {
                    name: 'StaffRole',
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
            projects: {
                name: 'projects',
                type: 'has many',
                foreignKey: 'projectManagerId',
                childParentName: 'projectManager',
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

    get role(): StaffRole {
        return this._get('role');
    }

    set role(value: StaffRole) {
        this._updateAttribute('role', value);
    }
    get projects(): ProjectArray {
        return this._getListRelation('projects', {
            projectManagerId: this.getIdentifier(),
        });
    }
    set projects(value: ProjectArray) {
        this._setListRelation('projects', value, {
            projectManagerId: this.getIdentifier(),
        });
    }
    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            projects: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: ProjectArray,
            },
        });
    }

    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Staff> {
        return super._create(data, options, context);
    }

    static async createAll(
        data: Object[],
        options?: ApexDataOptions,
        context?: any
    ): Promise<StaffArray> {
        return super._createAll<StaffArray>(data, options, context);
    }

    static async save(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Staff> {
        return super._save(data, options, context);
    }

    static async findById(
        id: number,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Staff> {
        return super._findById(id, options, context);
    }

    static async find(
        options: ApexDataOptions,
        context?: any
    ): Promise<StaffArray> {
        return super._find<StaffArray>(options, context);
    }

    static async findOne(
        options: ApexDataOptions,
        context?: any
    ): Promise<Staff> {
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

    static async import(exportData: any): Promise<Staff> {
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
Object.defineProperty(Staff.prototype, 'id', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Staff.prototype, 'name', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Staff.prototype, 'role', {
    enumerable: true,
    configurable: true,
});

Object.defineProperty(Staff.prototype, 'projects', {
    enumerable: true,
    configurable: true,
});
