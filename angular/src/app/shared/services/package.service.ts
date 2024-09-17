import { Injectable } from '@angular/core';

const myPackage = require('../../../../package.json');

@Injectable()
export class PackageService {
    constructor() {}

    get projectName(): string {
        return 'Nick Crm 2024 2';
    }

    get applicationTitle(): string {
        return 'Nick Crm 2024 2';
    }

    get name(): string {
        return myPackage.name;
    }

    get version(): string {
        return myPackage.version;
    }

    get description(): string {
        return myPackage.description;
    }
}
