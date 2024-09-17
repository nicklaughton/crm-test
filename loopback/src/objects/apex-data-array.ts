// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataOptions } from './apex-data-options';
import { ApexFormObjectArray } from './apex-form-object-array';

const debug = require('debug')('ApexDataArray');
debug.log = console.log.bind(console);

export abstract class ApexDataArray extends ApexFormObjectArray {
	private _pendingDeletions: any[] = [];
	private _saveTimeoutId: any;
	protected _options: ApexDataOptions;

	public static metadata: any;

	_repository: any;
	_classReference: any;

	static _staticRepository: any;

	static setRepository(repo: any) {
		this._staticRepository = repo;
	}

	private _lastSaveTime: number = 0;

	private _activeObjectSaveCount: number = 0;

	_context: any;

	// true when either saving or reading is true
	loading: boolean;
	saving: boolean;
	reading: boolean;

	//public _status: BehaviorSubject<string> = new BehaviorSubject<string>('');

	constructor(
		objects?: any[],
		_options?: ApexDataOptions | undefined,
		classReference?: any,
		repo?: any,
		context?: any
	) {
		super(objects, _options, classReference, repo, context);

		this._context = context;

		if (objects instanceof Array) {
			if (_options) this._options = _options;
		} else if (typeof objects == 'object') {
			this._options = objects;
			objects = undefined;
		} else if (_options) this._options = _options;

		if (!this._options) {
			this._options = new ApexDataOptions();
		}

		this._options.readAutomatically = this._options.readAutomatically || this._options.read == 'Automatically';
		this._options.saveAutomatically = this._options.saveAutomatically || this._options.save == 'Automatically';
		this._options.readOnDemand = this._options.readOnDemand || this._options.read == 'On Demand';
		this._options.saveOnDemand = this._options.saveOnDemand || this._options.save == 'On Demand';
		if (this._options.save == 'Never') {
			this._options.saveOnDemand = false;
			this._options.saveAutomatically = false;
		}
		if (this._options.read == 'Never') {
			this._options.readOnDemand = false;
			this._options.readAutomatically = false;
		}

		// Add or override the Array methods
		this._deserialize = ApexDataArray.prototype._deserialize;
		this._prepareFilter = ApexDataArray.prototype._prepareFilter;
		this._startSaveCountdown = ApexDataArray.prototype._startSaveCountdown;
		this._updateLoading = ApexDataArray.prototype._updateLoading;
		if (!this._clear) this._clear = ApexDataArray.prototype._clear;
		if (!this._push) this._push = ApexDataArray.prototype._push;
		this._clearSaveTimeouts = ApexDataArray.prototype._clearSaveTimeouts;
		this._clearPendingChanges = ApexDataArray.prototype._clearPendingChanges;
		this.toJSON = ApexDataArray.prototype.toJSON;
		this.read = ApexDataArray.prototype.read;
		this.add = ApexDataArray.prototype.add;
		this.remove = ApexDataArray.prototype.remove;

		this.save = ApexDataArray.prototype.save;

		this.setOption = ApexDataArray.prototype.setOption;
		this.getOption = ApexDataArray.prototype.getOption;

		if (!this._options.saveDelay) {
			this._options.saveDelay = 500;
		}

		this._classReference = this._options.classReference ?? classReference;
		this._repository = this._options.repository ?? repo;

		if (objects) this._deserialize(objects, this._context);
		else if (!objects && this._options.readAutomatically) {
			// the setTimeout resolves a repository timing issue (ex: /Users instead of /AppUsers on init)
			this.setOption('reading', true);
			setTimeout(() => {
				this.read(this._context).then(() => {
					this.setOption('ignorePendingChanges', false);
				});
			}, 1);
		} else this.setOption('ignorePendingChanges', false);
	}

	// override map to allow mapping to non ApexDataArray types
	map<U>(callbackfn: (value: any, index: number, array: any[]) => U, thisArg?: any): U[] {
		const newArray: U[] = [];
		this.forEach((item) => {
			newArray.push(item);
		});
		return newArray.map(callbackfn as any, thisArg);
	}

	protected _clear() {
		super.splice(0, this.length);
	}

	protected _push(obj: any) {
		this.push(obj);
	}

	get _parent(): any {
		return this._options.parentObject;
	}

