// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';
import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

import { Validators } from '@angular/forms';

import { ApexDesignerBusinessObjectsService } from '../../shared/services/apex-designer-business-objects.service';

import {
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
    selector: 'apex-radio-buttons-field',
    templateUrl: './apex-radio-buttons-field.component.html',
    styleUrls: ['./apex-radio-buttons-field.component.scss'],
})
export class ApexRadioButtonsFieldComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.setRequired();
        }
    }

    @Input()
    label: string;

    @Input()
    options: any[];

    @Input()
    valuePropertyName: string = 'id';

    @Input()
    displayPropertyName: string;

    @Input()
    displayNameFunction: any;

    private _required: boolean;

    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        if (value != this._required) {
            this._required = value;
            if (this._isInitComplete) this.setRequired();
        }
    }

    @Input()
    noPadding: boolean;

    valueFunction: any;

    @Output() changed: EventEmitter<any> = new EventEmitter(true);

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
        private apexDesignerBusinessObjectsService: ApexDesignerBusinessObjectsService
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.setFunctions();
        this.setRequired();
        this._isInitComplete = true;
    }

    setFunctions() {
        let debug = Debug('ApexRadioButtonsField:setFunctions');

        debug('this.options', this.options);
        if (!this.options) {
            debug('this.control.typeName', this.control.typeName);
            const businessObject =
                this.apexDesignerBusinessObjectsService[this.control.typeName];
            debug('businessObject', businessObject);

            if (businessObject?.validValues) {
                this.options = businessObject.validValues;
                this.displayPropertyName = 'displayName';
                this.valuePropertyName = 'value';
            }
        }

        debug('this.displayNameFunction', this.displayNameFunction);
        if (!this.displayNameFunction) {
            if (
                this.options?.length > 0 &&
                typeof this.options[0] == 'string'
            ) {
                this.displayNameFunction = (option: any) => {
                    return option;
                };
            } else if (this.displayPropertyName) {
                debug('this.displayPropertyName', this.displayPropertyName);

                this.displayNameFunction = (option: any) => {
                    if (option) {
                        return option[this.displayPropertyName];
                    }
                };
            }
        }

        debug('this.options.length', this.options.length);
        if (this.options?.length > 0 && typeof this.options[0] == 'string') {
            this.valueFunction = (option: any) => {
                return option;
            };
        } else {
            this.valueFunction = (option: any) => {
                if (option) return option[this.valuePropertyName];
            };
        }
    }

    setRequired() {
        let debug = Debug('ApexRadioButtonsField:setRequired');

        debug('this.control', this.control);
        debug('this.options', this.options);
        debug('this.valuePropertyName', this.valuePropertyName);
        debug('this.displayPropertyName', this.displayPropertyName);

        debug('this.required', this.required);

        if (this.required) {
            this.control.setValidators(Validators.required);
        }
    }

    handleChange(newValue: any) {
        let debug = Debug('ApexRadioButtonsField:handleChange');

        debug('newValue', newValue);
        this.control.setValue(newValue);
        this.changed.emit(newValue);
        this.control.markAsDirty();
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
