// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataOptions } from './apex-data-options';
import { ApexFormObject } from './apex-form-object';
import { config } from './apex-data-object.config';

type RelationshipType = 'has many' | 'has one' | 'belongs to' | 'references';

const debug = require('debug')('ApexDataObject');
debug.log = console.log.bind(console);

export class ObjectRelationship {
	propertyName: string;
	foreignKeyPropertyName: string;
	classReference: any;
	type: RelationshipType = 'belongs to';
}

export abstract class ApexDataObject<Q = any> extends ApexFormObject {
	protected _object: any = {};
	protected _options: ApexDataOptions = {};

	public static metadata: any;

	private _context: any;

	protected _pendingChanges: any = {};
	protected _pendingSave: any;

	private _timeoutId: any;

	private _lastSaveTime: number = 0;

	private _saveAttempts: number = 0;

	private _readHandle: any;

	public _repository: any;

	protected _classReference: any; //ApexDataObject<any>;

	protected static _idProperty: string = 'id';

	static _staticRepository: any;

	static _staticClassReference: any;
	static _staticClassListReference: any;

	static setRepository(repo: any) {
		this._staticRepository = repo;
	}

	private _statusChangeMethods: any[] = [];

	public statusChanges = {
		subscribe: (
			callback: (status: 'READING' | 'READ' | 'SAVING' | 'SAVED') => any | void
		): { unsubscribe: () => void } => {
			this._statusChangeMethods.push(callback);
			return {
				unsubscribe: () => {
					const index = this._statusChangeMethods.indexOf(callback);
					if (index >= 0) this._statusChangeMethods.splice(index, 1);
				}
			};
		},
		next: (status: 'READING' | 'READ' | 'SAVING' | 'SAVED') => {
			this._statusChangeMethods.forEach((method) => {
				method(status);
			});
		}
	};

	get _parent(): any {
		return this._options.parentObject;
	}

	static init(repo: any, classReference: any, classListReference: any, metadata?: any) {
		this._staticRepository = repo;
		this._staticClassReference = classReference;
		this._staticClassListReference = classListReference;
		if (metadata) {
			this.metadata = metadata;
			this._staticClassListReference.metadata = metadata;
		}
	}

	// true when either saving or reading is true
	loading: boolean;
	saving: boolean;
	reading: boolean;
	creating: boolean;

	constructor(object?: any, _options?: ApexDataOptions | undefined, classReference?: any, repo?: any, context?: any) {
		super(object, _options, classReference, repo, context);

		if (object && object.http && (object.save !== undefined || object.read !== undefined)) {
			let temp = _options;
			_options = object;
			if (_options) {
				_options.readAutomatically = _options.readAutomatically || _options.read == 'Automatically';
				_options.saveAutomatically = _options.saveAutomatically || _options.save == 'Automatically';
				_options.readOnDemand = _options.readOnDemand || _options.read == 'On Demand';
				_options.saveOnDemand = _options.saveOnDemand || _options.save == 'On Demand';
			}
			object = temp;
		}

		this._context = context;

		if (_options) this._options = _options;
		if (this._options) {
			if (!this._options.saveDelay) {
				this._options.saveDelay = 500;
			}

			this._classReference = this._options.classReference ?? classReference;
			this._repository = this._options.repository ?? repo;
		}

		if (this._options.save == 'Automatically') this._options.saveAutomatically = true;
		if (this._options.read == 'Automatically') this._options.readAutomatically = true;
		if (this._options.save == 'On Demand') this._options.saveOnDemand = true;
		if (this._options.read == 'On Demand') this._options.readOnDemand = true;
		if (this._options.save == 'Never') {
			this._options.saveOnDemand = false;
			this._options.saveAutomatically = false;
		}
		if (this._options.read == 'Never') {
			this._options.readOnDemand = false;
			this._options.readAutomatically = false;
		}

		if (this._options.foreignKeyObject && object) {
			for (let nam in this._options.foreignKeyObject) {
				if (!object[nam] && this._options.foreignKeyObject[nam])
					object[nam] = this._options.foreignKeyObject[nam];
			}
		}

		if (object) {
			this._deserialize(object, this._context);
		}
		this.setOption('ignorePendingChanges', false);
	}

