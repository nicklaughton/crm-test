// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
    lifeCycleObserver,
    LifeCycleObserver,
    inject,
    CoreBindings,
    Application,
} from '@loopback/core';
import { repository } from '@loopback/repository';
import { ADApplication } from '../application';

let debug = require('debug')('Loopback4BaseLibrary:monitorDatasources');
debug.log = console.log.bind(console);
debug('server function loaded');

export class MonitorDatasourcesObserver implements LifeCycleObserver {
    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE) private app: ADApplication
    ) {}

    async monitorDatasources() {
        debug('getting pool');
        let pool;
        for (let name in this.app.dataSources || []) {
            debug('name %j', name);
            if (this.app.dataSources[name].connector.pg) {
                pool = this.app.dataSources[name].connector.pg;
                debug('pool retreieved', !!pool);
                if (pool) {
                    let lastStatus = '';
                    setInterval(() => {
                        let status = `Datasource: ${name} total: ${
                            pool.totalCount
                        } active: ${pool.totalCount - pool.idleCount} idle: ${
                            pool.idleCount
                        } waiting: ${pool.waitingCount}`;
                        if (status != lastStatus) {
                            debug(status);
                            lastStatus = status;
                        }
                    }, Number(process.env.databasePoolCheckSeconds || '5') * 1000);
                    pool.on('error', (err, client) => {
                        let message =
                            'Datasource ' + name + ' pool error ' + err;
                        debug(message);
                        console.error(message);
                    });
                }
            }
        }
    }

    async init() {
        this.app.on('started', this.monitorDatasources.bind(this));
    }
}
