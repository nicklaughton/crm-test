// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Injectable } from '@angular/core';
import { ApexDesignerBusinessObjectsService } from '../../shared/services/apex-designer-business-objects.service';

import * as Debug from 'debug';
const classDebug = Debug('PathToRootObjectService');

@Injectable()
export class PathToRootObjectService {
	constructor(private apexDesignerBusinessObjectsService: ApexDesignerBusinessObjectsService) {}

	// This method can be overridden to handle special cases where there are multiple parents

	pathToRoot(businessObjectName: string): string[] {
		const debug = classDebug.extend('pathToRoot');
		debug('businessObjectName', businessObjectName);
		let path = [];
		this._addLevel(path, businessObjectName);
		debug('path', path);
		return path;
	}

	private _addLevel(path: string[], businessObjectName: string) {
		const debug = classDebug.extend('_addLevel');
		debug('path', path);
		debug('businessObjectName', businessObjectName);
		let businessObject = this.apexDesignerBusinessObjectsService[businessObjectName];
		for (let name in businessObject.relationships) {
			let relationship = businessObject.relationships[name];

			// Make sure we don't start an infinite loop
			if (relationship.type == 'belongs to' && relationship.businessObject.name != businessObjectName) {
				path.push(name);
				this._addLevel(path, relationship.businessObject.name);
				break;
			}
		}
	}

	includesFromPath(path: string[]): any {
		const debug = classDebug.extend('includesFromPath');
		let includes: any = {};
		let currentInclude = includes;
		path.forEach((parent, index) => {
			if (index > 0) {
				currentInclude.include = {};
				currentInclude = currentInclude.include;
			}
			currentInclude[parent] = {};
			currentInclude = currentInclude[parent];
		});
		debug('includes', includes);
		return includes;
	}
}
