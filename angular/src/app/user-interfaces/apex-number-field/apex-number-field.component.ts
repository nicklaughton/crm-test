// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';

import { Subscription } from 'rxjs';

import { FormControl } from '@angular/forms';
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
    selector: 'apex-number-field',
    templateUrl: './apex-number-field.component.html',
    styleUrls: ['./apex-number-field.component.scss'],
})
export class ApexNumberFieldComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    control: ApexFormControl;

    @Input()
    label: string;

    @Input()
    noPadding: boolean;

    private _min: number;

    @Input()
    get min(): number {
        return this._min;
    }

    set min(value: number) {
        if (value != this._min) {
            this._min = value;
            if (this._isInitComplete) this.updateMinMaxValidator();
        }
    }

    private _max: number;

    @Input()
    get max(): number {
        return this._max;
    }

    set max(value: number) {
        if (value != this._max) {
            this._max = value;
            if (this._isInitComplete) this.updateMinMaxValidator();
        }
    }

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

    subscription: any;

    @Input()
    changedDebounce: number;

    _subscriptions: Subscription[];

    mask: string;

    maskControl: FormControl;

    thousandSeparator: string;

    @Input()
    showThousandsSeparator: boolean;

    @Input()
    fixedDecimalPlaces: number;

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

        public apexDynamicComponentsService: ApexDynamicComponentsService,
        private apexDesignerBusinessObjectsService: ApexDesignerBusinessObjectsService
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this._subscriptions = [];

        this.setup();
        this.setDisabled();
        this._isInitComplete = true;
    }

    setup() {
        let debug = Debug('ApexNumberField:setup');

        if (!this.control) return;
        this.unsubscribe();

        const businessObject =
            this.apexDesignerBusinessObjectsService[this.control.typeName];
        if (businessObject) {
            if (
                businessObject.hasThousandsSeparator &&
                this.showThousandsSeparator === undefined
            )
                this.showThousandsSeparator = true;
            if (
                businessObject.fixedDecimalPlaces &&
                this.fixedDecimalPlaces === undefined
            )
                this.fixedDecimalPlaces = businessObject.fixedDecimalPlaces;
        }

        this.maskControl = new FormControl();
        // this.maskControl.setValue(this.control.value || '');
        if (this.control.value !== null && this.control.value !== undefined) {
            this.maskControl.setValue(String(this.control.value));
        } else {
            this.maskControl.setValue('');
        }

        this.apexDynamicComponentsService.handleDisplayControlDisabledChange(
            this.control,
            this.maskControl
        );

        this._subscriptions.push(
            this.control.valueChanges.subscribe((value) => {
                window['control'] = this.control;
                debug('control value change', value, typeof value);
                if (value === null || value === undefined) return;

                // this is only really necessary for when this.max or this.min is set
                const max = this.max || this.control.max;
                if (max === 0 || max) {
                    if (value > max && !this.control.errors?.max) {
                        this.setError('max', 'Must be at most ' + max);
                    }
                }
                const min = this.min || this.control.min;
                if (min === 0 || min) {
                    if (value < min && !this.control.errors?.min) {
                        this.setError('min', 'Must be at least ' + min);
                    }
                }

                if (!this.control.errors || this.control.errors.length == 0) {
                    this.changed.emit(value);

                    if (value === undefined || value === null) {
                        if (this.maskControl.value) {
                            debug('reset');
                            this.maskControl.reset();
                        }
                    } else {
                        let stringValue = String(value);
                        debug('stringValue', stringValue);
                        if (this.maskControl.value !== stringValue) {
                            debug('set value');
                            this.maskControl.setValue(stringValue, {
                                emitEvent: false,
                            });
                        }
                    }
                }
            })
        );

        const valueChanges =
            this.apexDynamicComponentsService.getValueChangesObservable(
                this.maskControl,
                this.changedDebounce
            );

        this._subscriptions.push(
            valueChanges.subscribe((value) => {
                debug('mask control value', value, typeof value);
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
                    if (isNaN(numberValue)) {
                        this.setError('NaN', 'Invalid number');
                    } else if (this.control.value !== numberValue) {
                        debug('set value');
                        this.control.setValue(numberValue);
                        this.control.markAsDirty();
                    }
                }
                //this.changed.emit(this.control.value);
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
        const decimalSeparator = getSeparator('decimal');

        if (this.showThousandsSeparator) {
            this.mask = 'separator';
            this.thousandSeparator = getSeparator('group');
            if (this.fixedDecimalPlaces)
                this.mask += '.' + this.fixedDecimalPlaces;
        } /*else if (this.fixedDecimalPlaces) {
	const decimalPlaces =
		typeof this.fixedDecimalPlaces == 'string' ? Number(this.fixedDecimalPlaces) : this.fixedDecimalPlaces;
	//this.mask = `0*${decimalSeparator}` + new Array(decimalPlaces).fill(0, 0, decimalPlaces).join('');
} else {
	//this.mask = `0*${decimalSeparator}999999999999`;
}*/

        this.setDisabled();
        this.updateMinMaxValidator();
    }

    errorMessage(): string {
        let debug = Debug('ApexNumberField:errorMessage');

        debug('this.control.errors', this.control.errors);

        let messages = [];
        for (let name in this.control.errors) {
            let error = this.control.errors[name];
            if (name == 'required') {
                messages.push(
                    (this.label || this.control.displayName) + ' is required.'
                );
            } else if (name == 'min') {
                const min = this.min || this.control.min;
                messages.push('Must be at least ' + min);
            } else if (name == 'max') {
                const max = this.max || this.control.max;
                messages.push('Must be at most ' + max);
            } else if (error.message) {
                messages.push(error.message);
            }
        }
        debug('messages', messages);
        return messages.join(' ');
    }

    unsubscribe() {
        if (this._subscriptions)
            this._subscriptions.forEach((sub) => sub.unsubscribe());
        this._subscriptions = [];
    }

    updateMinMaxValidator() {
        if (this.max !== undefined) this.control.max = this.max;

        if (this.min !== undefined) this.control.min = this.min;
    }

    onBlur() {
        let debug = Debug('ApexNumberField:onBlur');

        if (this.maskControl.value && this.fixedDecimalPlaces) {
            debug('this.control.value', this.control.value);
            const controlValue =
                typeof this.control.value === 'string'
                    ? parseFloat(this.control.value)
                    : this.control.value;
            if (controlValue) {
                this.maskControl.setValue(
                    controlValue.toFixed(this.fixedDecimalPlaces)
                );
                this.maskControl.setErrors(this.control.errors);
            }
        }

        this.viewContainerRef.element.nativeElement.dispatchEvent(
            new Event('blur')
        );
    }

    setDisabled() {
        let debug = Debug('ApexNumberField:setDisabled');

        debug('this.disabled', this.disabled);

        if (this.maskControl) {
            if (this.disabled === true) {
                debug('disable');
                this.maskControl.disable();
            } else if (this.disabled === false) {
                debug('enable');
                this.maskControl.enable();
            }
        }
    }

    setError(errorName: string, errorMessage: string) {
        let debug = Debug('ApexNumberField:setError');

        debug('errorName', errorName);
        debug('errorMessage', errorMessage);
        this.control.setErrors({
            [errorName]: {
                message: errorMessage,
            },
        });
        this.maskControl.setErrors({
            [errorName]: {
                message: errorMessage,
            },
        });
        this.control.markAsTouched();
        this.maskControl.markAsTouched();
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
