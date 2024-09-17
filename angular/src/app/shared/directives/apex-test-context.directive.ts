// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
	selector: '[apexTestContext]'
})
export class ApexTestContextDirective implements OnInit {
	@Input('apexTestContext') apexTestContext: string;

	el: any;

	constructor(el: ElementRef) {
		//		console.log('el:', el);
		this.el = el;
	}

	ngOnInit() {
		//    	console.log('apexTestContext:', this.apexTestContext);
		this.el.nativeElement.setAttribute('apexTestContext', this.apexTestContext);
	}
}
