// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
	/* inject, Application, CoreBindings, */
	lifeCycleObserver, // The decorator
	LifeCycleObserver,
	inject,
	CoreBindings,
	Binding // The interface
} from '@loopback/core';
import { ADApplication } from '../application';
//import {TodoRepository} from '../repositories';
const debug = require('debug')('Loopback4BaseLibrary:updateSchema');
debug.log = console.log.bind(console);

function buildIndexSQL(schemaName, tableName, name, index) {
	let create;
	//if (index.options && (index.options.unique || index.options.deferredUnique)) {
	if (index.options && index.options.unique) {
		create = 'create unique';
	} else {
		create = 'create';
	}
	let keys = Object.keys(index.keys).join(', ');
	if (/[A-Z]/.test(name)) {
		name = '"' + name + '"';
	}
	let sql = `${create} index ${name} on ${schemaName}.${tableName} using btree (${keys})`;
	debug('sql:', sql);
	return sql;
}

function constraintName(indexName) {
	let name = indexName.toLowerCase() + '_constraint';
	if (name.length > 63) {
		name = name.substr(0, 63);
	}
	return name;
}

function getModelIdProperty(model) {
	if (model && model.definition && model.definition.properties) {
		for (let propertyName in model.definition.properties) {
			if (model.definition.properties[propertyName].id) return propertyName;
		}
	}
	return 'id';
}

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('database-exists-2')
export class MyBootScriptObserver implements LifeCycleObserver {
	constructor(
		// inject `app` if you need access to other artifacts by `await this.app.get()`
		@inject(CoreBindings.APPLICATION_INSTANCE) private app: ADApplication //, // inject a repository with key `repositories.${repoName}` // or with the shortcut injector: // `@repository(TodoRepository) private todoRepo: TodoRepository` // @inject('repositories.TodoRepository') private todoRepo: TodoRepository,
	) {}