	protected _deserialize(object: any, context?: any, isConstructing?: boolean) {
		// Merge the values into private object
		for (let name in object) {
			// If there is not already a value there
			if (typeof object[name] != 'function' && !name.startsWith('_')) {
				// && this._get(name) == undefined
				// If the value is an object, it is a relation and we should use the setter
				if (typeof object[name] == 'object' && object[name] && !(object[name] instanceof Date)) {
					this[name] = object[name];
					if (this[name]['setOption']) this[name]['setOption']('parentObject', this);
					// Else the value can be set directly on the private object
				} else {
					this._set(name, object[name]);

					if (
						!object[this._classReference._idProperty] &&
						!isConstructing &&
						!(name == this._classReference._idProperty && !object[name]) &&
						!this.getOption('ignorePendingChanges')
					) {
						this._pendingChanges[name] = object[name];
						debug('pending change in _deserialize', name, object[name]);
					}
				}
			}
		}

		if (JSON.stringify(this._pendingChanges) != '{}' && !isConstructing) {
			this._startSaveCountdown();
		}
		this.setOption('ignorePendingChanges', false);
		debug('serialize complete');
	}

	protected _clearSaveTimeouts() {
		debug('_clearSaveTimeouts._timeoutId', this._timeoutId);

		if (this._timeoutId) clearTimeout(this._timeoutId);

		for (let nam in this) {
			if (
				this[nam] &&
				this[nam]['_clearSaveTimeouts'] &&
				(this[nam]['_timeoutId'] || this[nam]['_saveTimeoutId'] || this[nam] instanceof Array)
			) {
				this[nam]['_clearSaveTimeouts']();
			}
		}
	}

	protected _clearPendingChanges(isForced?: boolean) {
		debug('_clearPendingChanges isForced', isForced);

		if (!isForced && (!this._pendingChanges || Object.keys(this._pendingChanges).length === 0)) return;

		for (let nam in this) {
			if (this[nam] && this[nam]['_clearPendingChanges']) {
				this[nam]['_clearPendingChanges']();
			}
		}
		this._pendingChanges = {};
	}

	private static _prepareFilter(options: ApexDataOptions): any {
		if (
			options &&
			(options.where ||
				options.fields ||
				options.include ||
				options.limit ||
				options.offset ||
				options.skip ||
				options.order)
		) {
			let filter: any = {};
			if (options.where) {
				filter.where = options.where;
			}
			if (options.fields) {
				let fields = options.fields;

				// always include id attribute to avoid excess creates
				let idProperty =
					this._staticClassReference && this._staticClassReference._idProperty
						? this._staticClassReference._idProperty
						: 'id';
				if (fields instanceof Array && !fields.includes(idProperty)) fields.push(idProperty);
				else if (
					typeof fields == 'object' &&
					fields[idProperty] === undefined &&
					Object.values(fields).filter((item) => item).length > 0
				)
					fields[idProperty] = true;
				filter.fields = fields;
			}
			if (options.limit) {
				filter.limit = options.limit;
			}
			if (options.offset) {
				filter.offset = options.offset;
			}
			if (options.skip) {
				filter.skip = options.skip;
			}
			if (options.order) {
				filter.order = options.order;
			}
			if (options.include) {
				filter.include = [];
				for (let name in options.include) {
					let include = options.include[name];

					// Move order up a level if it's present
					let orderValue;
					if (include.order) {
						orderValue = include.order;
					}

					filter.include.push({
						relation: name,
						order: orderValue,
						scope: this._prepareFilter(include)
					});
				}
			}
			return filter;
		} else {
			return null;
		}
	}

	private async _doRead(context?: any): Promise<Object> {
		debug(this._options.className + ':read');
		//this._status.next('reading');
		this.reading = true;
		this.loading = true;

		// Prepare the url
		const filter = ApexDataObject._prepareFilter(this._options);
		debug('filter', filter);

		debug('object id', this.getIdentifier());
		let id = this.getIdentifier() ?? this._options.foreignKeyObject?.id;
		debug('id', id);

		if (!id && filter?.where) return await this._repository.findOne(filter, context ?? this._context);
		else if (!id && this._options.foreignKeyObject) {
			return await this._repository.findOne({ where: this._options.foreignKeyObject }, context ?? this._context);
		} else return await this._repository.findById(id, filter, context ?? this._context);
	}

