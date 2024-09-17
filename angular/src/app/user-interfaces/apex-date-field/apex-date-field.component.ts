// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';

import { FormControl } from '@angular/forms';
import * as moment from 'moment';

import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

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
    selector: 'apex-date-field',
    templateUrl: './apex-date-field.component.html',
    styleUrls: ['./apex-date-field.component.scss'],
})
export class ApexDateFieldComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.initialize();
        }
    }

    @Input()
    label: string;

    @Input()
    noPadding: boolean;

    private _min: string;

    @Input()
    get min(): string {
        return this._min;
    }

    set min(value: string) {
        if (value != this._min) {
            this._min = value;
            if (this._isInitComplete) this.setMin();
        }
    }

    private _max: string;

    @Input()
    get max(): string {
        return this._max;
    }

    set max(value: string) {
        if (value != this._max) {
            this._max = value;
            if (this._isInitComplete) this.setMax();
        }
    }

    momentControl: FormControl;

    minDate: any;

    maxDate: any;

    private _disabled: boolean;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value != this._disabled) {
            this._disabled = value;
            if (this._isInitComplete) this.initialize();
        }
    }

    @Input()
    dateClassFunction: any;

    subscriptions: any[];

    @Input()
    changedDebounce: number;

    @Input()
    floatLabel: string;

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

    @ViewChild('picker', { static: false } as any) picker;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.subscriptions = [];

        this.initialize();
        this.setMin();
        this.setMax();
        this._isInitComplete = true;
    }

    initialize() {
        let debug = Debug('ApexDateField:initialize');

        setTimeout(() => {
            debug('this.picker', this.picker);

            const adapter = this.picker._dateAdapter;
            debug('adapter', adapter);

            if (adapter.locale != navigator.language) {
                debug('navigator.language', navigator.language);
                adapter.setLocale(navigator.language);
            }
        });

        this.momentControl = new FormControl();

        debug('this.disabled', this.disabled);
        debug('this.control.disabled', this.control.disabled);
        if (this.disabled === true || this.control.disabled) {
            debug('disable');
            this.momentControl.disable();
            this.momentControl.updateValueAndValidity();
        } else if (this.disabled === false) {
            debug('enable');
            this.momentControl.enable();
            this.momentControl.updateValueAndValidity();
        }

        this.controlToMomentControl();

        this.subscriptions.push(
            this.control.valueChanges.subscribe((newValue) => {
                this.controlToMomentControl();
                this.changed.emit(newValue);
            })
        );

        const valueChanges =
            this.apexDynamicComponentsService.getValueChangesObservable(
                this.momentControl,
                this.changedDebounce
            );

        this.subscriptions.push(
            valueChanges.subscribe(() => {
                this.momentControlToControl();
            })
        );

        this.subscriptions.push(
            this.control.statusChanges.subscribe(() => {
                if (this.control.disabled && !this.momentControl.disabled) {
                    this.momentControl.disable();
                } else if (
                    this.control.enabled &&
                    !this.momentControl.enabled
                ) {
                    this.momentControl.enable();
                }
            })
        );
    }

    setMin() {
        let debug = Debug('ApexDateField:setMin');

        debug('this.min', this.min);
        if (this.min) {
            this.minDate = moment(this.min);
            debug('this.minDate', this.minDate);
        } else {
            this.minDate = null;
        }
    }

    setMax() {
        let debug = Debug('ApexDateField:setMax');

        debug('this.max', this.max);
        if (this.max) {
            this.maxDate = moment(this.max);
            debug('this.maxDate', this.maxDate);
        } else {
            this.maxDate = null;
        }
    }

    controlToMomentControl() {
        let debug = Debug('ApexDateField:controlToMomentControl');

        debug('this.control.value', this.control.value);

        let currentValue = this.momentControl.value
            ? this.momentControl.value.format('YYYY-MM-DD')
            : undefined;
        debug('currentValue', currentValue);

        if (this.control.value) {
            if (currentValue !== this.control.value) {
                let newValue = moment(this.control.value);
                debug('newValue', newValue);
                this.momentControl.setValue(newValue);
            }
        } else {
            if (currentValue) {
                debug('reset');
                this.momentControl.reset();
            }
        }
    }

    momentControlToControl() {
        let debug = Debug('ApexDateField:momentControlToControl');

        let value = this.momentControl.value;
        debug('value', value);
        if (value) {
            debug('typeof value', typeof value);
            debug('value.format', value.format);
            if (value) value = value.format('YYYY-MM-DD');
            debug('value', value);
        }

        if (value) {
            if (this.control.value !== value) {
                debug('set value');
                this.control.setValue(value);
                this.control.markAsDirty();
            }
        } else {
            if (this.control.value) {
                debug('reset');
                this.control.reset();
                this.control.markAsDirty();
            }
        }
    }

    unsubscribe() {
        if (this.subscriptions)
            while (this.subscriptions.length > 0) {
                this.subscriptions.pop().unsubscribe();
            }
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
