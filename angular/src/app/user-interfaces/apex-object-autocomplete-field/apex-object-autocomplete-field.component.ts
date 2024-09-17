// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';

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
    selector: 'apex-object-autocomplete-field',
    templateUrl: './apex-object-autocomplete-field.component.html',
    styleUrls: ['./apex-object-autocomplete-field.component.scss'],
})
export class ApexObjectAutocompleteFieldComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    private _object: any;

    @Input()
    get object(): any {
        return this._object;
    }

    set object(value: any) {
        if (value != this._object) {
            this._object = value;
            if (this._isInitComplete) this.initializeOptions();
        }
    }

    @Input()
    label: string;

    private _filter: any = {};

    @Input()
    get filter(): any {
        return this._filter;
    }

    set filter(value: any) {
        if (value != this._filter) {
            this._filter = value;
            if (this._isInitComplete) this.initializeOptions();
        }
    }

    @Input()
    displayNameFunction: any;

    options: ApexDataArray;

    formControl: FormControl;

    private _where: any;

    get where(): any {
        return this._where;
    }

    set where(value: any) {
        if (value != this._where) {
            this._where = value;
            if (this._isInitComplete) this.getOptions();
        }
    }

    @Input()
    appearance: string;

    @Input()
    floatLabel: string;

    @Input()
    noPadding: boolean;

    displayNameProperty: string;

    private _disabled: boolean;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value != this._disabled) {
            this._disabled = value;
            if (this._isInitComplete) this.enableOrDisable();
        }
    }

    @Input()
    wherePropertiesCsv: string;

    @Input()
    panelWidth: string;

    @Input()
    searchStringFunction: any;

    @Output() objectChange: EventEmitter<any> = new EventEmitter(true);

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

    @ViewChild('auto', { static: false } as any) auto;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.where = {};

        this.setDisplayNameFunction();
        this.initializeOptions();
        this.initializeFormControl();
        this.enableOrDisable();
        this._isInitComplete = true;
    }

    setDisplayNameFunction() {
        let debug = Debug('ApexObjectAutocompleteField:setDisplayNameFunction');

        if (!this.displayNameFunction) {
            if (!this.displayNameProperty) {
                this.displayNameProperty = this.getDisplayNameProperty();
            }
            debug('this.displayNameProperty', this.displayNameProperty);
            this.displayNameFunction = (option: any) => {
                if (option) {
                    return option[this.displayNameProperty];
                }
            };
        }
    }

    async initializeOptions() {
        let debug = Debug('ApexObjectAutocompleteField:initializeOptions');

        debug('this.object', this.object);

        let arrayClass = this.object.getMetadata('arrayClass');
        debug('arrayClass', arrayClass);

        debug('this.filter', this.filter);
        let arrayConfig = JSON.parse(JSON.stringify(this.filter));

        arrayConfig.http = this.httpClient;
        arrayConfig.read = 'On Demand';
        arrayConfig.save = 'Never';
        arrayConfig.limit = 20;

        debug('arrayConfig', arrayConfig);
        this.options = new arrayClass(arrayConfig);
        debug('this.options', this.options);
    }

    async initializeFormControl() {
        let debug = Debug('ApexObjectAutocompleteField:initializeFormControl');

        if (!this.formControl) {
            this.formControl = new FormControl();
            this.enableOrDisable();
        }

        if (this.object.id) {
            this.formControl.setValue(this.object);
            // delay to trigger the "where" change detector to read the option
            setTimeout(() => {
                this.where = {
                    id: this.object.id,
                };
            });
        }
        debug('this.formControl', this.formControl);

        // Subscribe to changes
        this.formControl.valueChanges.subscribe(() => {
            this.filterOptions();
        });

        this.filterOptions();
    }

    async getOptions() {
        let debug = Debug('ApexObjectAutocompleteField:getOptions');

        let mergedWhere = {};

        debug('this.filter', this.filter);
        if (this.filter && this.filter.where) {
            mergedWhere = JSON.parse(JSON.stringify(this.filter.where));
        }

        debug('this.where', this.where);
        for (let name in this.where) {
            mergedWhere[name] = this.where[name];
        }

        debug('mergedWhere', mergedWhere);
        this.options.setOption('where', mergedWhere);

        await this.options.read();
        debug('this.options', this.options);

        // if there is an initial value and we read the option for it, set the value to the option
        // to ensure the display name appears appropriately
        if (
            this.options.length == 1 &&
            this.formControl.value &&
            this.formControl.value.id == this.options[0].id &&
            this.formControl.value != this.options[0]
        )
            this.formControl.setValue(this.options[0]);
    }

    filterOptions() {
        let debug = Debug('ApexObjectAutocompleteField:filterOptions');

        let value = this.formControl.value;
        debug('value', value);

        if (value && typeof value == 'string') {
            debug('this.wherePropertiesCsv', this.wherePropertiesCsv);
            debug('this.displayNameProperty', this.displayNameProperty);
            const propertyNames = this.wherePropertiesCsv
                ? this.wherePropertiesCsv.split(',')
                : [this.displayNameProperty || this.getDisplayNameProperty()];
            debug('propertyNames', propertyNames);

            let newWhere = {
                or: [],
            };
            let searchString = value.toLowerCase();
            if (this.searchStringFunction)
                searchString = this.searchStringFunction(searchString);
            for (const propertyName of propertyNames) {
                newWhere.or.push({
                    [propertyName]: {
                        ilike: '%' + searchString + '%',
                    },
                });
            }
            this.where = newWhere;
            debug('this.where', this.where);
        }
    }

    open() {
        let debug = Debug('ApexObjectAutocompleteField:open');

        this.where = {};
        debug('this.where', this.where);
        this.input.openPanel();
    }

    handleSelect() {
        let debug = Debug('ApexObjectAutocompleteField:handleSelect');

        debug('this.formControl.value', this.formControl.value);
        this.object = this.formControl.value;
        debug('this.object', this.object);
        this.objectChange.emit(this.object);
        debug('emitted');
    }

    reset() {
        this.formControl.reset();
    }

    enableOrDisable() {
        let debug = Debug('ApexObjectAutocompleteField:enableOrDisable');

        debug('this.disabled', this.disabled);
        if (!this.formControl) return;
        if (this.disabled) {
            this.formControl.disable();
        } else {
            this.formControl.enable();
        }
    }

    onBlur() {
        this.viewContainerRef.element.nativeElement.dispatchEvent(
            new Event('blur')
        );
    }

    getDisplayNameProperty(): string {
        let debug = Debug('ApexObjectAutocompleteField:getDisplayNameProperty');

        let properties = this.object.getMetadata('properties');
        debug('properties', properties);
        let property = properties.find((property: any) => !property.isHidden);
        debug('property', property);
        if (!property) {
            property = properties[0];
            debug('fallback property', property);
        }
        return property.name;
    }

    onFocus() {
        this.viewContainerRef.element.nativeElement.dispatchEvent(
            new Event('focus')
        );
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