	async read(context?: any): Promise<void> {
		debug(this._options.className + ':read');
		let id = this.getIdentifier();

		if (!this._repository) {
			let message = `${this._options.className} with id ${id} is not configured data access`;
			debug(message);
			console.error(message);
		} else if (
			this._options.read === 'Never' //|| (this._options.readAutomatically === false && this._options.readOnDemand === false)
		) {
			let message = `${this._options.className} with id ${id} is not automatic or on demand read`;
			debug(message);
			console.error(message);
		} else if (!id && !this._options.foreignKeyObject && !this._options.where) {
			let message = `${this._options.className} does not have an id`;
			debug(message);
			console.error(message);
		} else {
			this.statusChanges.next('READING');
			let res = await this._doRead(context ?? this._context); //await this.repository.findById(this.getIdentifier());

			this.setOption('ignorePendingChanges', true);
			this._reset();
			this._deserialize(res);
			this._clearPendingChanges(true);

			this.reading = false;
			this.loading = false;

			//this._status.next('read complete');
			if (this._options.onReadComplete) {
				this._options.onReadComplete();
			}
			this.statusChanges.next('READ');
		}
	}

	protected _reset() {
		this._object = {};
	}

	reset() {
		this._reset();
	}

	protected _updateId(name, value) {
		if (this._get(name) !== value) {
			this._set(name, value);

			if (this._options && (this._options.read === 'Automatically' || this._options.readAutomatically)) {
				this.setOption('ignorePendingChanges', true);
				this.read().then(() => {});
			}

			this._updateForeignKey(value);
		}
	}

	protected _updateForeignKey(value) {
		debug('updateForeignKey', value, !!this._parent);
		if (this._parent) {
			debug('parent', this._parent);
			let relationDictionary = this._getRelationDictionary();
			Object.values(relationDictionary).forEach((relationship) => {
				if (relationship.type === 'has one' && this._parent instanceof relationship.classReference)
					this._parent[relationship.foreignKey] = value;
			});
		}
	}

	protected _deleteAttribute(name: string) {
		delete this._object[name];
	}

	// Date compare does not properly check equality
	protected isNotEqual(a, b) {
		const isEqual = a === b;
		if (isEqual) return false;
		else if (a instanceof Date && b instanceof Date) {
			return a.getTime() !== b.getTime();
		} else return true;
	}

	protected _updateAttribute(name, value, forceSave?: boolean, isAny?: boolean) {
		debug('update Attribute', name, value);
		if (value === undefined) {
			value = null;
		}

		if (
			(this.isNotEqual(this._get(name), value) || forceSave) &&
			(this._get(name) !== undefined || value !== null)
		) {
			if (value === undefined) {
				this._deleteAttribute(name);
			} else {
				this._set(name, value);
			}

			if (
				this._repository &&
				(value === null ||
					typeof value != 'object' ||
					Object.prototype.toString.call(value) === '[object Date]' ||
					isAny) &&
				!this.getOption('ignorePendingChanges')
			) {
				if (value === undefined) {
					this._pendingChanges[name] = null;
				} else if (isAny) {
					this._pendingChanges[name] = JSON.stringify(value);
				} else {
					this._pendingChanges[name] = value;
				}

				debug('pending change in _updateAttribute', name, value);

				if (this._options.saveAutomatically || this._options.save == 'Automatically') {
					this._startSaveCountdown();
				}
			}
		}
	}

	protected _get(name: string) {
		return this._object[name];
	}

	protected getIdAttribute(): string {
		return this._classReference?._idProperty ? this._classReference?._idProperty : 'id';
	}

	protected getIdentifier(): any {
		const id = this._object[this.getIdAttribute()];
		return id;
	}

	protected _set(name: string, value: any) {
		this._object[name] = value;
	}

	protected _getRelation(name: string) {
		return this._get(name);
	}

	protected _setRelation(name: string, value: any) {
		this._set(name, value);
	}

	protected _updateRelation(relationName, objectOrArray: any) {
		this._set(relationName, objectOrArray);
	}

	protected _getRelationDictionary(): Object {
		return {};
	}

	protected _constructRelation(relationName: string, value: any, foreignKeyObject?: any) {
		let relationDictionary = this._getRelationDictionary();

		let newRelation = new relationDictionary[relationName].classReference(
			value,
			this._getRelationOptions(relationName, foreignKeyObject),
			this._context
		);

		newRelation.setOption('parentObject', this);

		this._setRelation(relationName, newRelation);
	}

	protected _setListRelation(name: string, value: any, foreignKeyObject?: any) {
		if (value) {
			if (foreignKeyObject) {
				value.forEach((item) => {
					if (item) Object.assign(item, foreignKeyObject);
				});

				if (value.setOption) value.setOption('foreignKeyObject', foreignKeyObject); //
			}
		}
		if (!value || !value.setOption) return this._constructRelation(name, value, foreignKeyObject);

		this._setRelation(name, value);
	}

