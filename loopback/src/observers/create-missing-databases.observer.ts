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
const debug = require('debug')('Loopback4BaseLibrary:updateSchema');
debug.log = console.log.bind(console);

@lifeCycleObserver('0-database-create')
export class CreateMissingDatabaseObserver implements LifeCycleObserver {
	constructor(@inject(CoreBindings.APPLICATION_INSTANCE) private app: ADApplication) {}

	/**
	 * This method will be invoked when the application starts
	 */
	async start(): Promise<void> {
		// Add your logic for start

		const debug = require('debug')('ApexDesigner:CreateMissingDatabaseObserver');
		debug.log = console.log.bind(console);

		debug('top');

		const postgresql = require('pg');

		const app = this.app;

		const dsBindings: Readonly<Binding<unknown>>[] = app.findByTag('datasource');

		for (const b of dsBindings) {
			const dsName = b.key.replace('datasources.', '').replace(/Repository$/, '');
			//debug('dsName', dsName, b.key);
			const repo: object = app.getSync(b.key);
			//debug('repo');

			if (repo && repo['adapter'] && repo['adapter']['settings']) {
				app.dataSources[repo['adapter']['settings']['name']] = repo;
				app.dataSources[repo['adapter']['settings']['name']]['settings'] = repo['adapter']['settings'];
			}
		}

		//debug('app.dataSources2', app.dataSources);
		for (let dataSourceName in app.dataSources) {
			let datasource = app.dataSources[dataSourceName];
			let missingDatabaseName;

			// If this is a postgresql datasource
			if (datasource.settings.connector === 'postgresql') {
				debug('postgresql datasource');
				try {
					const client = await datasource.connector.pg.connect();
					console.log(
						'createMissingDatasourceDB.js Database for datasource',
						datasource.name,
						'already exists'
					);
					client.release(true); // close connection
					return;
				} catch (err) {
					debug('err from trial connection:', err);
					missingDatabaseName = err.toString().split('"')[1];
					debug('missingDatabaseName', missingDatabaseName);
				}
				// Start with the datasource options
				var options: any = {};
				let dsSettingProperties = ['name', 'connector', 'host', 'port', 'database', 'ssl', 'user', 'password'];
				// for (var nam in datasource.settings) {
				dsSettingProperties.forEach((nam) => {
					options[nam] = datasource.settings[nam];
				});

				// Change the database to the management database.
				/* 
						The maintenance database be
							process.env.maintenanceDatabase or
							blank (The default is to connect to a database with the same name as the user name.)
							postgres or 
							compose or 
					*/
				const { Client } = require('pg');
				if (process.env.maintenanceDatabase) {
					options.database = process.env.maintenanceDatabase;
					debug('options with maintenanceDatabase', options);

					let client = new Client(options);
					try {
						await client.connect();
						console.log('createMissingDatasourceDB.js Creating database', missingDatabaseName);
						await client.query('CREATE DATABASE "' + missingDatabaseName + '"');
						console.log('createMissingDatasourceDB.js Created database', missingDatabaseName);
						return;
					} catch (e) {
						debug('Failed to connect to "', options.database, '" database. Error: ' + e);
						debug('Trying next...');
					} finally {
						client.end(); // close connection
					}
				} else {
					// Default / blank (The default is to connect to a database with the same name as the user name.)
					options.database = '';
					debug('options no maintenance db', options);
					let client1 = new Client(options);
					try {
						await client1.connect();
						console.log('createMissingDatasourceDB.js Creating database', missingDatabaseName);
						await client1.query('CREATE DATABASE "' + missingDatabaseName + '"');
						console.log('createMissingDatasourceDB.js Created database', missingDatabaseName);
						return;
					} catch (e) {
						console.log('Failed to connect to "default" database. Error: ' + e);
						console.log('Trying next...');
					} finally {
						client1.end(); // close connection
					}

					// postgres
					options.database = 'postgres';
					debug('options', options);
					let client2 = new Client(options);
					try {
						await client2.connect();
						console.log('createMissingDatasourceDB.js Creating database', missingDatabaseName);
						await client2.query('CREATE DATABASE "' + missingDatabaseName + '"');
						console.log('createMissingDatasourceDB.js Created database', missingDatabaseName);
						return;
					} catch (e) {
						debug('Failed to connect to "', options.database, '" database. Error: ' + e);
						debug('Trying next...');
					} finally {
						client2.end(); // close connection
					}

					// compose
					options.database = 'compose';
					debug('options', options);
					let client3 = new Client(options);
					try {
						await client3.connect();
						console.log('createMissingDatasourceDB.js Creating database', missingDatabaseName);
						await client3.query('CREATE DATABASE "' + missingDatabaseName + '"');
						console.log('createMissingDatasourceDB.js Created database', missingDatabaseName);
						return;
					} catch (e) {
						debug('Failed to connect to ', options.database, ' database. Nothing more to try. Error: ' + e);
					} finally {
						client3.end(); // close connection
					}
				}
				debug(
					`ApexDesignerBaseLibrary:createMissingDatasourceDB.js - FAILED to create the missing "${missingDatabaseName}" database`
				);
				throw new Error(
					`ApexDesignerBaseLibrary:createMissingDatasourceDB.js - FAILED to create the missing "${missingDatabaseName}" database`
				);
			} else if (datasource.settings.connector === 'mssql' && process.env.databaseUrl) {
				const mssql = require('mssql');

				let pieces = process.env.databaseUrl.split('/');
				let requiredDatabase = pieces.pop();
				pieces.push('master');
				let masterConnectionString = pieces.join('/');
				debug('masterConnectionString', masterConnectionString);
				try {
					await mssql.connect(masterConnectionString);
				} catch (e) {
					console.error('Cannot connect to mssql master database. ' + e);
					throw e;
				}
				let result = await mssql
					.request()
					.query(`SELECT name FROM master.dbo.sysdatabases WHERE name = \'${requiredDatabase}\'`);

				if (result.recordset.length) {
					mssql.close();
					return;
				} else {
					let result = await mssql.Request().query(`CREATE DATABASE "${requiredDatabase}"`);
					console.log(`Created database ${requiredDatabase}`);
					mssql.close();
					return;
				}
			} else {
				if (datasource.settings.connector != 'memory')
					console.log('we do not create databases this connector:', datasource.settings.connector);
			}
		}
	}
}
