// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';
import * as changeCase from 'change-case';

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

import { ApexDesignerBusinessObjectsService } from '../../shared/services/apex-designer-business-objects.service';

import { Validators } from '@angular/forms';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-field',
    templateUrl: './apex-field.component.html',
    styleUrls: ['./apex-field.component.scss'],
})
export class ApexFieldComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    private _control: ApexFormControl;

    @Input()
    get control(): ApexFormControl {
        return this._control;
    }

    set control(value: ApexFormControl) {
        if (value != this._control) {
            this._control = value;
            if (this._isInitComplete) this.chooseField();
        }
    }

    @Input()
    noPadding: boolean;

    @Input()
    label: string;

    private _disabled: boolean;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value != this._disabled) {
            this._disabled = value;
            if (this._isInitComplete) this.handleDisabledChange();
        }
    }

    @Input()
    required: boolean;

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

        private componentFactoryResolver: ComponentFactoryResolver,
        private apexDesignerBusinessObjectsService: ApexDesignerBusinessObjectsService
    ) {}

    @ViewChild('container', { read: ViewContainerRef, static: false } as any)
    container: ViewContainerRef;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.chooseField();
        this._isInitComplete = true;
    }

    async chooseField() {
        let debug = Debug('ApexField:chooseField');

        debug('this.control', this.control);
        if (this.control) {
            setTimeout(async () => {
                debug('this.control', this.control);
                debug('this.container', this.container);
                this.container.clear();

                // First try <businessObjectName><propertyName>Field

                debug(
                    'this.control.businessObjectName',
                    this.control.businessObjectName
                );
                debug('this.control.name', this.control.name);
                let userInterfaceName =
                    this.control.businessObjectName +
                    changeCase.pascalCase(this.control.name) +
                    'Field';
                debug('userInterfaceName', userInterfaceName);

                let userInterface =
                    await this.apexDesignerUserInterfacesService.byName(
                        userInterfaceName
                    );
                debug('userInterface', userInterface);

                let businessObjectName;

                if (!userInterface) {
                    // Second try <propertyName>Field
                    userInterfaceName =
                        changeCase.pascalCase(this.control.name) + 'Field';
                    debug('userInterfaceName', userInterfaceName);

                    userInterface =
                        await this.apexDesignerUserInterfacesService.byName(
                            userInterfaceName
                        );
                    debug('userInterface', userInterface);

                    if (!userInterface) {
                        // Finally use property type
                        debug('this.control.typeName', this.control.typeName);
                        if (this.control.typeName == 'number') {
                            userInterface =
                                await this.apexDesignerUserInterfacesService.byName(
                                    'ApexNumberField'
                                );
                        } else if (this.control.typeName == 'boolean') {
                            userInterface =
                                await this.apexDesignerUserInterfacesService.byName(
                                    'ApexBooleanField'
                                );
                        } else if (this.control.typeName == 'DateWithoutTime') {
                            userInterface =
                                await this.apexDesignerUserInterfacesService.byName(
                                    'ApexDateField'
                                );
                        } else if (this.control.typeName == 'Date') {
                            userInterface =
                                await this.apexDesignerUserInterfacesService.byName(
                                    'ApexDateTimeField'
                                );
                        } else if (
                            this.control.typeName == 'DateWithFixedTimezone'
                        ) {
                            userInterface =
                                await this.apexDesignerUserInterfacesService.byName(
                                    'ApexDateWithFixedTimezoneField'
                                );
                        } else if (this.control.typeName == 'Integer') {
                            userInterface =
                                await this.apexDesignerUserInterfacesService.byName(
                                    'ApexIntegerField'
                                );
                        } else if (this.control.typeName == 'MultilineString') {
                            userInterface =
                                await this.apexDesignerUserInterfacesService.byName(
                                    'ApexMultilineField'
                                );
                        } else if (this.control.typeName == 'Currency') {
                            userInterface =
                                await this.apexDesignerUserInterfacesService.byName(
                                    'ApexCurrencyField'
                                );
                        } else {
                            debug(
                                'this.control.typeName',
                                this.control.typeName
                            );
                            let businessObject =
                                this.apexDesignerBusinessObjectsService[
                                    this.control.typeName
                                ];
                            debug('businessObject', businessObject);

                            businessObjectName = this.control.typeName;

                            if (businessObject && businessObject.validValues) {
                                userInterface =
                                    await this.apexDesignerUserInterfacesService.byName(
                                        'ApexSelectField'
                                    );
                            } else {
                                userInterface =
                                    await this.apexDesignerUserInterfacesService.byName(
                                        this.control.typeName + 'Field'
                                    );

                                if (userInterface) {
                                    businessObjectName = null;
                                } else if (
                                    businessObject &&
                                    businessObject.nativeType == 'number'
                                ) {
                                    userInterface =
                                        await this.apexDesignerUserInterfacesService.byName(
                                            'ApexNumberField'
                                        );
                                } else {
                                    userInterface =
                                        await this.apexDesignerUserInterfacesService.byName(
                                            'ApexTextField'
                                        );
                                }
                            }
                        }
                        debug('userInterface', userInterface);
                    }
                }

                debug('this.disabled', this.disabled);
                if (this.control && (this.disabled || this.control.isId)) {
                    this.control.disable();
                    debug('disabled');
                }
                if (this.control && this.required) {
                    this.control.setValidators([
                        this.control.validator,
                        Validators.required,
                    ]);
                }
                this.addField(
                    this.control,
                    userInterface,
                    this.label || this.control.displayName,
                    businessObjectName
                );
            }, 100);
        }
    }

    addField(
        control: any,
        userInterface: any,
        label: string,
        businessObjectName?: string
    ) {
        let debug = Debug('ApexField:addField');

        debug('control', control);
        debug('userInterface', userInterface);

        let classReference = userInterface.classReference;
        debug('classReference', classReference);

        let componentFactory =
            this.componentFactoryResolver.resolveComponentFactory(
                classReference
            );
        debug('componentFactory', componentFactory);

        let componentRef = this.container.createComponent(componentFactory);
        debug('componentRef', componentRef);

        componentRef['instance']['label'] = label;
        debug('this.noPadding', this.noPadding);
        componentRef['instance']['noPadding'] = this.noPadding;
        debug('this.disabled', this.disabled);
        componentRef['instance']['disabled'] = this.disabled;
        debug('this.required', this.required);
        componentRef['instance']['required'] = this.required;
        if (businessObjectName) {
            let baseType =
                this.apexDesignerBusinessObjectsService[businessObjectName];
            if (userInterface.name == 'ApexSelectField' && baseType) {
                componentRef['instance']['options'] = baseType.validValues;
                componentRef['instance']['displayPropertyName'] = 'displayName';
                componentRef['instance']['valuePropertyName'] = 'value';
            } else {
                componentRef['instance']['businessObjectName'] =
                    businessObjectName;
            }
        }

        if (control instanceof ApexFormControl) {
            componentRef['instance']['control'] = control;
        } else if (control && typeof control == 'object' && control.formGroup) {
            componentRef['instance']['object'] = control;
        } else {
            throw `unsupported control type`;
        }
    }

    handleDisabledChange() {
        let debug = Debug('ApexField:handleDisabledChange');

        debug('this.control', this.control);
        if (this.control) {
            debug('this.disabled', this.disabled);
            if (this.disabled) {
                this.control.enable();
                debug('enabled');
            } else {
                this.control.disable();
                debug('disabled');
            }
        }
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
