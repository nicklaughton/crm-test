// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';

import { Subscription } from 'rxjs';
import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

import { Validators } from '@angular/forms';

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
    selector: 'apex-select-field',
    templateUrl: './apex-select-field.component.html',
    styleUrls: ['./apex-select-field.component.scss'],
})
export class ApexSelectFieldComponent implements OnInit, OnDestroy {
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

    @Input()
    clearable: boolean;

    _subscriptions: Subscription[];

    private _disabled: boolean;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value != this._disabled) {
            this._disabled = value;
            if (this._isInitComplete) this.setDisabled();
        }
    }

    @Input()
    floatLabel: string;

    @Input()
    placeholder: string;

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

        public apexDynamicComponentsService: ApexDynamicComponentsService
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this._subscriptions = [];

        this.init();
        this.setFunctions();
        this.setRequired();
        this.setDisabled();
        this._isInitComplete = true;
    }

    init() {
        let debug = Debug('ApexSelectField:init');

        debug('this.control', this.control);
        if (this.control) {
            this.unsubscribe();

            const valueChanges =
                this.apexDynamicComponentsService.getValueChangesObservable<any>(
                    this.control,
                    null
                );

            this._subscriptions.push(
                valueChanges.subscribe((newValue) => {
                    this.changed.emit(newValue);
                })
            );
        }
    }

    setFunctions() {
        let debug = Debug('ApexSelectField:setFunctions');

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

        debug('this.options.length', this.options?.length);
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
        let debug = Debug('ApexSelectField:setRequired');

        debug('this.control', this.control);
        debug('this.options', this.options);
        debug('this.valuePropertyName', this.valuePropertyName);
        debug('this.displayPropertyName', this.displayPropertyName);

        debug('this.required', this.required);

        if (this.required) {
            this.control.setValidators(Validators.required);
        }
    }

    errorMessage(): string {
        let debug = Debug('ApexSelectField:errorMessage');

        debug('this.control.errors', this.control.errors);

        let messages = [];
        for (let name in this.control.errors) {
            let error = this.control.errors[name];
            if (name == 'required') {
                messages.push(
                    (this.label || this.control.displayName) + ' is required.'
                );
            } else if (error.message) {
                messages.push(error.message);
            }
        }

        return messages.join(' ');
    }

    unsubscribe() {
        if (this._subscriptions)
            this._subscriptions.forEach((sub) => sub.unsubscribe());
        this._subscriptions = [];
    }

    setDisabled() {
        let debug = Debug('ApexSelectField:setDisabled');

        debug('this.disabled', this.disabled);
        debug('this.control', this.control);

        if (this.control) {
            if (this.disabled === true) {
                debug('disable');
                this.control.disable();
            } else if (this.disabled === false) {
                debug('enable');
                this.control.enable();
            }
        }
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
