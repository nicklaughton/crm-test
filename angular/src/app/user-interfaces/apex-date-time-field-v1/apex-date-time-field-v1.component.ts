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
    selector: 'apex-date-time-field-v1',
    templateUrl: './apex-date-time-field-v1.component.html',
    styleUrls: ['./apex-date-time-field-v1.component.scss'],
})
export class ApexDateTimeFieldV1Component implements OnInit, OnDestroy {
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
    min: Date;

    @Input()
    max: Date;

    @Input()
    stepHour: number = 1;

    @Input()
    stepMinute: number = 5;

    defaultTime: number[];

    controlSubscription: any;

    valueSubscription: any;

    momentControl: FormControl;

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

        this.initialize();
        this._isInitComplete = true;
    }

    initialize() {
        let debug = Debug('ApexDateTimeFieldV1:initialize');

        debug('this.disabled', this.disabled);
        debug('this.control', this.control);

        this.momentControl = new FormControl();

        if (this.disabled === true) {
            debug('disable');
            this.momentControl.disable();
        } else if (this.disabled === false) {
            debug('enable');
            this.momentControl.enable();
        }

        this.controlToMomentControl();

        this.controlSubscription = this.control.valueChanges.subscribe(() => {
            this.controlToMomentControl();
        });

        this.valueSubscription = this.momentControl.valueChanges.subscribe(
            () => {
                this.momentControlToControl();
            }
        );

        let now = moment();
        debug('now.minutes', now.minutes);
        debug('this.stepMinute', this.stepMinute);
        now.minutes(
            Math.floor(now.minutes() / this.stepMinute) * this.stepMinute
        );
        now.seconds(0);
        this.defaultTime = [now.hours(), now.minutes(), now.seconds()];
        debug('this.defaultTime', this.defaultTime);
    }

    errorMessage(): string {
        let debug = Debug('ApexDateTimeFieldV1:errorMessage');

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
        let debug = Debug('ApexDateTimeFieldV1:controlToMomentControl');

        debug('this.control.value', this.control.value);

        let currentValue = this.momentControl.value
            ? this.momentControl.value.toISOString()
            : undefined;
        debug('currentValue', currentValue);

        if (this.control.value) {
            let controlIsoString = this.control.value.toIsoString
                ? this.control.value.toIsoString()
                : this.control.value;
            if (
                !currentValue ||
                currentValue !== this.control.value.toISOString()
            ) {
                debug('set value');
                this.momentControl.setValue(moment(this.control.value));
            }
        } else {
            if (this.momentControl.value) {
                debug('reset');
                this.momentControl.reset();
            }
        }
    }

    momentControlToControl() {
        let debug = Debug('ApexDateTimeFieldV1:momentControlToControl');

        let value = this.momentControl.value;
        debug('value', value);
        if (value && value.toISOString) value = value.toISOString();
        debug('value', value);

        if (value) {
            if (
                !this.control.value ||
                !this.control.value.toISOString ||
                this.control.value.toISOString() !== value
            ) {
                debug('set value');
                this.control.setValue(this.momentControl.value.toDate());
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
        if (this.controlSubscription) this.controlSubscription.unsubscribe();

        if (this.valueSubscription) this.valueSubscription.unsubscribe();
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
