// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
	/* inject, Application, CoreBindings, */
	lifeCycleObserver,
	LifeCycleObserver,
	inject,
	CoreBindings,
	Binding
} from '@loopback/core';
import { ADApplication } from '../application';

@lifeCycleObserver('database-exists-1')
export class SchemaPatchObserver implements LifeCycleObserver {
	constructor(@inject(CoreBindings.APPLICATION_INSTANCE) private app: ADApplication) {}

	/**
	 * This method will be invoked when the application starts
	 */
	async start(): Promise<void> {
		const debug = require('debug')('ApexDesigner:SchemaPatchObserver');
		debug.log = console.log.bind(console);

		debug('top');

		const postgresql = require('pg');

		const app = this.app;

		//console.log('app.datasources2', app.datasources);
		for (let datasourceName in app.dataSources) {
			let datasource = app.dataSources[datasourceName];

			// If this is a postgresql datasource

			if (datasource.connector.pg) {
				debug('datasource settings %j', datasource.settings);
				debug('datasource %j', datasource);
				var pg = new postgresql.Pool(datasource.settings);

				await new Promise<void>((resolve, reject) => {
					pg.connect(function (err, client, release) {
						if (err) {
							console.error(err);
							return reject(err);
						}

						client.query('select current_schema', function (err, results) {
							release();
							if (err) {
								console.log('01-loopback-connector-postgresql-schema-patch error:', err);
								return reject(err);
							}
							debug('results', results);
							debug('results.rows[0].current_schema', results.rows[0].current_schema);
							let currentSchema = results.rows[0].current_schema;
							if (currentSchema && currentSchema != 'public') {
								datasource.connector.getDefaultSchemaName = function () {
									return currentSchema;
								};
								console.log(
									`Patched datasource: "${datasource.settings.name}" with default schema "${currentSchema}"`
								);
							}
							resolve();
						});
					});
				});
				break;
			}
		}
	}
}
