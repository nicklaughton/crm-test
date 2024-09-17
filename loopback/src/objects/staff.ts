import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';

import { Project } from '../objects/project';
import { ProjectArray } from '../objects/project-array';

import { StaffRole } from '../models';

import { StaffArray } from './staff-array';

const metadata = {
    name: 'Staff',
    pluralName: 'Staff',
    displayName: 'Staff',
    pluralDisplayName: 'Staff',
    infiniteArticle: 'a',
    arrayClass: StaffArray,
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
            name: 'role',
            displayName: 'Role',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'StaffRole',
            },
        },
    ],
    relationships: {
        projects: {
            name: 'projects',
            type: 'has many',
            childParentName: 'projectManager',
            businessObject: {
                name: 'Project',
            },
        },
    },
};

export class Staff extends ApexDataObject<Staff> {
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

        super(object, options, Staff, Staff._staticRepository, context);

        if (options?.isInitializeRelationships)
            this._initializeRelationships(object, ['projects']);
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
    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Staff> {
        return super.createWithChildren<Staff>(data, options, context);
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
        options: ApexDataOptions,
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

    protected _getRelationDictionary(): Object {
        return Object.assign(super._getRelationDictionary(), {
            projects: {
                type: 'has many',
                fromType: 'belongs to',
                classReference: ProjectArray,
            },
        });
    }

    async export(options?: any): Promise<any> {
        return Staff._staticRepository.export(
            this,

            options
        );
    }

    static referenceKey(data: any, options?: any): any {
        return Staff._staticRepository.referenceKey(data, options);
    }

    async exportData(parentIdName: string, options?: any): Promise<any> {
        return Staff._staticRepository.exportData(
            this,

            parentIdName,
            options
        );
    }

    static async import(exportData: any, options?: any): Promise<Staff> {
        return Staff._staticRepository.import(exportData, options);
    }

    static async importData(dataFromExport: any, options?: any): Promise<any> {
        return Staff._staticRepository.importData(dataFromExport, options);
    }

    static async importAll(
        pathToExportFiles: string,
        options?: any
    ): Promise<void> {
        return Staff._staticRepository.importAll(pathToExportFiles, options);
    }

    static async exportMany(where?: any, options?: any): Promise<void> {
        return Staff._staticRepository.exportMany(where, options);
    }

    static referenceKeyWithNulls(data: any, options?: any): any {
        return Staff._staticRepository.referenceKeyWithNulls(data, options);
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
