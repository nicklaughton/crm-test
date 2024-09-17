// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ApexDataOptions } from './apex-data-options';
import { ApexFormControl } from './apex-form-control';
import 'reflect-metadata';

const debug = require('debug')('ApexFormObject');
debug.log = console.log.bind(console);

export abstract class ApexFormObject {
	formGroup: FormGroup;
	protected _object: any;
	protected _options: ApexDataOptions;
	private _subscriptions: Array<any> = [];
	protected _pendingChanges: any;
	protected _classReference: any;
	get controls(): Record<string, ApexFormControl> {
		return {};
	}

	constructor(object?: any, _options?: ApexDataOptions | undefined, classReference?: any, repo?: any, context?: any) {
		if (_options && _options.isForms) {
			this.formGroup = new FormGroup({}, { updateOn: _options.updateOn });
			this._get = ApexFormObject.prototype._get;
			this.getIdentifier = ApexFormObject.prototype.getIdentifier;
			this._set = ApexFormObject.prototype._set;
			this._getRelation = ApexFormObject.prototype._getRelation;
			this._setRelation = ApexFormObject.prototype._setRelation;
			this._reset = ApexFormObject.prototype._reset;
			this._deleteAttribute = ApexFormObject.prototype._deleteAttribute;
			this.toJSON = ApexFormObject.prototype.toJSON;
			this.setOption = ApexFormObject.prototype.setOption;

			if (_options['required']) {
				if (!this._options) this._options = _options;
				if (!this._classReference) this._classReference = classReference;
				for (let property of this.getMetadata('properties') || []) {
					const propertyName = property.name;
					if (
						!this.formGroup.controls[propertyName] &&
						this.getFieldValidatorOption(propertyName, 'required')
					) {
						let currentValue = object ? object[propertyName] : undefined;
						this._initializePropertyControl(propertyName, currentValue);
					}
				}
			}
		}
	}

	// Date compare does not properly check equality
	protected isNotEqual(a, b) {
		const isEqual = a === b;
		if (isEqual) return false;
		else if (a instanceof Date && b instanceof Date) {
			return a.getTime() !== b.getTime();
		} else return true;
	}

	private getFieldValidatorOption(fieldName: string, optionName: 'required' | 'disabled') {
		let hasValidator = false;
		const option = this._options[optionName];
		if (option) {
			if (option instanceof Array && option.includes(fieldName)) return true;
			else if (typeof option === 'string' && option === fieldName) return true;
			else if (option[fieldName]) return true;
		}
		return hasValidator;
	}

	protected _initializePropertyControl(name: string, currentValue?: any): ApexFormControl {
		if (!this.formGroup.controls[name]) {
			const properties = Object.assign(
				{},
				this._classReference.getMetadata('properties').find((item) => item.name === name)
			);

			properties['isRequired'] = properties['isRequired'] || this.getFieldValidatorOption(name, 'required');
			properties['isDisabled'] = this.getFieldValidatorOption(name, 'disabled');
			properties['defaultValue'] = currentValue;

			let newControl = ApexFormControl.initialize(properties, { updateOn: this._options.updateOn });
			newControl.setBusinessObjectName(this._classReference.getMetadata('name'));
			newControl.setApexFormObject(this);

			this.formGroup.addControl(name, newControl);

			let isId = newControl.isId || name === 'id';

			this._subscriptions.push(
				newControl.valueChanges.subscribe((newValue: any) => {
					debug('valueChanges newValue', newValue, 'currentValue', currentValue);
					if (newValue !== undefined && this.isNotEqual(newValue, currentValue)) {
						const previousValue = currentValue;
						currentValue = newValue;
						const isForceSave = !(newValue === null && previousValue === undefined);
						if (!isId) this._updateAttribute(name, newValue, isForceSave);
					}
				})
			);

			return newControl;
		} else return this.formGroup.controls[name] as ApexFormControl;
	}

	protected _updateAttribute(name, value, forceSave?: boolean) {}

	protected _get(name: string) {
		//debug('_get', name);
		this._initializePropertyControl(name);

		return this.formGroup.controls[name] ? this.formGroup.controls[name].value : undefined;
	}

	protected getIdAttribute(): string {
		return this._classReference?._idProperty ? this._classReference?._idProperty : 'id';
	}

	protected getIdentifier(): any {
		return this._get(this.getIdAttribute());
	}

	protected _set(name: string, value: any) {
		//debug('_set', name, value);
		this._initializePropertyControl(name, value);

		if (this.formGroup.controls[name]?.value !== value) {
			const eventPropagationOptions = this._options.ignorePendingChanges ? { onlySelf: true } : {};
			this.formGroup.controls[name].setValue(value, eventPropagationOptions);
		}
	}