	protected _getListRelation(name: string, foreignKeyObject?: any) {
		if (!this._getRelation(name)) this._constructRelation(name, [], foreignKeyObject);
		return this._getRelation(name);
	}

	protected _setObjectRelation(
		name: string,
		value: any,
		foreignKeyAttribute: string,
		foreignKeyIdentifierAttribute: string,
		foreignKeyObject?: any
	) {
		if (value) {
			if (foreignKeyAttribute && value[foreignKeyIdentifierAttribute])
				this[foreignKeyAttribute] = value[foreignKeyIdentifierAttribute];

			if (foreignKeyObject) {
				Object.assign(value, foreignKeyObject);
				if (value.setOption) value.setOption(foreignKeyObject, value);
			}
		}
		if (!value || !value.setOption) return this._constructRelation(name, value, foreignKeyObject);

		this._setRelation(name, value);
	}

	protected _getObjectRelation(name: string, foreignKeyObject?: any): any {
		if (config.initializeObjectRelationsInGetter && !this._getRelation(name)) {
			this._constructRelation(name, {}, foreignKeyObject);
		}
		return this._getRelation(name);
	}

	protected _initializeRelationships(object: any, relationships: string[]) {
		relationships.forEach((relationshipName) => {
			this[relationshipName] = object && object[relationshipName] ? object[relationshipName] : [];
		});
	}

	protected _getRelationOptions(relationName: string, foreignKeyObject?: any): ApexDataOptions | undefined {
		if (!this._options) {
			return;
		}

		// Start with the default options
		const relationOptions: ApexDataOptions = new ApexDataOptions();

		if (foreignKeyObject) relationOptions.foreignKeyObject = foreignKeyObject;

		// Add values from the options on this object

		if (this._options.readAutomatically) {
			relationOptions.readAutomatically = this._options.readAutomatically;
		}
		if (this._options.saveAutomatically) {
			relationOptions.saveAutomatically = this._options.saveAutomatically;
		}
		if (this._options.readOnDemand) {
			relationOptions.readOnDemand = this._options.readOnDemand;
		}
		if (this._options.saveOnDemand) {
			relationOptions.saveOnDemand = this._options.saveOnDemand;
		}
		if (this._options.read) {
			relationOptions.read = this._options.read;
		}
		if (this._options.save) {
			relationOptions.save = this._options.save;
		}
		if (this._options.saveDelay) {
			relationOptions.saveDelay = this._options.saveDelay;
		}
		if (this._options.onError) {
			relationOptions.onError = this._options.onError;
		}
		if (this._options.isAsync) {
			relationOptions.isAsync = this._options.isAsync;
		}

		if (this._options.isForms) {
			relationOptions.isForms = this._options.isForms;
		}
		if (this._options.ignorePendingChanges) {
			relationOptions.ignorePendingChanges = this._options.ignorePendingChanges;
		}

		// Add values from the include if it exists
		if (this._options.include && this._options.include[relationName]) {
			for (let name in this._options.include[relationName]) {
				let value = this._options.include[relationName][name];

				relationOptions[name] = value;

				if (name == 'save') {
					relationOptions.saveAutomatically = value == 'Automatically';
					relationOptions.saveOnDemand = value == 'On Demand';
				} else if (name == 'read') {
					relationOptions.readAutomatically = value == 'Automatically';
					relationOptions.readOnDemand = value == 'On Demand';
				} else if (name == 'readAutomatically' && value) {
					relationOptions.readOnDemand = false;
					relationOptions.read = 'Automatically';
				} else if (name == 'saveAutomatically' && value) {
					relationOptions.save = 'Automatically';
					relationOptions.saveOnDemand = false;
				} else if (name == 'readOnDemand' && value) {
					relationOptions.read = 'On Demand';
					relationOptions.readAutomatically = false;
				} else if (name == 'saveOnDemand' && value) {
					relationOptions.save = 'On Demand';
					relationOptions.saveAutomatically = false;
				}
			}
		}

		return relationOptions;
	}

	protected _startSaveCountdown() {
		//debug('in save countdown', this._options);
		if (this._options?.saveAutomatically) {
			// Clear the previous timeout if there is one
			if (this._timeoutId) {
				clearTimeout(this._timeoutId);
			}

			// Set a new timeout
			this._timeoutId = setTimeout(async () => {
				// If save is still automatically
				if (this._options.saveAutomatically && JSON.stringify(this._pendingChanges) != '{}') {
					await this.save(undefined, this._context);
				}
			}, this._options.saveDelay || 0);
		}
	}