	protected _deserialize(objects: Array<any>, context?: any) {
		// Remove the current elements from the array.
		this._clear();

		// Loop through the new elements
		for (let i = 0; i < objects.length; i++) {
			// If the object is already the right type, just use it
			if (objects[i] instanceof this._classReference) {
				this._push(objects[i]);

				// Else the object is plain and we need to construct the right class
			} else {
				this._push(new this._classReference(objects[i], { ...this._options }, context ?? this._context));
			}
			this[i].setOption('parentObject', this);
		}
		this.setOption('ignorePendingChanges', false);
	}

	protected _clearSaveTimeouts() {
		debug('_clearSaveTimeouts._saveTimeoutId', this._saveTimeoutId);

		if (this._saveTimeoutId) clearTimeout(this._saveTimeoutId);

		for (let item of this) {
			if (item && item['_clearSaveTimeouts'] && (item['_timeoutId'] || item['_saveTimeoutId'])) {
				item['_clearSaveTimeouts']();
			}
		}
	}

	protected _clearPendingChanges() {
		for (let item of this) {
			if (item && item['_clearPendingChanges']) {
				item['_clearPendingChanges']();
			}
		}
	}

	private _prepareFilter(options: ApexDataOptions): any {
		if (
			options.where ||
			options.fields ||
			options.include ||
			options.limit ||
			options.offset ||
			options.skip ||
			options.order ||
			options.foreignKeyObject
		) {
			let filter: any = {};
			if (options.where) {
				filter.where = options.where;
				if (options.foreignKeyObject) Object.assign(filter.where, options.foreignKeyObject);
			} else if (options.foreignKeyObject) {
				filter.where = options.foreignKeyObject;
			}
			if (options.fields) {
				let fields = options.fields;

				// always include id attribute to avoid excess creates
				let idProperty = this._classReference._idProperty || 'id';
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
					filter.include.push({
						relation: name,
						scope: this._prepareFilter(options.include[name])
					});
				}
			}
			return filter;
		} else {
			return null;
		}
	}

	async read(context?: any): Promise<void> {
		// Prepare the url
		let filter = this._prepareFilter(this._options);

		this.setOption('reading', true);
		//this._status.next('reading');

		// Read the list
		let res = await this._repository.find(filter, context ?? this._context);

		this._deserialize(res, context ?? this._context);
		if (this._options.onReadComplete) {
			this._options.onReadComplete();
		}
		this.setOption('reading', false);
		//this._status.next('read complete');
	}

	protected _updateLoading() {
		this.loading = this.saving || this.reading;
	}

	setOption(name: string, value: any) {
		if (name == 'saving' || name == 'reading') {
			this[name] = value;
			this._updateLoading();
		} else if (name == 'activeObjectSaveCount') {
			this._activeObjectSaveCount = this._activeObjectSaveCount + value;
			this.saving = !(this._activeObjectSaveCount == 0);
			this._updateLoading();
		} else {
			this._options[name] = value;
		}
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

	protected _startSaveCountdown() {
		if (this._options.saveAutomatically) {
			// Clear the previous timeout if there is one
			if (this._saveTimeoutId) {
				clearTimeout(this._saveTimeoutId);
			}

			// Set a new timeout
			this._saveTimeoutId = setTimeout(async () => {
				// If save is still automatically
				if (this._options.saveAutomatically) {
					await this.save(undefined, this._context);
				}
			}, this._options.saveDelay || 0);
		}
	}

	async add(object: any, context?: any): Promise<any> {
		// Create the correct class from the object
		const newObject =
			object instanceof this._classReference
				? object
				: new this._classReference(object, { ...this._options }, context ?? this._context);

		if (object instanceof this._classReference) Object.assign(newObject._options, this._options);

		if (this._options.foreignKeyObject) {
			for (let nam in this._options.foreignKeyObject) {
				if (this._options.foreignKeyObject[nam]) newObject[nam] = this._options.foreignKeyObject[nam];
			}
		}

		newObject.setOption('parentObject', this);

		this._push(newObject);

		if (newObject.getOption('saveAutomatically') || newObject.getOption('save') == 'Automatically')
			await newObject.save(undefined, context ?? this._context);

		return newObject;
	}

	async addAll(objects: any[], context?: any): Promise<any> {
		if (!objects?.length) return;
		// Create the correct class from the object
		let createdObjects;
		for (let object of objects) {
			if (this._options.foreignKeyObject) {
				for (let nam in this._options.foreignKeyObject) {
					if (this._options.foreignKeyObject[nam]) object[nam] = this._options.foreignKeyObject[nam];
				}
			}
		}
		createdObjects = await this._classReference.createAll(objects, this._copyOptions(), context ?? this._context);

		for (let newObject of createdObjects || []) {
			newObject.setOption('parentObject', this);
			Object.assign(newObject._options, this._options);
			this._push(newObject);
		}

		return createdObjects;
	}

	private _copyOptions(): any {
		const options = { ...this._options };
		delete options.where;
		delete options.limit;
		delete options.order;
		delete options.skip;
		delete options.offset;
		return options;
	}

	protected _removeAt(index: number) {
		return this.splice(index, 1);
	}

	public async remove(indexOrItem: any, context?: any): Promise<any[]> {
		var index = typeof indexOrItem == 'number' ? indexOrItem : this.indexOf(indexOrItem);

		if (index === -1 || index > this.length) return;

		const id = this[index]?.id ? this[index].id : null;

		let item = this[index];

		this._removeAt(index);

		if (
			id &&
			(!item ||
				!item.getOption ||
				item.getOption('saveAutomatically') ||
				item.getOption('save') == 'Automatically')
		) {
			await this._classReference.deleteById(id, context ?? this._context);
		} else {
			if (!this._pendingDeletions) this._pendingDeletions = [];
			this._pendingDeletions.push(item);
		}

		return item;
	}

	async save(saveTime?: number, context?: any): Promise<void> {
		// Clear the previous timeout if there is one
		if (this._saveTimeoutId) {
			clearTimeout(this._saveTimeoutId);
		}

		if (!saveTime) {
			saveTime = new Date().getTime();
		}

		if (saveTime > this._lastSaveTime) {
			this._lastSaveTime = saveTime;

			if (!this._repository) {
				// repository not set
			} else {
				this.setOption('saving', true);

				//this._status.next('saving changes');

				try {
					let promises: any = [];

					for (let pendingDeletion of this._pendingDeletions) {
						if (pendingDeletion.id) {
							promises.push(pendingDeletion.delete());
						}
					}
					debug('promises.length', promises.length);
					this._pendingDeletions = [];

					for (let item of this) {
						if (
							item.getOption('saveAutomatically') ||
							item.getOption('saveOnDemand') ||
							item.getOption('save') == 'On Demand' ||
							item.getOption('save') == 'Automatically'
						) {
							promises.push(item.save(saveTime, context ?? this._context));
						}
					}

					debug('promises.length', promises.length);

					await Promise.all(promises);

					//this._status.next('changes saved');
					if (this._options.onSaveComplete) {
						this._options.onSaveComplete(null);
					}
				} catch (err) {
					//this._status.next('problem saving changes');
					if (this._options.onError) {
						this._options.onError(err);
					} else {
						this.setOption('saving', false);
						throw err;
					}
				}

				this.setOption('saving', false);
			}
		}
	}

	getProperties(): any[] {
		return this._classReference.getProperties();
	}
	getProperty(name: string): any {
		return this._classReference.getProperty(name);
	}

	getRelationships(): any[] {
		return this._classReference.getRelationships();
	}
	getRelationship(name: string): any {
		return this._classReference.getRelationships(name);
	}

	getMetadata(name?: string): any {
		return this._classReference.getMetadata(name);
	}

	static getMetadata(name?: string): any {
		if (!name) return this.metadata;
		return this.metadata[name];
	}

	static getProperties(): any[] {
		return this.metadata['properties'];
	}
	static getProperty(name: string): any {
		let list = this.getProperties();
		return list.find((prop) => name === prop.name);
	}

	static getRelationships(): any[] {
		return this.metadata['relationships'];
	}
	static getRelationship(name: string): any {
		let list = this.getRelationships();
		return list.find((prop) => name === prop.name);
	}

	toJSON(isForSave?: boolean, references?: any): any[] {
		isForSave = isForSave === true;
		const result: any[] = [];
		this.forEach((item) => {
			let itemJSON;
			if (item && item.toJSON) itemJSON = item.toJSON(isForSave, references);
			else if (!isForSave) itemJSON = item;
			result.push(itemJSON);
		});
		return result;
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
}
