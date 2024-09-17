// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
    DefaultCrudRepository,
    repository,
    Options,
    HasOneRepositoryFactory,
    HasManyRepositoryFactory,
    BelongsToAccessor,
    Entity,
    CrudRepository,
    juggler,
} from '@loopback/repository';

import { BaseCrudRepository } from '../repositories/base-crud.repository';
import { inject, Getter, MixinTarget } from '@loopback/core';

const fs = require('fs-extra');

const uuid = require('uuid');

const changeCase = require('change-case');

const AdmZip = require('adm-zip');

import { paramCase } from 'change-case';

const Debug = require('debug')('Loopback4BaseLibrary:ExportImport');
Debug.log = console.log.bind(console);
Debug('mixin repository loaded');

export function ExportImportRepositoryMixin<
    M extends Entity,
    R extends MixinTarget<BaseCrudRepository<M, any, REL>>,
    REL extends object
>(superClass: R, Model: any, mixinOptions: any): typeof superClass {
    class MixedRepository extends superClass {
        constructor(...args: any[]) {
            super(...args);
            const app = this.app;
        }
        definePersistedModel(entityClass: any): typeof juggler.PersistedModel {
            const modelClass = super['definePersistedModel']
                ? super['definePersistedModel'](entityClass)
                : super.definePersistedModelWrapper(entityClass);
            // operation hooks (ex: before save)

            return modelClass;
        }

        async export(
            model: any,

            options?: Options
        ): Promise<any> {
            let debug = Debug.extend('export');
            // Get the model name
            const modelName = Model.definition.name.slice(0, -5);
            debug = debug.extend(modelName);

            debug('model %j', model);

            let exportData: any = {
                type: modelName,
                exportVersion: mixinOptions.exportVersion || 1,
                [modelName]: await model.exportData(null, options),
            };
            debug('exportData %j', exportData);
            return exportData;
        }

        referenceKey(
            data: any,

            options?: Options
        ): any {
            let debug = Debug.extend('referenceKey');
            // Get the model name
            const modelName = Model.definition.name.slice(0, -5);
            debug = debug.extend(modelName);

            debug('data %j', data);

            let referenceKey = {};
            debug('mixinOptions.keyProperties %j', mixinOptions.keyProperties);
            for (let name of mixinOptions.keyProperties || []) {
                referenceKey[name] = data[name];
            }
            debug('referenceKey %j', referenceKey);

            return referenceKey;
        }

        async exportData(
            model: any,

            parentIdName: string,

            options?: Options
        ): Promise<any> {
            let debug = Debug.extend('exportData');
            // Get the model name
            const modelName = Model.definition.name.slice(0, -5);
            debug = debug.extend(modelName);

            debug('model %j', model);
            debug('mixinOptions %j', mixinOptions);
            debug('Model.definition %j', Model.definition);

            let relationsByForeignKey = {};
            for (let name in Model.definition.settings.keyRelations) {
                let relation = Model.definition.settings.keyRelations[name];
                debug('relation %j', relation);
                if (relation.type == 'belongsTo') {
                    relationsByForeignKey[relation.foreignKey] = relation;
                }
            }
            debug('relationsByForeignKey %j', relationsByForeignKey);

            let data = {};

            // Add the property values
            for (let name in Model.definition.properties) {
                debug('name %j', name);
                if (!relationsByForeignKey[name]) {
                    let property = Model.definition.properties[name];
                    debug('property %j', property);

                    if (
                        !property.id ||
                        mixinOptions.keyProperties.includes(name)
                    ) {
                        data[name] = model[name];
                    }
                }
            }
            debug('data with properties %j', data);

            // Add the include relationships
            for (let name of mixinOptions.includeRelationships || []) {
                debug('name %j', name);

                let relation = Model.definition.settings.keyRelations[name];
                debug('relation %j', relation);

                if (relation.type == 'hasMany') {
                    await model[name].read(options);
                    data[name] = [];
                    for (let child of model[name]) {
                        debug('child %j', child);
                        if (!child.exportData)
                            throw `${Model.definition.name} relation ${name} does not have the export mixin configured.`;
                        data[name].push(
                            await child.exportData(relation.foreignKey, options)
                        );
                    }
                } else if (relation.type == 'hasOne') {
                    let where = {
                        [relation.foreignKey]: model.id,
                    };
                    debug('where %j', where);

                    let classReference = model[name]._classReference;

                    let child = await classReference.findOne(
                        { where: where },
                        options
                    );
                    debug('child %j', child);
                    if (child.id) {
                        let childExport = await child.exportData(
                            relation.foreignKey,
                            options
                        );
                        debug('childExport %j', childExport);

                        data[name] = childExport;
                    }
                } else {
                    throw `Relation "${name}" of type "${relation.type}" on "${Model.definition.name}" is not supported`;
                }
            }
            debug('data with includes %j', data);

            debug(
                'mixinOptions.referenceRelationships %j',
                mixinOptions.referenceRelationships
            );
            for (let name of mixinOptions.referenceRelationships || []) {
                debug('name %j', name);

                let relation = Model.definition.settings.keyRelations[name];
                debug('relation %j', relation);

                if (relation.foreignKey != parentIdName) {
                    const foreignKeyValue = model[relation.foreignKey];
                    debug('foreignKeyValue %j', foreignKeyValue);
                    if (foreignKeyValue) {
                        model[name].setOption('read', 'On Demand');
                        await model[name].read(options);
                        data[name] = await model[
                            name
                        ]._classReference.referenceKey(model[name]);
                        delete data[relation.foreignKey];
                    }
                }
            }
            debug('data with references %j', data);

            return data;
        }

        async import(
            exportData: any,

            options?: Options
        ): Promise<typeof Model> {
            let debug = Debug.extend('import');
            // Get the model name
            const modelName = Model.definition.name.slice(0, -5);
            debug = debug.extend(modelName);

            debug('exportData %j', exportData);

            if (exportData.type !== modelName)
                throw {
                    statusCode: 422,
                    message: `"${exportData.type}" is not a valid type for import as a "${modelName}"`,
                };

            let model = await Model.importData(exportData[modelName], options);
            debug('model %j', model);

            return model;
        }

        async importData(
            dataFromExport: any,

            options?: Options
        ): Promise<any> {
            let debug = Debug.extend('importData');
            // Get the model name
            const modelName = Model.definition.name.slice(0, -5);
            debug = debug.extend(modelName);

            debug('dataFromExport %j', dataFromExport);

            // Add the property values
            let data = {};
            for (let name in Model.definition.properties) {
                debug('name %j', name);
                let value = dataFromExport[name];

                if (value !== undefined) {
                    data[name] = value;
                }
            }
            debug('data with properties %j', data);

            // Add the foreign key values
            for (let name of mixinOptions.referenceRelationships || []) {
                debug('reference name %j', name);

                let relation = Model.definition.settings.keyRelations[name];
                debug('relation %j', relation);

                // The parent reference should already be filled in
                if (!data[relation.foreignKey]) {
                    let key = dataFromExport[name];
                    debug('key %j', key);

                    if (key) {
                        let parent = await this.app['models'][
                            relation.model
                        ].findOne({ where: key }, options);
                        debug('parent %j', parent);

                        if (parent.id) {
                            data[relation.foreignKey] = parent.id;
                        }
                    }
                }
            }
            debug('data with references %j', data);

            // Find the model if it exists
            let where = Model.referenceKey(data);
            debug('where %j', where);

            let model = await Model.findOne({ where: where }, options);
            debug('model %j', model);

            // Update or create the model
            if (model) {
                for (let name in data) {
                    model[name] = data[name];
                }
                await model.save();
                debug('saved');
            } else {
                // Update type "any" properties
                for (let name in Model.definition.properties) {
                    const property = Model.definition.properties[name];
                    let value = dataFromExport[name];

                    if (
                        property.type == 'any' &&
                        value &&
                        typeof value == 'object'
                    ) {
                        value = JSON.stringify(value);
                    }
                    if (value !== undefined) {
                        data[name] = value;
                    }
                }
                model = await Model.create(data, options);
                debug('created');
            }

            // Process the includes
            for (let name of mixinOptions.includeRelationships || []) {
                debug('include name %j', name);

                let relation = Model.definition.settings.keyRelations[name];
                debug('relation %j', relation);

                let ChildModel = model[name]._classReference;

                let filter = { where: { [relation.foreignKey]: model.id } };
                debug('filter %j', filter);

                if (relation.type == 'hasMany') {
                    let toBeItemsByKey = {};
                    for (let toBeItem of dataFromExport[name] || []) {
                        debug('toBeItem %j', toBeItem);
                        toBeItem[relation.foreignKey] = model.id;

                        // You need to import the model before getting the key because import can resolve references
                        const importedModel = await ChildModel.importData(
                            toBeItem,
                            options
                        );
                        debug('importedModel %j', importedModel);

                        // Now that it is created or updated, you can get the reference key
                        let key = JSON.stringify(
                            ChildModel.referenceKeyWithNulls(importedModel)
                        );
                        debug('key %j', key);

                        toBeItemsByKey[key] = importedModel;
                    }
                    debug('toBeItemsByKey %j', toBeItemsByKey);

                    let existingItems = await ChildModel.find(filter, options);
                    debug('existingItems %j', existingItems);

                    for (let existingItem of existingItems) {
                        let key = JSON.stringify(
                            ChildModel.referenceKey(existingItem)
                        );
                        debug('key %j', key);
                        if (!toBeItemsByKey[key]) {
                            debug('deleting existing item');
                            await existingItem.delete();
                            debug('deleted');
                        } else {
                            debug('keeping existing item');
                            model[name].push(existingItem);
                        }
                    }
                } else {
                    if (dataFromExport[name]) {
                        model[name] = await ChildModel.importData(
                            dataFromExport[name],
                            options
                        );
                    } else {
                        let where = {
                            [relation.foreignKey]: model.id,
                        };
                        debug('where %j', where);

                        let child = await ChildModel.findOne(
                            { where: where },
                            options
                        );

                        if (child.id) {
                            debug('deleting child', child);
                            await child.delete();
                            debug('deleted');
                        }
                    }
                }
            }

            return model;
        }

        async importAll(
            pathToExportFiles: string,

            options?: Options
        ): Promise<void> {
            let debug = Debug.extend('importAll');
            // Get the model name
            const modelName = Model.definition.name.slice(0, -5);
            debug = debug.extend(modelName);

            debug('pathToExportFiles %j', pathToExportFiles);
            let files = await fs.readdir(pathToExportFiles);
            debug('files', files);

            files = files.filter((file: string) =>
                file.endsWith(`.${paramCase(modelName)}.json`)
            );
            debug('files %j', files);

            for (let file of files) {
                let jsonString = await fs.readFile(
                    pathToExportFiles + '/' + file,
                    'utf8'
                );
                debug('jsonString %j', jsonString);
                if (jsonString.startsWith('{')) {
                    let exportData = JSON.parse(jsonString);
                    debug('exportData %j', exportData);
                    try {
                        console.log(`Importing file "${file}"`);
                        let item = await Model.import(exportData, options);
                        debug('item %j', item);
                    } catch (err) {
                        console.error(
                            `Problem importing file "${file}": ${err}`
                        );
                    }
                } else {
                    console.log('Ignoring empty content file', file);
                }
            }
        }

        async exportMany(
            where?: any,

            options?: Options
        ): Promise<void> {
            let debug = Debug.extend('exportMany');
            const modelName = Model.definition.name.slice(0, -5);
            debug = debug.extend(modelName);

            let filter: any = {};
            if (where) filter.where = where;
            debug('filter %j', filter);

            let models = await Model.find(filter, options);

            debug('models.length %j', models.length);
            if (models.length == 0) {
                throw {
                    statusCode: 422,
                    message: 'No items to export',
                };
            }

            // Create an empty zip file in memory
            const zip = new AdmZip();
            debug('zip created');

            for (let model of models) {
                debug('model %j', model);
                debug('model.export', model.export);
                //model = await Model.findById(model.id, {}, options);
                debug('model.export', model.export);
                const exportData = await model.export(options);
                debug('exportData %j', exportData);

                let referenceKey = Model.referenceKey(model);
                debug('referenceKey %j', referenceKey);

                let parts = [];
                for (let name in referenceKey) {
                    parts.push(
                        changeCase.paramCase(String(referenceKey[name]))
                    );
                }

                const fileName =
                    parts.join('-') +
                    '.' +
                    changeCase.paramCase(modelName) +
                    '.json';
                debug('fileName %j', fileName);

                // Add the JSON to the zip file
                zip.addFile(
                    fileName,
                    Buffer.from(JSON.stringify(exportData, null, '  '), 'utf8')
                );
                debug('added');
            }

            let contents = zip.getEntries();
            debug('contents %j', contents);

            options.response.writeHead(200, {
                'Content-Type': 'application/zip',
                'Content-Disposition':
                    'attachment; filename=' +
                    changeCase.paramCase(modelName) +
                    '.zip',
            });

            options.response.end(zip.toBuffer());
            debug('response ended');
        }

        referenceKeyWithNulls(
            data: any,

            options?: Options
        ): any {
            let debug = Debug.extend('referenceKeyWithNulls');
            // Get the model name
            const modelName = Model.definition.name.slice(0, -5);
            debug = debug.extend(modelName);

            debug('data %j', data);

            let referenceKey = {};
            debug('mixinOptions.keyProperties %j', mixinOptions.keyProperties);
            for (let name of mixinOptions.keyProperties || []) {
                if (data[name] === undefined) {
                    referenceKey[name] = null;
                } else {
                    referenceKey[name] = data[name];
                }
            }
            debug('referenceKey %j', referenceKey);

            return referenceKey;
        }
    }
    return MixedRepository;
}