	protected _startSave() {
		this.loading = true;
		this.saving = true;
		this.statusChanges.next('SAVING');
		//this._status.next('saving changes');
		if (this._options && this._options.parentObject) {
			this._options.parentObject.setOption('activeObjectSaveCount', 1);
		}
	}

	protected _endSave(err: any) {
		this.loading = false;
		this.saving = false;
		if (err) {
			//this._status.next('problem saving changes');
			if (this._options.onError) this._options.onError(err);
		} else {
			//this._status.next('changes saved');
			if (this._options.onSaveComplete) {
				this._options.onSaveComplete(err);
			}
		}
		if (this._options && this._options.parentObject) {
			this._options.parentObject.setOption('activeObjectSaveCount', -1);
		}
		this.statusChanges.next('SAVED');
		this._processPendingSave();
		if (err && !this._options.onError) throw err;
	}

	_createPendingSave() {
		if (!this._pendingSave) {
			this._pendingSave = setTimeout(() => {
				this.saving = false;
				this._processPendingSave();
			}, config.pendingSaveTimeout || 3000);
		}
	}

	_processPendingSave() {
		if (this._pendingSave) {
			clearTimeout(this._pendingSave);
			this._pendingSave = null;
			if (JSON.stringify(this._pendingChanges) != '{}') {
				this.save(undefined, this._context);
			}
		}
	}

	async save(saveTime?: number, context?: any): Promise<void> {
		let id = this.getIdentifier();
		if (!id && this.creating) {
			debug('already creating');
			this._startSaveCountdown();
			return;
		}

		if (id && this.saving) {
			this._createPendingSave();
			return;
		}

		// Clear the previous timeout if there is one
		if (this._timeoutId) {
			clearTimeout(this._timeoutId);
		}

		if (!saveTime) {
			saveTime = new Date().getTime();
		}

		if (saveTime > this._lastSaveTime) {
			this._lastSaveTime = saveTime;

			// merge foreign key values if present
			if (this._options.foreignKeyObject) {
				for (let nam in this._options.foreignKeyObject) {
					if (!this[nam]) this._set(nam, this._options.foreignKeyObject[nam]);
				}
			}

			if (!this._repository) {
				return;
			} else {
				const pendingChanges = this._pendingChanges;
				debug('_pendingChanges', pendingChanges);
				this._pendingChanges = {};

				this._startSave();

				let err;

				if (JSON.stringify(pendingChanges) !== '{}') {
					if (id) {
						this.saving = true;
						try {
							const res = await this._repository.updateById(id, pendingChanges, context ?? this._context);
							this._deserialize(res);
							debug('update %j', res);
						} catch (error) {
							console.error(error);
							err = error;
						}
						this.saving = false;
					} else {
						this.creating = true;
						debug('pendingChanges', pendingChanges);

						try {
							// client side, call createWithChildren in the repository to pass the request via http and clear pending changes
							// server side, call createWithChildren directly to recurse through the adding
							const objectToCreate = this.toJSON(true);
							this._clearSaveTimeouts();
							debug('object to create %j', objectToCreate);
							const promise = this._repository.createWithChildren
								? this._repository.createWithChildren(objectToCreate, context ?? this._context)
								: this._classReference.createWithChildren(
										objectToCreate,
										this._options,
										context ?? this._context
								  );
							let res = await promise;
							debug('create result %j', res);
							this._clearPendingChanges(true);
							this.setOption('ignorePendingChanges', true);
							this._deserialize(res, null, true);

							if (res && this._classReference && res[this._classReference._idProperty])
								this._updateForeignKey(res[this._classReference._idProperty]);
						} catch (error) {
							console.error(error);
							err = error;
						}
					}
				} else {
				}

				if (this._options.saveOnDemand) {
					let promises: any[] = [];
					let relationshipsByName = this.getMetadata('relationships');
					if (relationshipsByName) {
						for (let relationshipName in relationshipsByName) {
							let relationship = relationshipsByName[relationshipName];
							let value = this._object[relationshipName];
							if (
								(value && relationship.type === 'has many' && value.length > 0) ||
								relationship.type === 'has one'
							) {
								if (value && value['getOption'] && value['getOption']('saveOnDemand')) {
									//debug(this._options.className,'saving',key,value);
									promises.push(value['save'](saveTime, context ?? this._context));
								}
							}
						}
					} else if (this._object) {
						const properties = Object.keys(this._object);
						for (const prop of properties) {
							let value = this[prop];
							if (!prop.startsWith('_') && value && value.save && typeof value.save == 'function') {
								promises.push(value.save(saveTime, context ?? this._context));
							}
						}
					}
					try {
						if (promises.length > 0) {
							await Promise.all(promises);
						}
					} catch (error) {
						debug('errer', error);
						console.error(error);
						err = error;
					}
				}

				this._endSave(err);
			}
		} else {
			debug('already saved');
		}
	}

