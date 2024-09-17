// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { MediaObserver } from '@angular/flex-layout';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApexFormControl } from '../models/apex-form-control';

import * as Debug from 'debug';
const debug = Debug('ApexDynamicComponentsService');

@Injectable()
export class ApexDynamicComponentsService {
	private _screenSizeIndex: number;
	get screenSizeIndex(): number {
		return this._screenSizeIndex;
	}
	private _mediaQueries: string[] = ['xs', 'sm', 'md', 'lg', 'xl'];

	formFieldAppearance: string = 'fill';
	formFieldFloatLabel: string = 'always';
	layoutGap: number = 20;
	inputAutocomplete: string = 'off';
	currencyCode: string = 'USD';
	currencyDecimalPlaces: number = 2;
	currencyLocale: string = 'en-US';
	minuteStep: number = 15;
	fixedTimezone: string;

	private _hideToolbar = new BehaviorSubject<boolean>(false);
	hideToolbar = this._hideToolbar.asObservable();

	constructor(private mediaObserver: MediaObserver) {
		this.maintainScreenSizeIndex();
	}

	setHideToolbar(hideToolbar: boolean) {
		this._hideToolbar.next(hideToolbar);
	}

	maintainScreenSizeIndex() {
		let mediaQueries = ['xs', 'sm', 'md', 'lg', 'xl'];
		this.mediaObserver.asObservable().subscribe((changes: any) => {
			changes.forEach((mediaChange) => {
				if (mediaChange.mqAlias && !mediaChange.mqAlias.includes('-')) {
					debug('mediaChange.mqAlias', mediaChange.mqAlias);
					this._screenSizeIndex = mediaQueries.indexOf(mediaChange.mqAlias);
				}
			});
		});
	}

	width(responsiveWidths: string): Observable<string> {
		debug('responsiveWidths', responsiveWidths);
		return new Observable((observer) => {
			this.mediaObserver.asObservable().subscribe((changes: any) => {
				changes.forEach((mediaChange) => {
					if (mediaChange.mqAlias && !mediaChange.mqAlias.includes('-')) {
						debug('mediaChange.mqAlias width', mediaChange.mqAlias);
						let index = this._mediaQueries.indexOf(mediaChange.mqAlias);
						debug('index', index);
						let parts = responsiveWidths.split(' ');
						let width = parts[this._screenSizeIndex] || parts[parts.length - 1];
						debug('width', width);
						observer.next(width);
					}
				});
			});
		});
	}

	setWidth(element: any, width?: string) {
		const debug = Debug('ApexDynamicComponentsService:setWidth');
		debug('element', element);
		debug('width', width);
		debug('element.style.flex', element.style.flex);
		if (width === undefined) {
			// don't do anything
		} else if (width == 'nogrow') {
			element.style.flex = '0 1 auto';
			element.style.boxSizing = 'border-box';
		} else if (width == 'grow') {
			element.style.flex = '1 1 100%';
			element.style.boxSizing = 'border-box';
		} else {
			if (!isNaN(Number(width))) {
				element.style.maxWidth = `calc(${width}% - ${this.layoutGap}px`;
				element.style.minWidth = `calc(${width}% - ${this.layoutGap}px`;
			} else {
				element.style.maxWidth = width;
			}
			element.style.flex = '1 1 100%';
			element.style.boxSizing = 'border-box';
		}
		debug.destroy();
	}

	setFixedWidth(element: any, width: string) {
		const debug = Debug('ApexDynamicComponentsService:setFixedWidth');
		debug('element', element);
		debug('width', width);
		this.setWidth(element, width);
		element.setAttribute('apexWidth', width);
		debug.destroy();
	}

	// Handles debounce, but also prevents this.controle.en/disable() from triggering changed.emit event
	getValueChangesObservable<T>(control: ApexFormControl | FormControl, debounce?: number): Observable<T> {
		if (!control) return;

		let valueChanges = control.valueChanges;

		const debounceMilliseconds = typeof debounce == 'string' ? Number(debounce) : debounce;

		if (debounceMilliseconds) valueChanges = valueChanges.pipe(debounceTime(debounceMilliseconds));
		return valueChanges.pipe(distinctUntilChanged());
	}

	handleDisplayControlDisabledChange(
		control: ApexFormControl | FormControl,
		displayControl: ApexFormControl | FormControl
	) {
		if (!control || !displayControl) return;
		if (control.disabled) displayControl.disable();

		control.registerOnDisabledChange((isDisabled) => {
			if (isDisabled) displayControl.disable();
			else displayControl.enable();
		});
	}
}
