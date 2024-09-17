// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';

import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import * as dayjs from 'dayjs';

import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';

import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

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
    selector: 'apex-date-with-fixed-timezone-field',
    templateUrl: './apex-date-with-fixed-timezone-field.component.html',
    styleUrls: ['./apex-date-with-fixed-timezone-field.component.scss'],
})
export class ApexDateWithFixedTimezoneFieldComponent
    implements OnInit, OnDestroy
{
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

    min: any;

    momentControl: FormControl;

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

    @ViewChild('input', { read: MatAutocompleteTrigger, static: false } as any)
    input: MatAutocompleteTrigger;

    @ViewChild('picker', { static: false } as any) picker;

    @ViewChild('panel', { static: false } as any) panel;

    @ViewChild('auto', { static: false } as any) auto;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.subscriptions = [];

        this.initialize();
        this._isInitComplete = true;
    }

    initialize() {
        let debug = Debug('ApexDateWithFixedTimezoneField:initialize');

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
        let debug = Debug('ApexDateWithFixedTimezoneField:errorMessage');

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
        let debug = Debug(
            'ApexDateWithFixedTimezoneField:controlToMomentControl'
        );

        debug('this.control.value', this.control.value);

        const utc = require('dayjs/plugin/utc');
        dayjs.extend(utc);

        const timezone = require('dayjs/plugin/timezone');
        dayjs.extend(timezone);

        if (this.control.value) {
            let controlValue = dayjs(this.control.value);
            debug('controlValue', controlValue);

            const momentInEventTimezone = moment(
                dayjs(controlValue)
                    ['tz'](this.apexDynamicComponentsService.fixedTimezone)
                    .format('YYYY-MM-DD HH:mm:ss.SSS')
            );
            debug('momentInEventTimezone', momentInEventTimezone);

            if (
                !this.momentControl.value ||
                !this.momentControl.value.isSame(momentInEventTimezone)
            ) {
                debug('updating');
                this.momentControl.setValue(momentInEventTimezone, {
                    emitEvent: false,
                });

                const timeValue = momentInEventTimezone.format('h:mma');
                debug('timeValue', timeValue);
                this.timeControl.setValue(timeValue, { emitEvent: false });
            }
        } else {
            if (this.momentControl.value) {
                debug('reset');
                this.momentControl.reset();
            }
        }
    }

    momentControlToControl() {
        let debug = Debug(
            'ApexDateWithFixedTimezoneField:momentControlToControl'
        );

        let dateMoment = this.momentControl.value;
        debug('dateMoment', dateMoment);

        let timeString = this.timeControl.value;
        debug('timeString', timeString);

        if (dateMoment && timeString) {
            let hour = Number(timeString.split(':')[0]);

            let minutes = timeString.split(':')[1];
            if (!minutes) minutes = '0';

            if (minutes.endsWith('am')) {
                if (hour == 12) hour = 0;
                minutes = minutes.split('am')[0];
            } else if (minutes.endsWith('pm')) {
                hour = hour + 12;
                if (hour == 24) hour = 12;
                minutes = minutes.split('pm')[0];
            }
            minutes = Number(minutes);
            debug('hour', hour);
            debug('minutes', minutes);

            if (!isNaN(hour)) {
                dateMoment.set('hour', hour);
            }
            if (!isNaN(minutes)) {
                dateMoment.set('minute', minutes);
            }

            let dateTimeString = dateMoment.format('YYYY-MM-DD HH:mm');
            debug('dateTimeString', dateTimeString);

            const utc = require('dayjs/plugin/utc');
            dayjs.extend(utc);

            const timezone = require('dayjs/plugin/timezone');
            dayjs.extend(timezone);

            debug(
                'this.apexDynamicComponentsService.fixedTimezone',
                this.apexDynamicComponentsService.fixedTimezone
            );

            let dateTimeValue = dayjs['tz'](
                dateTimeString,
                this.apexDynamicComponentsService.fixedTimezone
            ).toDate();
            debug('dateTimeValue', dateTimeValue);

            debug('this.control.value', this.control.value);
            if (this.control.value != dateTimeValue) {
                this.control.setValue(dateTimeValue);
                this.control.markAsDirty();
            }
        } else {
            debug('this.control.value', this.control.value);
            if (this.control.value) {
                this.control.reset();
                this.control.markAsDirty();
                debug('reset');
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
        let debug = Debug('ApexDateWithFixedTimezoneField:onTimePickerClick');

        if (!this.momentControl.value) {
            this.picker.open();
        } else {
            debug('this.input', this.input);
            this.input.openPanel();
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
