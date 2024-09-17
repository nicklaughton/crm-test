// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';
import * as changeCase from 'change-case';

import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

import {
    ComponentFactoryResolver,
    Component,
    Input,
    Output,
    OnInit,
    OnDestroy,
    EventEmitter,
    ViewChild,
    ViewChildren,
    ViewContainerRef,
    Inject,
    forwardRef,
} from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-add-field',
    templateUrl: './apex-add-field.component.html',
    styleUrls: ['./apex-add-field.component.scss'],
})
export class ApexAddFieldComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    private _array: ApexDataArray;

    @Input()
    get array(): ApexDataArray {
        return this._array;
    }

    set array(value: ApexDataArray) {
        if (value != this._array) {
            this._array = value;
            if (this._isInitComplete) this.setInputs();
        }
    }

    private _label: string;

    @Input()
    get label(): string {
        return this._label;
    }

    set label(value: string) {
        if (value != this._label) {
            this._label = value;
            if (this._isInitComplete) this.setInputs();
        }
    }

    newName: string;

    private _defaults: any;

    @Input()
    get defaults(): any {
        return this._defaults;
    }

    set defaults(value: any) {
        if (value != this._defaults) {
            this._defaults = value;
            if (this._isInitComplete) this.setInputs();
        }
    }

    private _nameCase: string;

    @Input()
    get nameCase(): string {
        return this._nameCase;
    }

    set nameCase(value: string) {
        if (value != this._nameCase) {
            this._nameCase = value;
            if (this._isInitComplete) this.setInputs();
        }
    }

    subscription: any;

    componentRef: any;

    useComponent: boolean;

    @Input()
    skipIndent: boolean;

    @Output() added: EventEmitter<any> = new EventEmitter(true);

    /******************************************************/

    constructor(
        private httpClient: HttpClient,
        public route: ActivatedRoute,
        public router: Router,
        public translate: TranslateService,
        private apexDesignerEditService: ApexDesignerEditService,
        private viewContainerRef: ViewContainerRef,
        @Inject(forwardRef(() => ApexDesignerUserInterfacesService))
        public apexDesignerUserInterfacesService: any,

        public apexDynamicComponentsService: ApexDynamicComponentsService,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {}

    @ViewChild('container', { read: ViewContainerRef, static: false } as any)
    container: ViewContainerRef;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.setComponent();
        this._isInitComplete = true;
    }

    async setComponent() {
        let debug = Debug('ApexAddField:setComponent');

        debug('this.array', this.array);
        setTimeout(async () => {
            let userInterfaceName =
                'Add' + this.array.getMetadata('name') + 'Field';
            debug('userInterfaceName', userInterfaceName);

            let userInterface =
                await this.apexDesignerUserInterfacesService.byName(
                    userInterfaceName
                );
            debug('userInterface', userInterface);

            if (userInterface) {
                let classReference = userInterface.classReference;
                debug('classReference', classReference);

                let componentFactory =
                    this.componentFactoryResolver.resolveComponentFactory(
                        classReference
                    );
                debug('componentFactory', componentFactory);

                this.componentRef =
                    this.container.createComponent(componentFactory);
                debug('this.componentRef', this.componentRef);

                this.setInputs();

                if (this.componentRef['instance']['added']) {
                    this.subscription = this.componentRef['instance'][
                        'added'
                    ].subscribe((newItem: any) => {
                        debug('newItem', newItem);
                        this.added.emit(newItem);
                    });
                } else {
                    console.error(
                        `${userInterfaceName} should have an added output.`
                    );
                }

                this.useComponent = true;
            } else {
                this.useComponent = false;
            }
        });
    }

    setInputs() {
        let debug = Debug('ApexAddField:setInputs');

        setTimeout(() => {
            if (this.componentRef) {
                debug('this.componentRef', this.componentRef);
                debug('this.array', this.array);
                this.componentRef['instance']['array'] = this.array;
                debug('this.label', this.label);
                this.componentRef['instance']['label'] = this.label;
                debug('this.defaults', this.defaults);
                this.componentRef['instance']['defaults'] = this.defaults;
                debug('this.nameCase', this.nameCase);
                this.componentRef['instance']['nameCase'] = this.nameCase;
            }
        });
    }

    async add() {
        let debug = Debug('ApexAddField:add');

        let properties = this.array.getMetadata('properties');
        let property = properties[0];
        if (property.isHidden || property.isId) property = properties[1];
        debug('property', property);

        let data = {};
        for (let name in this.defaults || {}) {
            data[name] = this.defaults[name];
        }

        if (this.nameCase && this.newName.toLowerCase() == this.newName) {
            this.newName = changeCase[this.nameCase](this.newName, {
                stripRegexp: /[^A-Z0-9\/.]/gi,
            });
        }
        data[property.name] = this.newName;

        debug('data', data);
        debug('this.array', this.array);

        let newItem = await this.array.add(data);
        debug('newItem.id', newItem.id);

        this.added.emit(newItem);

        this.newName = null;
    }

    unsubscribe() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
