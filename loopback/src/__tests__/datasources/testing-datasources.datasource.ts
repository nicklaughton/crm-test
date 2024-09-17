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

