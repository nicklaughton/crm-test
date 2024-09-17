// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Injectable } from '@angular/core';

import * as Debug from 'debug';

const debug = Debug('Angular10BaseLibrary:BaseHrefService');

@Injectable()
export class BaseHrefService {
	prefix: string;
	constructor() {
		this.prefix = '';

		const baseElements = document.getElementsByTagName('base');

		if (!baseElements?.length) return;

		const baseHref = baseElements[0]?.href;
		debug('baseHref', baseHref);

		const withoutSlash = baseHref.endsWith('/') ? baseHref.slice(0, -1) : baseHref;
		debug('withoutSlash', withoutSlash);

		const parts = withoutSlash.split('/');
		debug('parts', parts);

		const withoutHost = parts.slice(3).join('/');
		debug('withoutHost', withoutHost);

		this.prefix = withoutHost ? '/' + withoutHost : '';
		debug('this.prefix', this.prefix);
	}
}
