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
    selector: 'date-range-field',
    templateUrl: './date-range-field.component.html',
    styleUrls: ['./date-range-field.component.scss'],
})
export class DateRangeFieldComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    control: ApexFormControl;

    @Input()
    label: string;

    @Input()
    noPadding: boolean;

    subscriptions: any[];

    formControl: FormControl;

    @Input()
    min: string;

    minDate: any;

    @Input()
    max: string;

    maxDate: any;

    pauseUpdates: boolean;

    startDateControl: FormControl;

    endDateControl: FormControl;

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
        this._isInitComplete = true;
    }

    initialize() {
        let debug = Debug('DateRangeField:initialize');

        this.startDateControl = new FormControl();
        this.endDateControl = new FormControl();

        debug('this.min', this.min);
        if (this.min) {
            this.minDate = moment(this.min);
            debug('this.minDate', this.minDate);
        }

        debug('this.max', this.max);
        if (this.max) {
            this.maxDate = moment(this.max);
            debug('this.maxDate', this.maxDate);
        }

        this.apexDynamicComponentsService.handleDisplayControlDisabledChange(
            this.control,
            this.startDateControl
        );
        this.apexDynamicComponentsService.handleDisplayControlDisabledChange(
            this.control,
            this.endDateControl
        );

        if (this.control) {
            this.subscriptions.push(
                this.control.valueChanges.subscribe(() => {
                    this.updateStartAndEnd();
                })
            );
            this.updateStartAndEnd();
        }

        this.subscriptions.push(
            this.startDateControl.valueChanges.subscribe(() => {
                this.updateRangeControl();
            })
        );

        this.subscriptions.push(
            this.endDateControl.valueChanges.subscribe(() => {
                this.updateRangeControl();
            })
        );
    }

    unsubscribe() {
        for (let subscription of this.subscriptions || []) {
            subscription.unsubscribe();
        }
    }

    updateRangeControl() {
        let debug = Debug('DateRangeField:updateRangeControl');

        this.pauseUpdates = true;

        let start = this.startDateControl.value;
        debug('start', start);

        if (start) start = start.format('YYYY-MM-DD');
        debug('start', start);

        let end = this.endDateControl.value;
        debug('end', end);

        if (end) end = end.format('YYYY-MM-DD');
        debug('end', end);

        let newValue = (start || '') + ' - ' + (end || '');
        debug('newValue', newValue);

        if (newValue) {
            if (this.control.value !== newValue) {
                debug('set value');
                this.control.setValue(newValue);
                this.control.markAsDirty();
            }
        } else {
            if (this.control.value) {
                debug('reset');
                this.control.reset();
                this.control.markAsDirty();
            }
        }

        this.pauseUpdates = false;
    }

    updateStartAndEnd() {
        let debug = Debug('DateRangeField:updateStartAndEnd');

        debug('this.control.value', this.control.value);

        if (!this.pauseUpdates) {
            if (this.control.value) {
                let parts = this.control.value.split(' - ');
                debug('parts', parts);
                if (parts[0]) {
                    let newDate: any = moment(parts[0], 'YYYY-MM-DD', true);
                    if (newDate.isValid()) {
                        if (newDate != this.startDateControl.value) {
                            this.startDateControl.setValue(newDate);
                        }
                    }
                } else {
                    if (this.startDateControl.value) {
                        this.startDateControl.reset();
                    }
                }
                if (parts[1]) {
                    let newDate: any = moment(parts[0], 'YYYY-MM-DD', true);
                    if (newDate.isValid()) {
                        if (newDate != this.endDateControl.value) {
                            this.endDateControl.setValue(newDate);
                        }
                    }
                } else {
                    if (this.endDateControl.value) {
                        this.endDateControl.reset();
                    }
                }
            }
        }
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
