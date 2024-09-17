// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

type ReadOption = 'On Demand' | 'Automatically' | 'Never';
type SaveOption = 'On Demand' | 'Automatically' | 'Never';
type UpdateOption = 'change' | 'blur' | 'submit';

export class ApexDataOptions {
	updateOn?: UpdateOption;

	className?: string;
	apiUrl?: string;
	postUrl?: string;

	parentObjectId?: any;
	parentObject?: any;

	autoRead?: boolean;
	autoSave?: boolean;

	readAutomatically?: boolean;
	saveAutomatically?: boolean;
	readOnDemand?: boolean;
	saveOnDemand?: boolean;

	read?: ReadOption;

	save?: SaveOption;

	saveDelay?: number;

	where?: any;
	fields?: any;
	order?: any;
	offset?: number;
	skip?: number;
	limit?: number;
	include?: any;

	onReadComplete?: any;
	onError?: any;
	onSaveComplete?: any;

	classReference?: any;
	repository?: any;

	isAsync?: boolean;

	foreignKeyObject?: any;

	isCreateChildren?: boolean;

	ignorePendingChanges?: boolean;

	isInitializeRelationships?: boolean;

	http?: any;

	isForms?: boolean;
}
