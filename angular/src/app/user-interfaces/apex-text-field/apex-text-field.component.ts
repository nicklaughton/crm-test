// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';

type Integer = number;

import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
    selector: 'apex-text-field',
    templateUrl: './apex-text-field.component.html',
    styleUrls: ['./apex-text-field.component.scss'],
})
export class ApexTextFieldComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.init();
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

    @Input()
    placeholder: string;

    @Input()
    changedDebounce: Integer;

    _subscriptions: Subscription[];

    @Input()
    floatLabel: string;

    @Output() changed: EventEmitter<string> = new EventEmitter(true);

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

        this.setDisabled();
        this.init();
        this._isInitComplete = true;
    }

    setDisabled() {
        let debug = Debug('ApexTextField:setDisabled');

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

    errorMessage(): string {
        let debug = Debug('ApexTextField:errorMessage');

        debug('this.control.errors', this.control.errors);

        let messages = [];
        for (let name in this.control.errors) {
            debug('name', name);
            let error = this.control.errors[name];
            if (name == 'pattern') {
                messages.push(this.control.patternMessage);
            } else if (name == 'minlength') {
                messages.push(
                    (this.label || this.control.displayName) +
                        ' must be at least ' +
                        error.requiredLength +
                        ' characters long.'
                );
            } else if (name == 'maxlength') {
                messages.push(
                    (this.label || this.control.displayName) +
                        ' must be no more than ' +
                        error.requiredLength +
                        ' characters long.'
                );
            } else if (name == 'required') {
                messages.push(
                    (this.label || this.control.displayName) + ' is required.'
                );
            } else if (error.message) {
                messages.push(error.message);
            }
        }

        return messages.join(' ');
    }

    unload() {
        if (this._subscriptions)
            this._subscriptions.forEach((sub) => sub.unsubscribe());
        this._subscriptions = [];
    }

    init() {
        if (this.control) {
            this.unload();
            this.setDisabled();

            const valueChanges =
                this.apexDynamicComponentsService.getValueChangesObservable(
                    this.control,
                    this.changedDebounce
                );

            this._subscriptions.push(
                valueChanges.subscribe((newValue: string) => {
                    this.changed.emit(newValue);
                })
            );
        }
    }

    handleOnChange(value: string) {
        this.changed.emit(value);
        /*
if (this.changeDebounce) {
	if (this._debounceHandler) clearTimeout(this._debounceHandler);
	this._debounceHandler = setTimeout(() => {
		this.changed.emit(this._value);
		this._debounceHandler = null;
	}, this.changeDebounce);
} else this.changed.emit(this._value);
*/
    }

    onBlur() {
        this.viewContainerRef.element.nativeElement.dispatchEvent(
            new Event('blur')
        );
    }

    onFocus() {
        this.viewContainerRef.element.nativeElement.dispatchEvent(
            new Event('focus')
        );
    }

    ngOnDestroy() {
        this.unload();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