	/**
	 * This method will be invoked when the application starts
	 */
	async start(): Promise<void> {
		const app = this.app;
		const async = require('async');

		let dataSource;

		const dsBindings: Readonly<Binding<unknown>>[] = app.findByTag('datasource');

		for (const b of dsBindings) {
			const dsName = b.key.replace('datasources.', '').replace(/Repository$/, '');

			const repo: object = app.getSync(b.key);

			if (!app.dataSources[dsName]) app.dataSources[dsName] = repo;

			if (repo && repo['adapter'] && repo['adapter']['settings']) {
				app.dataSources[repo['adapter']['settings']['name']] = repo;
				app.dataSources[repo['adapter']['settings']['name']]['settings'] = repo['adapter']['settings'];
			}
		}

		for (let dataSourceName in app.dataSources) {
			let dataSource2 = app.dataSources[dataSourceName];

			if (dataSource2.settings.connector === 'postgresql' && (!dataSource || dataSource2.settings.isPrimary)) {
				dataSource = dataSource2;
			}
		}

		if (!dataSource) {
			console.log('UpdateSchema: No datasource configured');
			app.emit('Schema Up To Date');
			return;
		}

		debug('before connect');
		try {
			await dataSource.connect();
			debug('connected');
		} catch (err) {
			console.error('Error connectoring to data source', err);
		} finally {
		}

		const connector = dataSource.connector;

		debug('after connect');
		debug('connector.name', connector.name);

		const repoBindings: Readonly<Binding<unknown>>[] = app.findByTag('repository');

		for (const b of repoBindings) {
			if (!b.key.includes('BaseCrudRepository')) {
				const modelName = b.key.replace('repositories.', '').replace(/Repository$/, '');
				const repo: object = app.getSync(b.key);
				debug('modelName', modelName);
				app.models[modelName + 'Model'] = repo['modelClass'];
				//app.models[modelName] = repo['modelClass'];
			}
		}

		const excludedModels = ['User', 'AccessToken']; // allow creating unique index, 'RoleMapping', 'Role'];
		let lcExcludedModels = excludedModels.reduce((acc, value) => {
			acc[value.toLowerCase()] = true;
			return acc;
		}, {});
		let tableList = [];
		debug('connector.dataSource.name', connector.dataSource.name);
		for (let modelName in connector.dataSource.models) {
			debug('modelName %j', modelName);
			let tableName = connector.table(modelName);
			debug('tableName %j', tableName);
			if (!lcExcludedModels[tableName]) {
				tableList.push(tableName);
				//modelList.push(modelName);
			}
		}
		debug('tableList %j', tableList);
		let tableListStr = tableList
			.reduce((acc, value) => {
				acc.push("'" + value + "'");
				return acc;
			}, [])
			.join(', ');
		debug('tableListStr %j', tableListStr);

		const dropViewStatements = [];
		for (let modelName in connector.dataSource.models) {
			debug('modelName %j', modelName);

			let model = app.models[modelName];

			if (model.settings && model.settings.viewSQL) {
				let viewName = connector.table(modelName);
				debug('viewName %j', viewName);
				dropViewStatements.push('drop view if exists ' + viewName);
			}
		}
		debug('dropViewStatements %j', dropViewStatements);
		if (dropViewStatements.length > 0) {
			const dropResults = await new Promise((resolve, reject) => {
				connector.execute(dropViewStatements.join(';\n'), [], (err, results) => {
					if (err) {
						console.error('Error selecting existing indexes', err);
						reject(err);
					} else {
						debug('results', results);
						resolve(results);
					}
				});
			});
			debug('dropResults %j', dropResults);
		}

		let existingIndexes: object;

		if (tableListStr) {
			let existingIndexesSQL = `select tablename, indexname, indexdef 
								from pg_indexes 
								where indexname !~ '^[a-z0-9_]*_(cons?t?r?a?i?n?t?|pkey?)$' 
								and schemaname = current_schema() and tablename in (${tableListStr})`;
			debug('existingIndexes sql:', existingIndexesSQL);

			existingIndexes = await new Promise((resolve, reject) => {
				//dataSource.connector.executeSQL(sql, [],{}, (err, results) => {
				connector.execute(existingIndexesSQL, [], (err, results) => {
					if (err) {
						console.error('Error selecting existing indexes', err);
						reject(err);
					} else {
						debug('results', results);
						let existingIndexes = {};
						for (let result of results) {
							existingIndexes[result.indexname.toLowerCase()] = {
								name: result.indexname,
								tableName: result.tablename,
								def: result.indexdef
							};
						}
						debug('existingIndexes', existingIndexes);
						resolve(existingIndexes);
					}
				});
			});
		} else {
			existingIndexes = {};
		}

		let desiredIndexes = {};
		for (let modelName in connector.dataSource.models) {
			if (lcExcludedModels[modelName]) {
				continue;
			}
			let model = connector.dataSource.models[modelName];
			if (model.settings.indexes) {
				for (let indexName in model.settings.indexes) {
					let index = model.settings.indexes[indexName];
					//if (!index.options || !index.options.deferredUnique) {
					desiredIndexes[indexName.toLowerCase()] = {
						modelName: modelName,
						name: indexName,
						index: index
					};
					//}
				}
			}
		}
		debug('desiredIndexes', desiredIndexes);

		let existingConstraintSQL = `
select 
t.relname as table,
conname as constraint,
pg_get_constraintdef(c.oid) as definition 
from pg_constraint c
join pg_class t on t.oid = c.conrelid
where contype in ('u','f') and t.relname NOT LIKE 'pg_%'`;
		debug('sql', existingConstraintSQL);

		let existingConstraints: object = await new Promise((resolve, reject) => {
			//dataSource.connector.executeSQL(sql, [],{}, (err, results) => {
			connector.execute(existingConstraintSQL, [], (err, results) => {
				if (err) {
					console.error('Error selecting existing constraints', err);
					reject(err);
				} else {
					debug('results', results);
					let existingConstraints = {};
					for (let result of results) {
						if (result.definition.includes('REFERENCES')) {
							let words = result.definition.split(' ');
							let table = words[4].split('(')[0];
							words[4] = '"' + table.replace(/"/g, '') + '"(' + words[4].split('(')[1];
							result.definition = words.join(' ');
						}
						existingConstraints[result.constraint] = result;
					}
					debug('existingConstraints', existingConstraints);
					resolve(existingConstraints);
				}
			});
		});
		debug('existingConstraints', existingConstraints);

		let desiredConstraints: object = await new Promise((resolve, reject) => {
			let desiredConstraints = {};
			for (let modelName in connector.dataSource.models) {
				//app.models) {
				debug('modelName', modelName);
				//debug('app.models[modelName]', app.models[modelName]);
				//if (app.models[modelName].getDataSource() == dataSource) {
				//excludedModels.indexOf(modelName) == -1 &&

				let model = app.models[modelName];

				if (model.settings && model.settings.viewSQL) continue;

				// connector._models is required for connector.column() to work, so you have to define the model
				connector.define({
					model: model,
					properties: model.definition.properties,
					settings: model.settings
				});

				if (model.settings.indexes) {
					for (let indexName in model.settings.indexes) {
						let index = model.settings.indexes[indexName];
						debug('index', index);
						if (index.options && (index.options.deferredUnique || index.options.unique)) {
							let columns: any[] = [];
							for (let columnName in index.keys) {
								columns.push(connector.column(modelName, columnName));
							}
							let name = indexName.toLowerCase() + '_constraint';
							if (name.length > 63) {
								name = name.substr(0, 63);
							}
							var definition = 'UNIQUE (' + columns.join(', ') + ')';
							if (index.options.deferredUnique) definition += ' DEFERRABLE INITIALLY DEFERRED';
							desiredConstraints[name] = {
								constraint: name,
								table: connector.table(modelName),
								definition: definition
							};
						}
					}
				}

				for (let relationName in model.settings.keyRelations) {
					let relation = model.settings.keyRelations[relationName];

					debug('relation.type', modelName, relation.modelTo, relation.type);

					let relationHasSameDatasource =
						dataSource.models && dataSource.models[relation.modelTo] != undefined;
					debug('relationHasSameDatasource', relationHasSameDatasource);

					if (
						relation.type == 'belongsTo' &&
						!relation.skipForeignKey &&
						relation.foreignKey &&
						relationHasSameDatasource
					) {
						debug('relation.foreignKey', relation.foreignKey);
						debug('relation.foreignKey', relation.foreignKey);

						debug('relation.modelTo', relation.modelTo);

						let name = modelName.toLowerCase() + '_' + relation.foreignKey.toLowerCase() + '_fkey';
						if (name.length > 63) {
							name = name.substr(0, 63);
						}

						let desiredConstraint = {
							constraint: name,
							table: connector.table(modelName),
							definition: `FOREIGN KEY (${connector.column(
								modelName,
								relation.foreignKey
							)}) REFERENCES "${connector.table(relation.modelTo)}"(${connector.column(
								relation.modelTo,
								getModelIdProperty(dataSource.models[relation.modelTo])
							)})`
						};
						if (relation.onDelete) {
							desiredConstraint.definition =
								desiredConstraint.definition + ' ON DELETE ' + relation.onDelete.toUpperCase();
						}

						desiredConstraint.definition = desiredConstraint.definition + ' DEFERRABLE INITIALLY DEFERRED';

						debug('desiredConstraint', desiredConstraint);
						desiredConstraints[desiredConstraint.constraint] = desiredConstraint;
					}
				}
				//}
			}
			debug('desiredConstraints', desiredConstraints);
			resolve(desiredConstraints);
		});

		debug('done calling connected');
		let tablesToUpdate: object = await new Promise((resolve, reject) => {
			let tablesToUpdate = {};

			// this is related to custom columnName camelCase not working properly in postgres connector
			// https://github.com/strongloop/loopback-connector-postgresql/pull/365
			// correct code was merged, but isn't in the current master
			if (dataSource.settings.connector === 'postgresql') {
				connector.getColumnsToAdd = function (model, actualFields) {
					const self = this;
					const m = self._models[model];
					const propNames = Object.keys(m.properties);
					let sql: any[] = [];
					propNames.forEach(function (propName) {
						if (self.id(model, propName)) return;

						const found = self.searchForPropertyInActual(model, propName, actualFields);
						if (!found && self.propertyHasNotBeenDeleted(model, propName)) {
							sql.push('ADD COLUMN ' + self.addPropertyToActual(model, propName));
						}
					});
					if (sql.length > 0) {
						sql = [sql.join(', ')];
					}
					return sql;
				};
				// This is an override of the function in the loopback postgresql connector to account for numeric
				function mapPostgreSQLDatatypes(typeName, typeLength, typeTimePrecision, typePrecision, typeScale) {
					const type = typeName.toUpperCase();
					let strPrecision = '';
					if (typeTimePrecision < 6) {
						// default is 6
						strPrecision = '(' + typeTimePrecision + ') ';
					}
					switch (type) {
						case 'CHARACTER VARYING':
						case 'NUMERIC':
							return 'NUMERIC(' + typePrecision + ',' + typeScale + ')';
						case 'VARCHAR':
							return typeLength ? 'VARCHAR(' + typeLength + ')' : 'VARCHAR(1024)';
						case 'TIMESTAMP WITHOUT TIME ZONE':
							return 'TIMESTAMP ' + strPrecision + 'WITHOUT TIME ZONE';
						case 'TIMESTAMP WITH TIME ZONE':
							return 'TIMESTAMP ' + strPrecision + 'WITH TIME ZONE';
						case 'TIME WITHOUT TIME ZONE':
							return 'TIME ' + strPrecision + 'WITHOUT TIME ZONE';
						case 'TIME WITH TIME ZONE':
							return 'TIME ' + strPrecision + 'WITH TIME ZONE';
						default:
							return typeName;
					}
				}
				connector.showFields = function (model, cb) {
					const sql =
						'SELECT column_name AS "column", data_type AS "type", ' +
						'datetime_precision AS time_precision, ' +
						'is_nullable AS "nullable", character_maximum_length as "length" , numeric_precision, numeric_scale' + // , data_default AS "Default"'
						' FROM "information_schema"."columns" WHERE table_name=\'' +
						this.table(model) +
						"' and table_schema='" +
						this.schema(model) +
						"'";
					connector.execute(sql, function (err, fields) {
						if (err) {
							return cb(err);
						} else {
							fields.forEach(function (field) {
								field.type = mapPostgreSQLDatatypes(
									field.type,
									field.length,
									field.time_precision,
									field.numeric_precision,
									field.numeric_scale
								);
							});
							cb(err, fields);
						}
					});
				};
			}

			async.eachOfSeries(
				connector.dataSource.models,
				(model, modelName, callback) => {
					debug('modelName', modelName);
					//if (model.getDataSource() != dataSource) return process.nextTick(callback);
					connector.isActual(modelName, (err, isActual) => {
						const model = app.models[modelName];
						if (model && model.definition && Object.keys(model.definition.properties).length === 1) {
							debug('single property model', modelName);
							tablesToUpdate[connector.table(modelName)] = true;
							callback();
						} else {
							if (!err && !isActual) {
								tablesToUpdate[connector.table(modelName)] = true;
								connector.getTableStatus(modelName, function (statusErr, fields) {
									if (statusErr) {
										callback(statusErr);
									} else {
										debug('fields', fields);
										debug(
											'connector.getAddModifyColumns(modelName, fields)',
											connector.getAddModifyColumns(modelName, fields)
										);
										debug(
											'connector.getDropColumns(modelName, fields)',
											connector.getDropColumns(modelName, fields)
										);
										callback(err);
									}
								});
							} else {
								callback(err);
							}
						}
					});
				},
				(err) => {
					if (err) {
						console.error('Error finding tablesToUpdate', err);
						reject(err);
					} else {
						debug('tablesToUpdate %j', tablesToUpdate);
						resolve(tablesToUpdate);
					}
				}
			);
		});

		console.log('UpdateSchema: tablesToUpdate ' + JSON.stringify(tablesToUpdate));

		let dropStatements = [];
		let modelsWithModifiedIndexes = {};
		let desiredKeys = Object.keys(desiredIndexes);
		let existingKeys = Object.keys(existingIndexes);
		debug('Building drops for changed indexes');
		for (let name of desiredKeys) {
			let indexData = desiredIndexes[name];
			let schemaName = process.env.APEX_DESIGNER_DATABASE_SCHEMA
				? process.env.APEX_DESIGNER_DATABASE_SCHEMA
				: 'public';
			if (existingKeys.includes(name)) {
				let tableName = connector.table(indexData.modelName);
				let sql = buildIndexSQL(schemaName, tableName, indexData.name, indexData.index);
				const existingIndex = existingIndexes[name].def.toLowerCase().replace(/"/g, '');
				const desiredIndex = sql.toLowerCase().replace(/"/g, '');
				if (existingIndex != desiredIndex) {
					debug('Found index difference');
					debug('existingIndex %j', existingIndex);
					debug('desiredIndex %j', desiredIndex);
					debug('sql.toLowerCase() %j', sql.toLowerCase());
					debug('dropIndexes: index changed:', name);
					debug('existing:', existingIndexes[name].def.toLowerCase());
					debug('desired: ', sql.toLowerCase());

					modelsWithModifiedIndexes[tableName] = true;
					dropStatements.push(
						`alter table "${tableName}" drop constraint if exists "${constraintName(name)}"`
					);
					dropStatements.push(`drop index "${existingIndexes[name].name}"`);
				}
			} else {
				let tableName = connector.table(indexData.modelName);
				debug('Adding table to modelsWithModifiedIndexes for missing index:', tableName);
				modelsWithModifiedIndexes[tableName] = true;
			}
		}
		debug('Building drops for missing indexes');
		for (let name of existingKeys) {
			if (!desiredKeys.includes(name)) {
				debug('dropIndexes: index missing from desiredKeys:', name);
				let tableName = existingIndexes[name].tableName;
				modelsWithModifiedIndexes[tableName] = true;
				tablesToUpdate[tableName] = true;
				let sql = `alter table "${tableName}" drop constraint if exists "${constraintName(name)}"`;
				debug('drop constraint:', sql);
				dropStatements.push(sql);
				sql = `drop index "${existingIndexes[name].name}"`;
				debug('drop index:', sql);
				dropStatements.push(sql);
			}
		}

		await new Promise<void>((resolve, reject) => {
			let dropStatements: string[] = [];
			for (let name in existingConstraints) {
				if (
					!desiredConstraints[name] ||
					desiredConstraints[name].table != existingConstraints[name].table ||
					desiredConstraints[name].definition != existingConstraints[name].definition ||
					tablesToUpdate[existingConstraints[name].table] ||
					modelsWithModifiedIndexes[existingConstraints[name].table]
				) {
					debug('existingConstraints[name]', existingConstraints[name]);
					debug('desiredConstraints[name]', desiredConstraints[name]);
					debug(
						'tablesToUpdate[existingConstraints[name].table]',
						tablesToUpdate[existingConstraints[name].table]
					);
					dropStatements.push(
						'alter table "' + existingConstraints[name].table + '" drop constraint "' + name + '"'
					);
				}
			}
			debug('dropStatements', dropStatements);
			if (dropStatements.length > 0) {
				let sql = dropStatements.join(';\n');
				debug('Update Schema dropping constraints:\n' + sql);
				connector.execute(sql, [], resolve);
			} else {
				debug('Update Schema no constraints to drop');
				resolve();
			}
		});

		if (dropStatements.length > 0) {
			let sql = dropStatements.join(';\n');
			debug('Update Schema dropping indexes:\n' + sql);

			await new Promise<void>((resolve, reject) => {
				connector.execute(sql, [], (err) => {
					resolve(err);
				});
			});
		} else {
			debug('Update Schema no indexes to drop');
		}

		let createStatements: string[] = [];

		// This will help us keep track of constraints we need to remove that throw the following error in autoupdate():
		// cannot drop index ___ because constraint ___ on table ___ requires it
		let constraintsToReAddAfterError = [];

		// update/create the changed tables
		await new Promise<void>((resolve, reject) => {
			let count = 0;
			debug('updateModels: tablesToUpdate:', tablesToUpdate);
			debug('updateModels: modelsWithModifiedIndexes:', modelsWithModifiedIndexes);
			async.eachOfSeries(
				connector.dataSource.models,
				(model, modelName, callback) => {
					let tableName = connector.table(modelName);
					if (
						(tablesToUpdate[tableName] || modelsWithModifiedIndexes[tableName]) &&
						!(
							connector.dataSource.models[modelName].settings &&
							connector.dataSource.models[modelName].settings.viewSQL
						)
					) {
						debug('Update schema model', modelName);
						count++;
						connector.autoupdate(modelName, function (err, result) {
							if (err && err.hint && err.hint.includes('You can drop constraint')) {
								const splitAr = err.hint.split(' ');
								const constraint = splitAr[4];
								const tableName = splitAr[7];
								const sql = 'ALTER TABLE ' + tableName + ' DROP CONSTRAINT ' + constraint;
								if (existingConstraints[constraint]) {
									debug('existing constraint to re-add', existingConstraints[constraint]);
									constraintsToReAddAfterError.push(
										'alter table "' +
											tableName +
											'" add constraint ' +
											constraint +
											' ' +
											existingConstraints[constraint].definition
									);
								}

								debug('error in autoupdate:', err.message);
								debug('error.hint in autoupdate:', err.hint);
								debug('error.hint in autoupdate:', err.hint);
								connector.execute(sql, [], (err2) => {
									if (err2) {
										callback(err, result);
									} else {
										// retry
										connector.autoupdate(modelName, callback);
									}
								});
							} else callback(err, result);
						});
						//connector.dataSource.models[modelName].indexes = indexes;
					} else {
						if (
							connector.dataSource.models[modelName].settings &&
							connector.dataSource.models[modelName].settings.viewSQL
						)
							createStatements.push(connector.dataSource.models[modelName].settings.viewSQL);

						process.nextTick(callback);
					}
				},
				(err) => {
					if (err) {
						console.error('Error updating changed tables', err);
						reject(err);
					} else {
						if (count === 0) {
							debug('Update schema no model updates required');
						}
						resolve();
					}
				}
			);
		});

		// if we removed constraints due to unique index autoupdate() error, add them back
		if (constraintsToReAddAfterError.length > 0) {
			await new Promise<void>((resolve, reject) => {
				debug('adding back unique constraints', constraintsToReAddAfterError.join(';'));
				connector.execute(constraintsToReAddAfterError.join(';'), [], (err, results) => {
					if (err) console.error(err);
					resolve();
				});
			});
		}

		await new Promise<void>((resolve, reject) => {
			for (let name in desiredConstraints) {
				if (
					!existingConstraints[name] ||
					existingConstraints[name].table != desiredConstraints[name].table ||
					existingConstraints[name].definition != desiredConstraints[name].definition ||
					tablesToUpdate[desiredConstraints[name].table] ||
					modelsWithModifiedIndexes[desiredConstraints[name].table]
				) {
					const constraintToAdd =
						'alter table "' +
						desiredConstraints[name].table +
						'" add constraint ' +
						name +
						' ' +
						desiredConstraints[name].definition;

					if (!constraintsToReAddAfterError.includes(constraintToAdd))
						createStatements.push(
							'alter table "' +
								desiredConstraints[name].table +
								'" add constraint ' +
								name +
								' ' +
								desiredConstraints[name].definition
						);
				}
			}
			debug('createStatements', createStatements);
			if (createStatements.length > 0) {
				let sql = createStatements.join(';\n');
				debug('Update Schema adding constraints:\n' + sql);
				connector.execute(sql, [], (err, results) => {
					debug('err %j', err);
					debug('results %j', results);
					if (err) {
						console.error('Error adding constraints', err);
						reject(err);
					} else {
						debug('results', results);
						resolve();
					}
				});
			} else {
				debug('Update Schema no constraints to add');
				resolve();
			}
		});
		debug('Schema Up To Date');
		console.log('Schema Up To Date');
		app.emit('Schema Up To Date');
	}
}