	public async delete(context?: any): Promise<void> {
		let id = this.getIdentifier();

		debug(this._options.className + ':delete');
		if (!this._repository) {
			debug(this._options.className, 'with id', id, 'is not configured data access');
		} else if (!id) {
			debug(this._options.className, 'does not have an id');
		} else {
			//this._options.onDeleteStart();
			this.loading = true;
			//this._status.next('deleting');
			try {
				await this._repository.deleteById(id, context ?? this._context);
			} catch (err) {}

			this.loading = false;

			this._pendingChanges = {};
		}
	}

	toJSON(isForCreate?: boolean, references?: any): any {
		debug('toJSON isForCreate', isForCreate);
		if (typeof isForCreate === 'object') {
			references = isForCreate;
			isForCreate = false;
		}
		let thisReference;
		if (!references) {
			thisReference = {};
			references = { objectStack: [this], objectJSONStack: [thisReference] };
		}
		isForCreate = isForCreate === true;
		let obj = {};
		for (let nam in this._object) {
			let value = this[nam];
			if (value !== undefined) {
				if (value && value.toJSON) {
					if (typeof value.getOption === 'function') {
						let saveSetting = value.getOption('save');
						debug('saveSetting', saveSetting);
						// if isForCreate, do not continue if there is an id
						if (
							!isForCreate ||
							((value.getOption('saveOnDemand') || value.getOption('saveAutomatically')) && !value.id)
						) {
							let stackIndex = references.objectStack.indexOf(value);
							if (stackIndex >= 0) {
								obj[nam] = references.objectJSONStack[stackIndex];
							} else {
								stackIndex = references.objectStack.push(value) - 1;
								const placeholderReference = {};
								references.objectJSONStack.push(placeholderReference);
								obj[nam] = value.toJSON(isForCreate, references);
								for (let prop in obj[nam]) placeholderReference[prop] = obj[nam][prop];
							}
						}
					} else {
						obj[nam] = value.toJSON();
					}
				} else {
					obj[nam] = value;
				}
			}
		}

		// Remove null or empty string id values
		if (isForCreate && !obj['id']) {
			delete obj['id'];
			if (this._options.foreignKeyObject) {
				for (let name in this._options.foreignKeyObject) {
					if (!obj[name]) delete obj[name];
				}
			}
		}
		if (thisReference) for (let prop in obj) thisReference[prop] = obj[prop];
		debug('obj', obj);
		return obj;
	}

	setOption(name: string, value: any) {
		this._options[name] = value;
	}

	getOption(name: string) {
		return this._options[name];
	}

	async applyInclude(include: any, context?: any) {
		await this.applyFilter({ include }, context);
	}

	async applyWhere(where: any, context?: any) {
		await this.applyFilter({ where }, context);
	}

	async applyFilter(filter?: any, context?: any) {
		Object.assign(this._options, filter);
		await this.read(context);
	}

	static setConfig(name: string, value: any) {
		config[name] = value;
	}

	setContext(context: any) {
		this._context = context;
	}

	setClassReference(classReference: any) {
		this._classReference = classReference;
	}

	setRepository(repository: any) {
		this._repository = repository;
	}

	protected async _handleRelationList<T>(
		relationName: string,
		list: any[] | undefined,
		objectReference: any,
		listClassReference: any,
		foreignKeyObject?: Object,
		context?: any
	): Promise<T> {
		// if setting a value, set or construct a new list
		if (list) {
			if (foreignKeyObject)
				list.forEach((item) => {
					if (item) Object.assign(item, foreignKeyObject);
				});

			if (list instanceof listClassReference) this._set(relationName, list);
			else
				this._set(
					relationName,
					new listClassReference(
						list,
						this._getRelationOptions(relationName, foreignKeyObject),
						context ?? this._context
					)
				);
		} else if (!this._get(relationName)) {
			// otherwise, search using the providing where clause if specified.
			// (ex: finding Project.userInterfaces would have foreignKeyObject = {projectId: 7})
			const filter = foreignKeyObject ? { where: foreignKeyObject } : {};

			this._set(
				relationName,
				await objectReference.find(
					filter,
					this._getRelationOptions(relationName, foreignKeyObject),
					context ?? this._context
				)
			);
		}

		return this._get(relationName);
	}

