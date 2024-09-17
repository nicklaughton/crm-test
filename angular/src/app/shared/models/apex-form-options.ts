// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

type ReadOption = 'On Demand' | 'Automatically' | 'Never';
type SaveOption = 'On Demand' | 'Automatically' | 'Never';
type UpdateOption = 'change' | 'blur' | 'submit';

export class ApexFormOptions {
	updateOn?: UpdateOption;

	businessObject: any;
	businessObjects: any;

	apiUrl?: string;
	postUrl?: string;

	httpClient?: any;

	read?: ReadOption = 'Never';

	save?: SaveOption = 'Never';

	saveDelay?: number = 500;

	where?: any;
	fields?: any;
	order?: any;
	offset?: number;
	skip?: number;
	limit?: number;
	include?: any;

	constructor(options: any) {
		this.updateOn = options.updateOn || 'change';
		this.businessObject = options.businessObject;
		this.businessObjects = options.businessObjects;
		this.apiUrl = options.apiUrl || '/api/' + options.businessObject.pluralName;
		this.postUrl = options.postUrl;
		this.httpClient = options.httpClient;
		this.read = options.read || 'Never';
		this.save = options.save || 'Never';
		this.saveDelay = options.saveDelay || 500;
		this.where = options.where;
		this.fields = options.fields;
		this.order = options.order;
		this.offset = options.offset;
		this.skip = options.skip;
		this.limit = options.limit;
		this.include = options.include;
	}
}
