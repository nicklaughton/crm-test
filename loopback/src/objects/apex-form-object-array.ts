// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataOptions } from './apex-data-options';

export abstract class ApexFormObjectArray extends Array {
	constructor(
		objects?: any[],
		_options?: ApexDataOptions | undefined,
		classReference?: any,
		repo?: any,
		context?: any
	) {
		super();
	}
}
