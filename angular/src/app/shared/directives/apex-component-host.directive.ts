// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Directive, ViewContainerRef } from '@angular/core';
@Directive({
	selector: '[apex-component-host]'
})
export class ApexComponentHostDirective {
	constructor(public viewContainerRef: ViewContainerRef) {}
}