	protected async _handleRelationObject<T>(
		relationName: string,
		object: Q | Object | undefined,
		objectClassReference: any,
		id: any,
		context?: any
	): Promise<T> {
		// if setting a value, set or construct a new object
		if (object) {
			if (object instanceof objectClassReference) this._set(relationName, object);
			else
				this._set(
					relationName,
					new objectClassReference(object, this._getRelationOptions(relationName), context ?? this._context)
				);
		} else if (!this._get(relationName)) {
			// when we don't have a value, go get it
			this._set(
				relationName,
				await objectClassReference.findById(
					id,
					{},
					this._getRelationOptions(relationName),
					context ?? this._context
				)
			);
		}

		return this._get(relationName);
	}

	getMetadata(name?: string): any {
		return this._classReference.getMetadata(name);
	}

	static getMetadata(name?: string): any {
		if (!name || !this.metadata) return this.metadata;
		return this.metadata[name];
	}

	static getObjectClass(): any {
		return this;
	}

	static getArrayClass(): any {
		if (this == this.getMetadata('formGroupClass')) return this.getMetadata('formArrayClass');
		else return this._staticClassListReference;
	}

	protected static async _findById<Q>(id: any, options: ApexDataOptions, context?: any): Promise<Q> {
		const filter = this._prepareFilter(options);
		let result = await this._staticRepository.findById(id, filter, context);
		result = result?.toJSON ? result.toJSON() : result;
		parseResult(result);
		if (result) {
			const objectClass = this.getObjectClass();
			return new objectClass(result, options, context);
		} else return null;
	}

	protected static async _create<Q>(data: Object, options?: ApexDataOptions, context?: any): Promise<Q> {
		if (context === undefined && options && !(options instanceof ApexDataOptions)) {
			context = options;
			options = undefined;
		}

		let result = await this._staticRepository.create(data, context);
		result = result?.toJSON ? result.toJSON() : result;
		parseResult(result);

		if (!options) options = new ApexDataOptions();
		options.isInitializeRelationships = true;
		const objectClass = this.getObjectClass();
		return new objectClass(result, options, context);
	}

	static async createWithChildren<Q extends ApexDataObject<any>>(
		data: Object,
		options?: ApexDataOptions,
		context?: any
	): Promise<Q> {
		// set foreign keys and clean extra objects (needs to be in generated repository)
		let basicObject = {};
		for (let nam in data) {
			if ((typeof data[nam] != 'object' && data[nam] !== undefined) || data[nam] instanceof Date)
				basicObject[nam] = data[nam];
			//if (data[nam] && data[nam] instanceof Date)) basicObject[nam] = data[nam];
		}
		if (context === undefined && options && !(options instanceof ApexDataOptions)) {
			context = options;
			options = undefined;
		}

		if (!options) options = new ApexDataOptions();

		let currentSaveSetting = options.saveAutomatically;
		options.saveAutomatically = true;

		let newObj = await this._create<Q>(basicObject, options, context); // calling regular create to give us
		debug('newObj %j', newObj);

		// loop through data and check for
		let promises: any = [];
		for (let nam in data) {
			let val = data[nam];
			debug('val', nam, val);
			// The order of newObj[nam] being second is very important
			// because if it's a regular object newObj[nam] will end up initializing/creating it
			// and then the else if may create it twice - Kyle 9/5/23
			if (val instanceof Array && newObj[nam] instanceof Array) {
				if (config['useCreateAllInCreateWithChildren']) {
					const withoutId = val?.filter((v) => !v.id);

					const withId = val?.filter((v) => !!v.id);

					if (withoutId?.length) promises.push((newObj[nam] as any).addAll(withoutId, context));
					withId?.forEach((item) => promises.push(newObj[nam].add(item, context)));
				} else {
					val.forEach(async (item: any) => {
						promises.push(newObj[nam].add(item, context));
					});
				}
			} else if (val && typeof val == 'object' && !(val instanceof Date)) {
				let relationDictionary = newObj._getRelationDictionary();

				let relation = relationDictionary[nam];

				if (relation?.foreignKey) {
					debug('relation?.foreignKey', relation?.foreignKey);
					if (!data[nam][relation.foreignKey]) data[nam][relation.foreignKey] = newObj.getIdentifier();

					newObj[nam] = await relation.classReference.create(
						data[nam],
						newObj._getRelationOptions(nam, { [relation.foreignKey]: newObj.getIdentifier() }),
						newObj._context
					);
				}
			}
		}

		if (promises.length > 0) await Promise.all(promises);
		options.saveAutomatically = currentSaveSetting;
		debug('newObj %j', newObj); //debug
		return newObj;
	}

