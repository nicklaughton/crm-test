// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';

import { FormControl } from '@angular/forms';

import { Subscription } from 'rxjs';
import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

import { getCurrencySymbol } from '@angular/common';

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
    selector: 'apex-currency-field',
    templateUrl: './apex-currency-field.component.html',
    styleUrls: ['./apex-currency-field.component.scss'],
})
export class ApexCurrencyFieldComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.setup();
        }
    }

    @Input()
    label: string;

    @Input()
    noPadding: boolean;

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

    currencyControl: FormControl;

    options: any;

    @Input()
    changedDebounce: number;

    _subscriptions: Subscription[];

    @Input()
    floatLabel: string;

    @Output() changed: EventEmitter<number> = new EventEmitter(true);

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

        this.setup();
        this.setDisabled();
        this.handleDisabledChange();
        this._isInitComplete = true;
    }

    setup() {
        let debug = Debug('ApexCurrencyField:setup');

        if (!this.control) return;
        this.unsubscribe();

        this.currencyControl = new FormControl();
        this.currencyControl.setValue(this.control.value || '');

        this._subscriptions.push(
            this.control.valueChanges.subscribe((value) => {
                debug('control value change', value, typeof value);
                if (value === undefined || value === null) {
                    if (this.currencyControl.value) {
                        debug('reset');
                        this.currencyControl.reset();
                    }
                } else {
                    let stringValue = String(value);
                    debug('stringValue', stringValue);
                    if (this.currencyControl.value !== stringValue) {
                        debug('set value');
                        this.currencyControl.setValue(stringValue, {
                            emitEvent: false,
                        });
                    }
                }
            })
        );

        const valueChanges =
            this.apexDynamicComponentsService.getValueChangesObservable(
                this.currencyControl,
                this.changedDebounce
            );

        this._subscriptions.push(
            valueChanges.subscribe((value) => {
                debug('currency control value', value, typeof value);
                debug(
                    'this.control.value',
                    this.control.value,
                    typeof this.control.value
                );
                if (!value) {
                    if (this.control.value) {
                        debug('reset');
                        this.control.reset();
                        this.control.markAsDirty();
                    }
                } else {
                    let numberValue = Number(value);
                    debug('numberValue', numberValue);
                    if (this.control.value !== numberValue) {
                        debug('set value');
                        this.control.setValue(numberValue);
                        this.control.markAsDirty();
                    }
                }
                this.changed.emit(this.control.value);
            })
        );

        const getSeparator = (partType) => {
            const testValue = 123456789.098765;
            return Intl.NumberFormat(
                this.apexDynamicComponentsService.currencyLocale,
                {
                    style: 'currency',
                    currency: this.apexDynamicComponentsService.currencyCode,
                }
            )
                .formatToParts(testValue)
                .find((part) => part.type === partType).value;
        };

        this.options = {
            align: 'left',
            prefix:
                getCurrencySymbol(
                    this.apexDynamicComponentsService.currencyCode,
                    'narrow'
                ) + ' ',
            thousands: getSeparator('group'),
            decimal: getSeparator('decimal'),
            precision: this.apexDynamicComponentsService.currencyDecimalPlaces,
        };

        this.setDisabled();
    }

    errorMessage(): string {
        let debug = Debug('ApexCurrencyField:errorMessage');

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

    setDisabled() {
        let debug = Debug('ApexCurrencyField:setDisabled');

        debug('this.disabled', this.disabled);

        if (this.currencyControl) {
            if (this.disabled === true) {
                debug('disable');
                this.currencyControl.disable();
            } else if (this.disabled === false) {
                debug('enable');
                this.currencyControl.enable();
            }
        }
    }

    onBlur(event: any) {
        let debug = Debug('ApexCurrencyField:onBlur');

        debug('event.target.value', event.target.value);
        debug('this.currencyControl.value', this.currencyControl.value);
        if (this.currencyControl.value)
            this.currencyControl.setValue(
                parseFloat(this.control.value).toFixed(2)
            );
        this.viewContainerRef.element.nativeElement.dispatchEvent(
            new Event('blur')
        );
    }

    unsubscribe() {
        if (this._subscriptions)
            this._subscriptions.forEach((sub) => sub.unsubscribe());
        this._subscriptions = [];
    }

    handleDisabledChange() {
        this.apexDynamicComponentsService.handleDisplayControlDisabledChange(
            this.control,
            this.currencyControl
        );
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
