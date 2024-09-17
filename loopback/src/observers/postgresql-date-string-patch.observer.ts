// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { lifeCycleObserver, LifeCycleObserver, inject, CoreBindings } from '@loopback/core';
import { ADApplication } from '../application';
const debug = require('debug')('Loopback4BaseLibrary:postgres-date-string-patch');
debug.log = console.log.bind(console);

/**
 * Run after Update Schema
 */
@lifeCycleObserver('database-exists-3')
export class PostgresDateStringPatchObserver implements LifeCycleObserver {
	constructor(@inject(CoreBindings.APPLICATION_INSTANCE) private app: ADApplication) {}

	async start(): Promise<void> {
		const app = this.app;
		for (let datasourceName in app.dataSources) {
			let datasource = app.dataSources[datasourceName];

			if (datasource.connector.pg) {
				datasource.connector.fromColumnValue = function (prop, val) {
					if (val == null) {
						return val;
					}
					const type = prop.type && prop.type.name;
					if (prop && type === 'Boolean') {
						if (typeof val === 'boolean') {
							return val;
						} else {
							return val === 'Y' || val === 'y' || val === 'T' || val === 't' || val === '1';
						}
					} else if ((prop && type === 'GeoPoint') || type === 'Point') {
						if (typeof val === 'string') {
							// The point format is (x,y)
							const point = val.split(/[\(\)\s,]+/).filter(Boolean);
							return {
								lat: +point[0],
								lng: +point[1]
							};
						} else if (typeof val === 'object' && val !== null) {
							// Now pg driver converts point to {x: lng, y: lat}
							return {
								lng: val.x,
								lat: val.y
							};
						} else {
							return val;
						}
					} /* THIS IS THE PATCH */ else if (
						type === 'String' &&
						prop &&
						prop.postgresql &&
						prop.postgresql.dataType === 'date' &&
						val instanceof Date
					) {
						return val.toISOString().split('T')[0];
					} /* END PATCH */ else {
						return val;
					}
				};
			}
		}
	}
}
