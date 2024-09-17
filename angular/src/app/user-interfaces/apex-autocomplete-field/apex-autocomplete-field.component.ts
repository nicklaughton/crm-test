// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';

import { FormControl } from '@angular/forms';
import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

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
    selector: 'apex-autocomplete-field',
    templateUrl: './apex-autocomplete-field.component.html',
    styleUrls: ['./apex-autocomplete-field.component.scss'],
})
export class ApexAutocompleteFieldComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.initializeFormControl();
        }
    }

    @Input()
    label: string;

    private _options: any;

    @Input()
    get options(): any {
        return this._options;
    }

    set options(value: any) {
        if (value != this._options) {
            this._options = value;
            if (this._isInitComplete) this.initializeFormControl();
        }
    }

    @Input()
    valuePropertyName: string = 'id';

    @Input()
    displayPropertyName: string = 'name';

    @Input()
    displayNameFunction: any;

    formControl: FormControl;

    filteredOptions: any[];

    subscriptions: any[];

    @Input()
    floatLabel: string;

    @Input()
    appearance: string;

    @Input()
    noPadding: boolean;

    @Input()
    clearable: boolean;

    @Input()
    placeholder: string;

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
    panelWidth: string;

    @Input()
    clearConfirmMessage: string;

    @Input()
    clearIcon: string;

    @Input()
    clearTooltip: string;

    previousValue: any;

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

    @ViewChild('input', { read: MatAutocompleteTrigger, static: false } as any)
    input: MatAutocompleteTrigger;

    @ViewChild('dropdownButton', { static: false } as any) dropdownButton;

    @ViewChild('auto', { static: false } as any) auto;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.subscriptions = [];

        this.previousValue = 'never_this_value';

        this.initializeFormControl();
        this.setDisabled();
        this.setDisplayNameFunction();
        this._isInitComplete = true;
    }

    async initializeFormControl() {
        let debug = Debug('ApexAutocompleteField:initializeFormControl');

        if (!this.formControl) this.formControl = new FormControl();
        else if (this.formControl.value && !this.control?.value)
            this.formControl.reset();
        debug('this.control', this.control);
        if (this.control && this.options) {
            debug('this.control.value', this.control.value);
            if (this.control.value) {
                let matchingOption = this.options.find(
                    (option: any) =>
                        option[this.valuePropertyName] == this.control.value
                );
                debug('matchingOption', matchingOption);
                if (matchingOption) {
                    this.formControl.setValue(matchingOption);
                }
            }
            debug('this.formControl', this.formControl);

            this.subscriptions.push(
                this.control.valueChanges.subscribe((newValue: any) => {
                    debug(
                        'newValue',
                        newValue,
                        newValue === this.previousValue
                    );
                    // added to avoid double change calls on reset
                    if (newValue === this.previousValue) return;
                    this.previousValue = newValue;
                    if (newValue === null || newValue === undefined) {
                        debug('reseting form control');
                        this.formControl.reset();
                        this.changed.emit(this.formControl.value);
                    } else {
                        let currentValue = this.formControl.value
                            ? this.formControl.value[this.valuePropertyName]
                            : undefined;
                        debug('currentValue', currentValue);
                        if (newValue !== currentValue) {
                            debug('setting form control');
                            this.formControl.setValue(
                                this.options.find(
                                    (option: any) =>
                                        option[this.valuePropertyName] ===
                                        newValue
                                )
                            );
                            this.changed.emit(this.formControl.value);
                        } else {
                            debug('no change');
                        }
                    }

                    debug('this.formControl.value', this.formControl.value);
                })
            );

            // Subscribe to changes
            this.subscriptions.push(
                this.formControl.valueChanges.subscribe(() => {
                    this.filterOptions();
                })
            );

            this.filterOptions();
        }
    }

    setDisabled() {
        let debug = Debug('ApexAutocompleteField:setDisabled');

        debug('this.disabled', this.disabled);
        debug('this.control', this.control);

        if (this.control) {
            if (this.disabled === true) {
                debug('disable');
                this.control.disable();
                this.formControl.disable();
            } else if (this.disabled === false) {
                debug('enable');
                this.control.enable();
                this.formControl.enable();
            }
        }
    }

    setDisplayNameFunction() {
        let debug = Debug('ApexAutocompleteField:setDisplayNameFunction');

        if (!this.displayNameFunction) {
            if (!this.displayPropertyName) {
                this.displayPropertyName =
                    this.options.getMetadata('properties')[0].name;
            }
            debug('this.displayPropertyName', this.displayPropertyName);

            this.displayNameFunction = (option: any) => {
                if (option) {
                    return option[this.displayPropertyName];
                }
            };
        }
    }

    errorMessage(): string {
        let debug = Debug('ApexAutocompleteField:errorMessage');

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

    filterOptions() {
        let debug = Debug('ApexAutocompleteField:filterOptions');

        let value = this.formControl.value;
        debug('value', value);

        if (value && typeof value == 'string') {
            this.filteredOptions = this.options.filter((option: any) => {
                const displayValue = this.displayNameFunction(option);
                if (!displayValue) return false;
                return displayValue.toLowerCase().includes(value.toLowerCase());
            });
            debug('this.filteredOptions', this.filteredOptions);
        } else if (this.clearable && value === '' && this.control.value)
            this.control.reset();
    }

    open() {
        this.filteredOptions = this.options;
        this.input.openPanel();
    }

    handleSelect() {
        let debug = Debug('ApexAutocompleteField:handleSelect');

        debug('this.formControl.value', this.formControl.value);
        const previousValue = this.control.value;
        const newValue = this.formControl.value[this.valuePropertyName];

        this.control.setValue(newValue);
        this.control.markAsDirty();
        debug('this.control.value', this.control.value);
        if (previousValue !== newValue) {
            this.changed.emit(newValue);
        }
    }

    unsubscribe() {
        for (let subscription of this.subscriptions || []) {
            subscription.unsubscribe();
        }
        this.subscriptions = [];
    }

    clear(event: any) {
        let debug = Debug('ApexAutocompleteField:clear');

        this.control.reset();
        debug('reset');
    }

    onBlur() {
        this.viewContainerRef.element.nativeElement.dispatchEvent(
            new Event('blur')
        );
    }

    focusAndOpen() {
        window['dropdownButton'] = this.dropdownButton;
        if (this.dropdownButton)
            this.dropdownButton._elementRef.nativeElement.click();
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
