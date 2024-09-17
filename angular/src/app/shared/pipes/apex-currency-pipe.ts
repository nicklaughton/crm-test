// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

@Pipe({
	name: 'apexCurrencyPipe'
})
export class ApexCurrencyPipe implements PipeTransform {
	constructor(public apexDynamicComponentsService: ApexDynamicComponentsService) {}

	transform(value: number, locale?: string, currency?: string, currencyCode?: string, digitsInfo?: string): string {
		value = value || 0;
		locale = locale || this.apexDynamicComponentsService.currencyLocale;
		currencyCode = currencyCode || this.apexDynamicComponentsService.currencyCode;
		currency = currency || getCurrencySymbol(currencyCode, 'narrow');
		digitsInfo =
			digitsInfo ||
			'1.' +
				this.apexDynamicComponentsService.currencyDecimalPlaces +
				'-' +
				this.apexDynamicComponentsService.currencyDecimalPlaces;
		return formatCurrency(value, locale, currency, currencyCode, digitsInfo);
	}
}
