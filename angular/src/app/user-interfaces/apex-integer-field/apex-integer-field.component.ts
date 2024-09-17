// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';
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
    selector: 'apex-integer-field',
    templateUrl: './apex-integer-field.component.html',
    styleUrls: ['./apex-integer-field.component.scss'],
})
export class ApexIntegerFieldComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.watchAndValidateValue();
        }
    }

    @Input()
    label: string;

    @Input()
    noPadding: boolean;

    subscription: any;

    private _disabled: boolean;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value != this._disabled) {
            this._disabled = value;
            if (this._isInitComplete) this.watchAndValidateValue();
        }
    }

    @Input()
    min: number;

    @Input()
    max: number;

    @Input()
    changedDebounce: number;

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

        this.watchAndValidateValue();
        this._isInitComplete = true;
    }

    watchAndValidateValue() {
        let debug = Debug('ApexIntegerField:watchAndValidateValue');

        if (this.control) {
            this.unsubscribe();

            if (this.max !== undefined) this.control.max = this.max;

            if (this.min !== undefined) this.control.min = this.min;

            debug('this.disabled', this.disabled);
            if (this.disabled === true) {
                debug('disable');
                this.control.disable();
            } else if (this.disabled === false) {
                debug('enable');
                this.control.enable();
            }

            const valueChanges =
                this.apexDynamicComponentsService.getValueChangesObservable(
                    this.control,
                    this.changedDebounce
                );

            this.subscription = valueChanges.subscribe((value: number) => {
                debug('value', value);
                if (
                    value !== undefined &&
                    value !== null &&
                    value !== Math.round(value)
                ) {
                    if (!this.control.errors?.notInteger) {
                        debug('set error');
                        this.control.setErrors({
                            notInteger: {
                                message:
                                    'Please enter a valid integer (no decimal places)',
                            },
                        });
                        debug('error set');
                        this.control.markAsTouched();
                        debug('marked');
                    } else {
                        debug('error already set');
                    }
                } else {
                    // this is only really necessary for when this.max or this.min is set
                    const max = this.max || this.control.max;
                    if (max === 0 || max) {
                        if (value > max && !this.control.errors?.max) {
                            this.control.setErrors({
                                max: {
                                    message: 'Must be at most ' + max,
                                },
                            });
                            this.control.markAsTouched();
                        }
                    }
                    const min = this.min || this.control.min;
                    if (min === 0 || min) {
                        if (value < min && !this.control.errors?.min) {
                            this.control.setErrors({
                                min: {
                                    message: 'Must be at least ' + min,
                                },
                            });
                            this.control.markAsTouched();
                        }
                    }
                }
            });
        }
    }

    errorMessage(): string {
        let debug = Debug('ApexIntegerField:errorMessage');

        debug('this.control.errors', this.control.errors);

        let messages = [];
        for (let name in this.control.errors) {
            let error = this.control.errors[name];
            debug('error', error);
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

        return messages.join(' ');
    }

    unsubscribe() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    onBlur() {
        this.viewContainerRef.element.nativeElement.dispatchEvent(
            new Event('blur')
        );
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