	protected static async _find<Q>(options: ApexDataOptions, context?: any): Promise<Q> {
		const filter = this._prepareFilter(options);
		const result = await this._staticRepository.find(filter, context);
		const arrayClass = this.getArrayClass();
		return new arrayClass(result?.toJSON ? result.toJSON() : result, options, context);
	}

	protected static async _findOne<Q>(options: ApexDataOptions, context?: any): Promise<Q> {
		const filter = this._prepareFilter(options);
		let result = await this._staticRepository.findOne(filter, context);

		result = result?.toJSON ? result.toJSON() : result;
		parseResult(result);
		if (result) {
			const objectClass = this.getObjectClass();
			return new objectClass(result, options, context);
		} else return null;
	}

	static async deleteById(id: any, context?: any): Promise<void> {
		return this._staticRepository.deleteById(id, context);
	}

	static async deleteAll(where: object, context?: any): Promise<number> {
		if (where && Object.keys(where).length >= 1 && Object.keys(where).includes('where')) {
			throw 'Error: deleteAll should be passed the where clause directly rather than inside an object.';
		}
		return this._staticRepository.deleteAll(where, context);
	}

	static async count(where: object, context?: any): Promise<number> {
		debug('count where', where);
		const result = await this._staticRepository.count(where, context);
		return result && result.count !== undefined ? result.count : result;
	}

	static async exists(id: any, context?: any): Promise<boolean> {
		return this._staticRepository.exists(id, context);
	}

	static async update(data: Object, context?: any): Promise<void> {
		if (!data) return;
		const id = this._staticClassReference?._idProperty ? data[this._staticClassReference?._idProperty] : data['id'];
		if (data['toJSON']) data = data['toJSON']();
		return this._staticRepository.updateById(id, data, context);
	}

	static async updateById(id: any, data: Object, context?: any): Promise<void> {
		return this._staticRepository.updateById(id, data, context);
	}

	static async updateAll(where: Object, data: Object, context?: any): Promise<number> {
		if (where && Object.keys(where).length >= 1 && Object.keys(where).includes('where')) {
			throw 'Error: updateAll should be passed the where clause directly rather than inside an object.';
		}
		return this._staticRepository.updateAll(data, where, context);
	}

	static async replaceById(id: any, data: Object, context?: any): Promise<void> {
		return this._staticRepository.replaceById(id, data, context);
	}

	protected static async _createAll<Q>(data: Object[], options?: ApexDataOptions, context?: any): Promise<Q> {
		if (context === undefined && options && !(options instanceof ApexDataOptions)) {
			context = options;
			options = undefined;
		}

		const batchSize = config?.createAllBatchSize || 2000;
		let batchCount = 0;

		let results;

		while (data?.length > batchSize * batchCount) {
			const result = await this._staticRepository.createAll(
				data.slice(batchSize * batchCount, batchSize + batchSize * batchCount),
				context
			);
			debug('createAll result.length', result?.length);
			if (!results) results = result;
			else results.push(...result);
			batchCount++;
			debug('batchSize * batchCount', batchSize * batchCount);
		}

		const arrayClass = this.getArrayClass();
		const output = new arrayClass(results?.toJSON ? results.toJSON() : results, options, context);
		debug('createAll output?.length', output?.length);
		return output;
	}

	protected static async _save<Q>(data: Object, options?: ApexDataOptions, context?: any): Promise<Q> {
		if (!data) return;

		const id = this._staticClassReference?._idProperty ? data[this._staticClassReference?._idProperty] : data['id'];

		if (data['toJSON']) data = data['toJSON']();

		await this._staticRepository.updateById(id, data, context);

		return this._findById<Q>(id, options, context);
	}
}
const dateRegex = new RegExp(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/);

function parseResult(obj) {
	if (!obj || typeof obj != 'object') return;

	if (obj instanceof Array) {
		obj.forEach((item) => parseResult(item));
	} else {
		for (let attr in obj) {
			let val = obj[attr];
			if (typeof val == 'string' && dateRegex.test(val)) obj[attr] = new Date(val);
			else parseResult(obj[attr]);
		}
	}
}
