// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';

import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import * as dayjs from 'dayjs';

import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';

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
    selector: 'apex-date-time-field',
    templateUrl: './apex-date-time-field.component.html',
    styleUrls: ['./apex-date-time-field.component.scss'],
})
export class ApexDateTimeFieldComponent implements OnInit, OnDestroy {
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
    placeholder: string;

    @Input()
    minDate: Date;

    @Input()
    maxDate: Date;

    momentControl: FormControl;

    @Input()
    required: boolean;

    min: any;

    max: any;

    subscriptions: any[];

    timeControl: FormControl;

    timeOptions: string[];

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

    @ViewChildren('autoOption', { static: false } as any) autoOption;

    @ViewChild('panel', { static: false } as any) panel;

    @ViewChild('picker', { static: false } as any) picker;

    @ViewChild('auto', { static: false } as any) auto;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.subscriptions = [];

        this.initialize();
        this._isInitComplete = true;
    }

    initialize() {
        let debug = Debug('ApexDateTimeField:initialize');

        debug('this.disabled', this.disabled);
        debug('this.control', this.control);

        this.momentControl = new FormControl();
        this.timeControl = new FormControl();

        this.setTimeOptions();

        if (this.minDate) this.min = moment(this.minDate);
        if (this.maxDate) this.max = moment(this.maxDate);

        if (this.disabled === true || this.control?.disabled) {
            debug('disable');
            this.momentControl.disable();
            this.timeControl.disable();
        } else if (this.disabled === false) {
            debug('enable');
            this.momentControl.enable();
            this.timeControl.enable();
        }

        this.controlToMomentControl();

        this.subscriptions.push(
            this.control.valueChanges.subscribe(() => {
                this.controlToMomentControl();
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
                if (this.control.disabled && !this.timeControl.disabled) {
                    this.timeControl.disable();
                } else if (this.control.enabled && !this.timeControl.enabled) {
                    this.timeControl.enable();
                }
            })
        );

        this.subscriptions.push(
            this.momentControl.valueChanges.subscribe(() => {
                debug('this.momentControl.value', this.momentControl.value);
                this.momentControlToControl();
            })
        );

        this.subscriptions.push(
            this.timeControl.valueChanges.subscribe((value) => {
                debug('this.timeControl.value', this.timeControl.value);
                this.filterTimeOptions(value);
                this.momentControlToControl();
            })
        );
    }

    errorMessage(): string {
        let debug = Debug('ApexDateTimeField:errorMessage');

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

    openPicker(event: any) {
        event.stopPropagation();
        this.picker.open();
    }

    controlToMomentControl() {
        let debug = Debug('ApexDateTimeField:controlToMomentControl');

        debug('this.control.value', this.control.value);

        let currentValue = this.momentControl.value
            ? this.momentControl.value.toISOString()
            : undefined;
        debug('currentValue', currentValue);

        if (this.control.value) {
            if (
                !currentValue ||
                currentValue !== this.control.value.toISOString()
            ) {
                debug('set value');
                this.momentControl.setValue(moment(this.control.value), {
                    emitEvent: false,
                });
                this.timeControl.setValue(
                    dayjs(this.control.value).format('h:mma')
                );
            }
        } else {
            if (this.momentControl.value) {
                debug('reset');
                this.momentControl.reset();
            }
            if (this.timeControl.value) {
                debug('reset');
                this.timeControl.reset();
            }
        }
    }

    momentControlToControl() {
        let debug = Debug('ApexDateTimeField:momentControlToControl');

        let dateValue = this.momentControl.value;
        debug('dateValue', dateValue);
        let timeValue = this.timeControl.value;
        debug('timeValue', timeValue);

        var customParseFormat = require('dayjs/plugin/customParseFormat');
        dayjs.extend(customParseFormat);
        if (dateValue && dateValue.toISOString)
            dateValue = dateValue.toISOString();
        if (timeValue) timeValue = dayjs(timeValue, 'h:mma');

        if (dateValue && timeValue) {
            let value = new Date(dateValue);
            value = new Date(value.setHours(timeValue.hour()));
            value = new Date(value.setMinutes(timeValue.minute()));
            debug('value', value);
            this.control.setValue(value);
            this.control.markAsDirty();
        } else if (dateValue) {
            this.timeControl.setValue(dayjs(new Date()).format('h:mma'));
        } else {
            if (this.control.value) {
                debug('reset');
                this.control.reset();
                this.control.markAsDirty();
            }
        }
    }

    setTimeOptions() {
        const options = [];

        for (let i = 0; i <= 1; i++) {
            for (let j = 0; j <= 11; j++) {
                for (
                    let k = 0;
                    k < 60;
                    k += this.apexDynamicComponentsService.minuteStep
                ) {
                    options.push(
                        (j === 0 ? '12' : j) +
                            ':' +
                            (k === 0 ? '00' : k) +
                            (i === 0 ? 'am' : 'pm')
                    );
                }
            }
        }

        this.timeOptions = options;
    }

    filterTimeOptions(value?: string) {
        value =
            value ||
            this.timeControl?.value ||
            dayjs(new Date()).format('h:mma');

        let str = '';

        let options = this.timeOptions;
        if (value.includes('a'))
            options = options.filter((element) => element.endsWith('am'));
        else options = options.filter((element) => element.endsWith('pm'));
        for (let letter of value) {
            str += letter;
            const newOptions = options.filter((element) =>
                value === '1'
                    ? !element.startsWith('12')
                    : element.startsWith(str)
            );
            if (newOptions.length) options = newOptions;
            else break;
        }

        const index = this.timeOptions.findIndex(
            (element) => element === value || element === options[0]
        );

        setTimeout(() => {
            if (index > -1 && this.panel.isOpen)
                this.auto.panel.nativeElement.scrollTop = 48 * index - 96;
        }, 1);
    }

    onTimePickerClick() {
        if (!this.timeControl.value) {
            this.picker.open();
        }
    }

    unsubscribe() {
        if (this.subscriptions)
            while (this.subscriptions.length > 0) {
                this.subscriptions.pop().unsubscribe();
            }
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
