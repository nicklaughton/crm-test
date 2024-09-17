// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
	ComponentFactoryResolver,
	ComponentRef,
	Directive,
	Input,
	OnChanges,
	OnInit,
	Type,
	ViewContainerRef
} from '@angular/core';

@Directive({
	selector: '[apex-dynamic-element]'
})
export class ApexDynamicElementDirective implements OnInit, OnChanges {
	@Input()
	configuration: any;

	@Input()
	data: any;

	component: ComponentRef<any>;

	constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) {
		console.log('ApexDynamicElementDirective constructor', this);
	}

	ngOnInit() {
		console.log('ApexDynamicElementDirective classReference', this.configuration.classReference);
		const component = this.resolver.resolveComponentFactory(this.configuration.classReference);
		console.log('ApexDynamicElementDirective component', component);
		this.component = this.container.createComponent(component);
		console.log('ApexDynamicElementDirective this.component', this.component);
		this.setProperties();
	}

	ngOnChanges() {
		console.log('ngOnChanges');
		if (this.component) {
			this.setProperties();
		}
	}

	setProperties() {
		for (let name in this.configuration) {
			if (name != 'classReference' && name != 'className') {
				console.log('name', name);

				let bindingType = 'value';
				if (name.indexOf('[(') == 0) bindingType = 'binding';

				console.log('bindingType', bindingType);

				if (bindingType == 'value') {
					this.component.instance[name] = this.configuration[name];
				} else if (bindingType == 'binding') {
					let levels = this.configuration[name].split('.');
					let property = levels.pop();
					let object = this.data;
					for (let i = 0; i < levels.length; i++) {
						if (!object[levels[i]]) object[levels[i]] = {};
						object = object[levels[i]];
					}

					console.log('object', object);
					console.log('property', property);

					let attributeCore = name.substring(2, name.length - 2);
					this.component.instance[attributeCore] = object[property];
					this.component.instance[attributeCore + 'Change'].subscribe((res) => {
						console.log('updated res', res);
						object[property] = res;
					});
				}
			}
		}
	}
}
