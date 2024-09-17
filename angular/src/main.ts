// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import * as Debug from 'debug';

declare const require: {
	context(
		path: string,
		deep?: boolean,
		filter?: RegExp
	): {
		<T>(id: string): T;
		keys(): string[];
	};
};

const isTesting = window.navigator.userAgent.includes('HeadlessChrome');

if (isTesting) {
	const testingPlatform = platformBrowserDynamicTesting();
	getTestBed().initTestEnvironment(BrowserDynamicTestingModule, testingPlatform);
	const context = require.context('./', true, /\.spec\.ts$/);
	context.keys().forEach(context);
} else {
	function toTitleCase(str) {
		return str
			.replace(/-/g, ' ')
			.replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			})
			.replace(/ /g, '');
	}
	const debug: Record<string, any> = {
		add: {},
		addDebugString: (debugString: string) => {
			debug.push(debugString);
		},
		push: (debugString: string) => {
			const currentString = Debug.namespaces;
			if (
				currentString == debugString ||
				(currentString &&
					(currentString.startsWith(debugString + ',') || currentString.includes(',' + debugString)))
			)
				return;
			const newString = currentString ? currentString + `,${debugString}` : debugString;
			Debug.enable(newString);
		},
		all: () => {
			Debug.enable('*');
		},
		reset: () => {
			localStorage.removeItem('debug');
			Debug.disable();
		},
		set: (debugString: string) => {
			Debug.enable(debugString);
		},
		contains: (debugString: string) => {
			debug.set(`*${debugString}*`);
		},
		pop: () => {
			let str = Debug.namespaces;
			if (str.includes(',')) {
				let splitAr = str.split(',');
				splitAr.pop();
				str = splitAr.join(',');
				debug.set(str);
			} else debug.reset();
		},
		remove: {},
		removeDebugString: (debugString) => {
			let str = Debug.namespaces;
			if (str.startsWith(debugString)) str = str.replace(debugString, '');
			else str = str.replace(',' + debugString, ',').replace(',,', ',');
			debug.set(str);
			return debug.remove;
		},
		query: (queryString) => {
			const componentNames = debug._getComponentNames(queryString);
			debug.set(componentNames.join(':*,')) + ':*';
		},
		_getComponentNames: (queryString: string) => {
			const nodes = document.querySelectorAll(queryString);
			const tagNamesMap = {};
			for (var i = 0, max = nodes.length; i < max; i++) {
				const node = nodes[i];
				if (!tagNamesMap[node.tagName]) {
					const component = window['ng'].getComponent(node);
					if (component) tagNamesMap[node.tagName] = true;
				}
			}
			const componentNames = [];
			for (let tagName in tagNamesMap) componentNames.push(toTitleCase(tagName));
			return componentNames;
		},
		_setup: () => {
			const componentNames = debug._getComponentNames('*');
			debug.add = {};
			debug.remove = {};
			componentNames.forEach((componentName) => {
				debug.add[componentName] = () => {
					debug.addDebugString(`${componentName}:*`);
				};
				debug.remove[componentName] = () => {
					debug.removeDebugString(`${componentName}:*`);
				};
			});
		},
		current: () => {
			debug.query('*');
		},
		currentPage: () => {
			debug.query('mat-sidenav-content *');
		},
		pause: () => {
			localStorage.setItem('debugPaused', localStorage.getItem('debug'));
			debug.reset();
		},
		resume: () => {
			debug.set(localStorage.getItem('debugPaused'));
		},
		save: (key: string) => {
			localStorage.setItem('debug' + key, localStorage.getItem('debug'));
		},
		load: (key: string) => {
			const savedDebugStr = localStorage.getItem('debug' + key);
			if (savedDebugStr) debug.set(savedDebugStr);
		}
	};
	window['debug'] = debug;
	platformBrowserDynamic()
		.bootstrapModule(AppModule)
		.catch((err) => console.error(err));
}
