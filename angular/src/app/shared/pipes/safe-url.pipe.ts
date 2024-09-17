// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
	name: 'safe'
})
export class SafeUrlPipe implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}
	transform(url) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}
}
