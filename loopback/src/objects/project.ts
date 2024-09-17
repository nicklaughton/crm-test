import { ApexDataObject } from './apex-data-object';
import { ApexDataOptions } from './apex-data-options';

import { Staff } from '../objects/staff';
import { StaffArray } from '../objects/staff-array';
import { Company } from '../objects/company';
import { CompanyArray } from '../objects/company-array';

import { Currency } from '../models';

import { ProjectArray } from './project-array';

const metadata = {
    name: 'Project',
    pluralName: 'Projects',
    displayName: 'Project',
    pluralDisplayName: 'Projects',
    infiniteArticle: 'a',
    arrayClass: ProjectArray,
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
            name: 'startDate',
            displayName: 'Start Date',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'Date',
            },
        },
        {
            name: 'endDate',
            displayName: 'End Date',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'Date',
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
            name: 'total',
            displayName: 'Total',
            isRequired: false,
            isHidden: false,
            isId: false,
            type: {
                name: 'Currency',
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

export class Project extends ApexDataObject<Project> {
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

        super(object, options, Project, Project._staticRepository, context);
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
    static async create(
        data: Object,
        options?: ApexDataOptions,
        context?: any
    ): Promise<Project> {
        return super.createWithChildren<Project>(data, options, context);
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
        options: ApexDataOptions,
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

    async export(options?: any): Promise<any> {
        return Project._staticRepository.export(
            this,

            options
        );
    }

    static referenceKey(data: any, options?: any): any {
        return Project._staticRepository.referenceKey(data, options);
    }

    async exportData(parentIdName: string, options?: any): Promise<any> {
        return Project._staticRepository.exportData(
            this,

            parentIdName,
            options
        );
    }

    static async import(exportData: any, options?: any): Promise<Project> {
        return Project._staticRepository.import(exportData, options);
    }

    static async importData(dataFromExport: any, options?: any): Promise<any> {
        return Project._staticRepository.importData(dataFromExport, options);
    }

    static async importAll(
        pathToExportFiles: string,
        options?: any
    ): Promise<void> {
        return Project._staticRepository.importAll(pathToExportFiles, options);
    }

    static async exportMany(where?: any, options?: any): Promise<void> {
        return Project._staticRepository.exportMany(where, options);
    }

    static referenceKeyWithNulls(data: any, options?: any): any {
        return Project._staticRepository.referenceKeyWithNulls(data, options);
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
