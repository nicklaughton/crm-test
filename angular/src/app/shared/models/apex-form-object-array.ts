// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataOptions } from './apex-data-options';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';

const debug = require('debug')('ApexFormObjectArray');
debug.log = console.log.bind(console);

export class ApexFormObjectArray extends Array {
	formArray: FormArray;
	protected _options: ApexDataOptions;

	constructor(
		objects?: any[],
		_options?: ApexDataOptions | undefined,
		classReference?: any,
		repo?: any,
		context?: any
	) {
		super();

		if (_options && _options.isForms) {
			this.formArray = new FormArray([], { updateOn: _options.updateOn });
			this._clear = ApexFormObjectArray.prototype._clear;
			this._removeAt = ApexFormObjectArray.prototype._removeAt;
			this._push = ApexFormObjectArray.prototype._push;
		}
	}
	//push(...items: T[]): number;
	protected _push(obj: any) {
		debug('_push', obj);
		super.push(obj);
		this.formArray.push(obj.formGroup ?? obj.formArray);
	}

	protected _clear() {
		super.splice(0, this.length);
		if (this.formArray.length > 0) {
			this.formArray.clear();
		}
	}

	clear() {
		this._clear();
	}

	reset() {
		this.formArray.reset();
	}

	protected _removeAt(index: number): any {
		this.formArray.removeAt(index);
		return this.splice(index, 1);
	}
}
