// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { BaseHrefInterceptor } from './base-href.interceptor';
import { BaseHrefService } from './base-href.service';

@NgModule({
	imports: [CommonModule],
	providers: [
		BaseHrefService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: BaseHrefInterceptor,
			multi: true
		}
	]
})
export class ApiInterceptorModule {}
