import {
    lifeCycleObserver,
    LifeCycleObserver,
    inject,
    CoreBindings,
    Application,
} from '@loopback/core';
import { repository } from '@loopback/repository';
import { ADApplication } from '../application';

import { Industry } from '../objects/industry';
import { IndustryModel } from '../models';
import { IndustryRepository } from '../repositories';

import { Staff } from '../objects/staff';
import { StaffModel } from '../models';
import { StaffRepository } from '../repositories';

let debug = require('debug')('NickCrm20242:importSampleData');
debug.log = console.log.bind(console);
debug('server function loaded');

export class ImportSampleDataObserver implements LifeCycleObserver {
    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE) private app: ADApplication,

        @repository(IndustryRepository)
        private industryRepo: IndustryRepository,

        @repository(StaffRepository) private staffRepo: StaffRepository
    ) {}

    async importSampleData() {
        const options = { preAuthorizedSystemCall: true };

        debug('importing Staff');
        await Staff.importAll('./data', options);

        debug('importing Industries');
        await Industry.importAll('./data', options);
    }

    async init() {
        this.app.on('started', this.importSampleData.bind(this));
    }
}
