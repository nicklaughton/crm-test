// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Injectable } from '@angular/core';

@Injectable()
export class ApexDesignerAssetService {
	constructor() {}

	url(assetName: string): string {
		return document.getElementsByTagName('base')[0].href + 'assets/' + assetName;
	}
}
