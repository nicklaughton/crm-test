import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';

import { types } from 'pg';
const config = {
    name: 'nick-crm-2024-2',
    connector: 'postgresql',
    lazyConnect: true,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    isPrimary: true,
};

if (process.env.databaseUrl && !process.env.PGPORT && !process.env.PGDATABASE) {
    const connectionStringObject = require('pg-connection-string').parse(
        process.env.databaseUrl
    );
    Object.assign(config, connectionStringObject);
}
config['ssl'] =
    process.env.databaseSSL != 'false'
        ? {
              rejectUnauthorized: false,
          }
        : false;

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class NickCrm20242DataSource
    extends juggler.DataSource
    implements LifeCycleObserver
{
    static dataSourceName = 'nick-crm-2024-2';
    static readonly defaultConfig = config;

    constructor(
        @inject('datasources.config.nick-crm-2024-2', { optional: true })
        dsConfig: object = config
    ) {
        // update the postgres parser so numeric returns as a number rather than a string
        // 1700 : Numeric (https://github.com/brianc/node-pg-types/blob/master/index.d.ts#L42)
        types.setTypeParser(1700, parseFloat);

        super(dsConfig);
    }
}
