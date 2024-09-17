// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppModule } from '../src/app/app.module';
import { APP_BASE_HREF } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { ApexDesignerEditService } from '../src/app/shared/services/apex-designer-edit.service';
import { Observable } from 'rxjs';
import { axe, toHaveNoViolations } from 'jasmine-axe';
import { first } from 'rxjs';
let fixture;

export function initialize(componentOrServiceClass, type?: 'Component' | 'Service') {
	const declarations = type != 'Service' ? [componentOrServiceClass] : [];
	const providers = [{ provide: APP_BASE_HREF, useValue: '/' }];

	if (type == 'Service') providers.push(componentOrServiceClass);

	const testingModule = TestBed.configureTestingModule({
		imports: [AppModule],
		declarations,
		providers
	});
	if (type != 'Service') testingModule.compileComponents();

	TestBed.overrideProvider(ApexDesignerEditService, {
		useValue: { registerComponentInstance: () => {}, unregisterComponentInstance: () => {} }
	});
	jasmine.addMatchers(toHaveNoViolations);
}
export function initializeService(ServiceClass) {
	initialize(ServiceClass, 'Service');
}
export function getFixture<T>(componentClass) {
	fixture = TestBed.createComponent<T>(componentClass);
	return fixture;
}
export function queryElement(query: string): HTMLElement {
	return fixture.nativeElement.querySelector(query);
}
export function expectText(query: string, text: string) {
	const element = queryElement(query);
	expect(element.textContent).toEqual(text);
}
export function expectNext(subscribable: EventEmitter<any> | Observable<any>, value: any) {
	subscribable.pipe(first()).subscribe((nextValue) => {
		expect(nextValue).toBe(value);
	});
}
export function setProperty(propertyNameOrPath: string, value: any) {
	const propertyPath = propertyNameOrPath.split('.');
	let object = fixture.componentInstance;
	while (propertyPath.length > 1) {
		object = object[propertyPath.shift()];
	}
	object[propertyPath[0]] = value;
	fixture.detectChanges();
}
export function setInputValue(input: any, value: string) {
	input.value = value;
	input.dispatchEvent(new Event('input'));
}
export function initializeComponent() {
	fixture.detectChanges();
}
export async function expectToHaveNoViolations() {
	expect(await axe(fixture.nativeElement)).toHaveNoViolations();
}
