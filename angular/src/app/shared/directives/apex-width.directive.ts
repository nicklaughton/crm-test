// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Directive, Input, ElementRef, OnDestroy } from '@angular/core';
import { ApexDynamicComponentsService } from '../services/apex-dynamic-components.service';

import * as Debug from 'debug';
const debug = Debug('ApexWidthDirective');
@Directive({
	selector: '[apexWidth]'
})
export class ApexWidthDirective implements OnDestroy {
	private subscription: any;

	@Input('apexWidth') set width(widths: string) {
		debug('widths', widths);
		if (this.subscription) this.subscription.unsubscribe();
		this.subscription = this.apexDynamicComponentsService.width(widths).subscribe((width: string) => {
			debug('width', width);
			this.apexDynamicComponentsService.setWidth(this.elementRef.nativeElement, width);
		});
	}

	constructor(private elementRef: ElementRef, private apexDynamicComponentsService: ApexDynamicComponentsService) {
		debug('elementRef', elementRef);
	}

	ngOnDestroy() {
		if (this.subscription) this.subscription.unsubscribe();
	}
}
