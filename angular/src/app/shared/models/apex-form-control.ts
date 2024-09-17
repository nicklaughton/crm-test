// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { FormControl, Validators } from '@angular/forms';
import * as Debug from 'debug';

export class ApexFormControl extends FormControl {
	property: any;
	apexFormObject: any;

	name: string;
	displayName: string;
	isRequired: boolean;
	isHidden: boolean;
	isDisabled: boolean;
	isId: boolean;
	typeName: string;
	businessObjectName: string;
	pattern: string;
	patternMessage: string;
	minLength: number;
	maxLength: number;
	min: number;
	max: number;

	setProperty(property: any) {
		if (property) {
			this.name = property['name'];
			this.displayName = property['displayName'];
			this.isHidden = property['isHidden'];
			this.isRequired = property['isRequired'];
			this.isDisabled = property['isDisabled'];
			this.isId = property['isId'];
			this.typeName = property['typeName'];
			this.pattern = property['pattern'];
			this.patternMessage = property['patternMessage'];
			this.minLength = property['minLength'];
			this.maxLength = property['maxLength'];
			this.min = property['min'];
			this.max = property['max'];
			if (property['type']) {
				this.typeName = property['type']['name'];
				// If this is a base type, validation information may come from the type
				if (property['type']['pattern']) this.pattern = property['type']['pattern'];
				if (property['type']['patternMessage']) this.patternMessage = property['type']['patternMessage'];
				if (property['type']['minLength']) this.minLength = property['type']['minLength'];
				if (property['type']['maxLength']) this.maxLength = property['type']['maxLength'];
				if (property['type']['min']) this.min = property['type']['min'];
				if (property['type']['max']) this.max = property['type']['max'];
			}
		}
	}

	setBusinessObjectName(name: string) {
		this.businessObjectName = name;
	}

	setApexFormObject(object: any) {
		this.apexFormObject = object;
	}

	static initialize(
		properties?: {
			defaultValue?: any;
			name?: string;
			displayName?: string;
			isRequired?: boolean;
			isHidden?: boolean;
			isDisabled?: boolean;
			isId?: boolean;
			typeName?: string;
			pattern?: string;
			patternMessage?: string;
			minLength?: number;
			maxLength?: number;
			min?: number;
			max?: number;
			type?: any;
		},
		additionalOptions?: any
	): ApexFormControl {
		const validators = [];
		const type = properties?.type;
		if (properties?.isRequired) validators.push(Validators.required);
		if (properties?.pattern || (type && type['pattern']))
			validators.push(Validators.pattern(properties.pattern || type['pattern']));
		if (properties?.minLength !== undefined || (type && type['minLength']))
			validators.push(Validators.minLength(properties.minLength || type['minLength']));
		if (properties?.maxLength !== undefined || (type && type['maxLength']))
			validators.push(Validators.maxLength(properties.maxLength || type['maxLength']));
		if (properties?.min !== undefined || (type && type['min']))
			validators.push(Validators.min(properties.min || type['min']));
		if (properties?.max !== undefined || (type && type['max']))
			validators.push(Validators.max(properties.max || type['max']));

		const options = additionalOptions
			? Object.assign({ validators: validators }, additionalOptions)
			: { validators: validators };

		const newControl = new ApexFormControl(properties?.defaultValue, options);
		newControl.setProperty(properties);
		if (properties?.isDisabled) newControl.disable();
		return newControl;
	}

	hide() {
		this.isHidden = true;
	}

	show() {
		this.isHidden = false;
	}
}