	protected _setRelation(name: string, value: any) {
		this._object[name] = value;
		if (this.formGroup.controls[name]) {
			this.formGroup.setControl(name, value.formArray ?? value.formGroup); //[name] = value.formArray ?? value.formGroup; //.setControl(name, value.formArray ?? value.formGroup);
		} else {
			this.formGroup.addControl(name, value.formArray ?? value.formGroup);
		}
	}

	protected _getRelation(name: string) {
		return this._object[name];
	}

	protected _reset() {
		debug('start _reset');
		for (let controlName in this.formGroup.controls || {}) {
			let formControl = this.formGroup.controls[controlName];
			if (this[controlName] && this[controlName]._reset) this[controlName]._reset();
			else if (this[controlName] && this[controlName]._clear) this[controlName]._clear();
			else if (formControl instanceof FormArray) {
				formControl.setValue([]);
			} else {
				const eventPropagationOptions = this._options.ignorePendingChanges ? { onlySelf: true } : {};
				formControl.setValue(undefined, eventPropagationOptions);
			}
		}
		debug('end _reset');
		this._object = {};
	}

	reset() {
		this._reset();
	}

	protected _deleteAttribute(name: string) {
		this.formGroup.removeControl(name);
	}

	protected _getFormControl(name: string): ApexFormControl {
		if (this.formGroup && !this.formGroup.contains(name)) return this._initializePropertyControl(name);

		if (this.formGroup && this.formGroup.controls && this.formGroup.controls[name])
			return this.formGroup.controls[name] as ApexFormControl;
	}

	protected _getFormRelation(name: string): FormGroup | FormArray | ApexFormControl | AbstractControl {
		if (this.formGroup && this.formGroup.contains(name)) return this.formGroup.controls[name];
		else if (this[name] && this.formGroup && this.formGroup.contains(name)) return this.formGroup.controls[name]; // the getter should initialize the form group
	}

	toJSON(isForCreate?: boolean): any {
		let obj = {};
		for (let nam in this.formGroup.controls) {
			let value = this[nam];
			if (value !== undefined) {
				if (value && value.toJSON) {
					if (typeof value.getOption === 'function') {
						let saveSetting = value.getOption('save');
						debug('saveSetting', saveSetting);
						if (!isForCreate || value.getOption('saveOnDemand') || value.getOption('saveAutomatically')) {
							obj[nam] = value.toJSON(isForCreate);
						}
					} else obj[nam] = value.toJSON();
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
		return obj;
	}

	getMetadata(name?: string): any {
		return this._classReference.getMetadata(name);
	}

	setOption(name: string, value: any) {
		this._options[name] = value;
		if (name == 'save') {
			if (value == 'Automatically') {
				this._options.saveAutomatically = true;
				this._options.saveOnDemand = false;
			} else if (value == 'On Demand') {
				this._options.saveAutomatically = false;
				this._options.saveOnDemand = true;
			} else if (value == 'Never') {
				this._options.saveAutomatically = false;
				this._options.saveOnDemand = false;
			}
		} else if (name == 'ignorePendingChanges') {
			if (value === false) {
				this.formGroup.updateValueAndValidity();
			}
		}
	}

	applyVisibility(visibilityFunction: (formControls?: any) => void) {
		const initialStateByName = {};
		for (let controlName in this.formGroup.controls || {}) {
			const control = this.formGroup.controls[controlName];
			if (control instanceof ApexFormControl)
				initialStateByName[controlName] = { isDisabled: control.isDisabled, isHidden: control.isHidden };
		}
		debug('initialStateByName', initialStateByName);
		visibilityFunction(this.formGroup.controls);

		let changes = false;
		for (let controlName in this.formGroup.controls || {}) {
			const control = this.formGroup.controls[controlName];
			if (control instanceof ApexFormControl)
				if (control.isHidden && !initialStateByName[controlName]?.isHidden) {
					control.disable({ onlySelf: true, emitEvent: false });
					control.reset(null, { onlySelf: true, emitEvent: false });
					changes = true;
				} else if (!control.isHidden && initialStateByName[controlName]?.isHidden) {
					if (!control.isDisabled) {
						control.enable({ onlySelf: true, emitEvent: false });
						changes = true;
					}
				}
		}
		if (changes) this.formGroup.updateValueAndValidity();
	}

	show(...controls: ApexFormControl[]) {
		for (let control of controls || []) {
			control.show();
		}
	}
	showExcept(...controls: ApexFormControl[]) {
		this.showAll();
		for (let control of controls || []) {
			control.hide();
		}
	}
	hide(...controls: ApexFormControl[]) {
		for (let control of controls || []) {
			control.hide();
		}
	}
	hideExcept(...controls: ApexFormControl[]) {
		this.hideAll();
		for (let control of controls || []) {
			control.show();
		}
	}
	showAll() {
		for (let controlName in this.controls || {}) {
			this.controls[controlName].show();
		}
	}
	hideAll() {
		for (let controlName in this.controls || {}) {
			this.controls[controlName].hide();
		}
	}
}
