import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';

let config = {
	name: 'db',
	connector: 'memory'
};


config.name = 'memory';
config.connector = 'memory';

@lifeCycleObserver('datasource')
export class MemoryDataSource extends juggler.DataSource implements LifeCycleObserver {
	static dataSourceName = config.name;
	static readonly defaultConfig = config;

	constructor(
		@inject('datasources.config.memory', { optional: true })
		dsConfig: object = config
	) {
		super(dsConfig);
	}
}


config.name = 'nick-crm-2024-2';
config.connector = 'memory';

@lifeCycleObserver('datasource')
export class NickCrm20242DataSource extends juggler.DataSource implements LifeCycleObserver {
	static dataSourceName = config.name;
	static readonly defaultConfig = config;

	constructor(
		@inject('datasources.config.nick-crm-2024-2', { optional: true })
		dsConfig: object = config
	) {
		super(dsConfig);
	}
}

