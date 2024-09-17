// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';

import { ApexDataArray } from '../../shared/models/apex-data-array';

import { FormControl } from '@angular/forms';
import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

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
    selector: 'apex-belongs-to-field',
    templateUrl: './apex-belongs-to-field.component.html',
    styleUrls: ['./apex-belongs-to-field.component.scss'],
})
export class ApexBelongsToFieldComponent implements OnInit, OnDestroy {
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
    businessObjectName: string;

    @Input()
    label: string;

    @Input()
    noPadding: boolean;

    @Input()
    displayNameFunction: any;

    @Input()
    whereFilter: any = {};

    displayNameProperty: string;

    options: ApexDataArray;

    formControl: FormControl;

    idPropertyName: string;

    businessObject: any;

    subscriptions: any[];

    @Input()
    disabled: boolean;

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

    @ViewChild('input', { read: MatAutocompleteTrigger, static: false } as any)
    input: MatAutocompleteTrigger;

    @ViewChild('auto', { static: false } as any) auto;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.subscriptions = [];

        this.initialize();
        this._isInitComplete = true;
    }

    async initialize() {
        let debug = Debug('ApexBelongsToField:initialize');

        debug('this.formControl', this.formControl);
        if (!this.formControl) {
            this.formControl = new FormControl();
            debug('this.disabled', this.disabled);
            if (this.disabled) {
                this.formControl.disable();
            }
            debug('initialized this.formControl', this.formControl);
            this.subscriptions.push(
                this.formControl.valueChanges.subscribe(() => {
                    debug('value change');
                    this.filterOptions();
                })
            );
            debug('subscribed');
        }

        debug('this.businessObjectName', this.businessObjectName);
        if (this.businessObjectName) {
            debug('this.control', this.control);

            this.businessObject =
                this.apexDesignerBusinessObjectsService[
                    this.businessObjectName
                ];
            debug('this.businessObject', this.businessObject);

            let properties = this.businessObject.properties;
            debug('properties', properties);

            let property = properties.find(
                (property: any) => !property.isHidden
            );
            debug('property', property);

            if (!property) {
                property = properties[0];
                debug('fallback property', property);
            }
            this.displayNameProperty = property.name;
            debug('this.displayNameProperty', this.displayNameProperty);

            if (!this.displayNameFunction) {
                this.displayNameFunction = (option: any) => {
                    if (option) {
                        return option[property.name];
                    }
                };
            }

            let idProperty = properties.find((property: any) => property.isId);
            this.idPropertyName = idProperty?.name || 'id';
            debug('this.idPropertyName', this.idPropertyName);

            let sequenceProperty = properties.find(
                (property: any) => property.name == 'sequence'
            );

            this.options = new this.businessObject.arrayClass({
                http: this.httpClient,
                read: 'On Demand',
                save: 'Never',
                order: sequenceProperty?.name || this.displayNameProperty,
                limit: 20,
                where: { ...this.whereFilter },
            });

            this.optionsFromId();

            this.subscriptions.push(
                this.control.valueChanges.subscribe(() => {
                    debug('value change');
                    this.optionsFromId();
                })
            );
            debug('subscribed');
        }
    }

    filterOptions() {
        let debug = Debug('ApexBelongsToField:filterOptions');

        let value = this.formControl.value;
        debug('value', value);

        if (value && typeof value == 'string' && value !== this.control.value) {
            let where = {
                [this.displayNameProperty]: {
                    ilike: '%' + value.toLowerCase() + '%',
                },
            };
            debug('where', where);
            this.options.setOption('where', { ...where, ...this.whereFilter });
            this.options.read();
        }
    }

    async open() {
        let debug = Debug('ApexBelongsToField:open');

        let where = {};
        debug('where', where);
        this.options.setOption('where', { ...where, ...this.whereFilter });
        await this.options.read();
        this.input.openPanel();
    }

    handleSelect() {
        let debug = Debug('ApexBelongsToField:handleSelect');

        debug('this.formControl.value', this.formControl.value);
        let object = this.formControl.value;
        if (object) {
            let id = object[this.idPropertyName];
            debug('id', id);
            if (id !== this.control.value) {
                this.control.setValue(id);
                this.control.markAsDirty();
                debug('value set');
            }
        } else {
            if (this.control.value) {
                this.control.reset();
                this.control.markAsDirty();
                debug('control reset');
            }
        }
    }

    async optionsFromId() {
        let debug = Debug('ApexBelongsToField:optionsFromId');

        debug('this.control', this.control);
        if (this.control?.value) {
            let currentValue = this.formControl.value
                ? this.formControl.value[this.idPropertyName]
                : undefined;
            debug('currentValue', currentValue);
            if (this.control.value !== currentValue) {
                let newWhere = { [this.idPropertyName]: this.control.value };
                debug('newWhere', newWhere);

                let currentWhere = this.options.getOption('where');
                debug('currentWhere', currentWhere);

                if (JSON.stringify(newWhere) !== JSON.stringify(currentWhere)) {
                    this.options.setOption('where', {
                        ...newWhere,
                        ...this.whereFilter,
                    });
                    await this.options.read();
                    debug('this.options', this.options);
                    if (this.options.length > 0) {
                        debug('setting value');
                        this.formControl.setValue(this.options[0]);
                    } else {
                        debug('reset');
                        this.formControl.reset();
                    }
                }
            }
        } else {
            debug('reseting');
            this.formControl.reset();
        }

        debug('this.options', this.options);
    }

    unsubscribe() {
        for (let subscription of this.subscriptions || []) {
            subscription.unsubscribe();
        }
    }

    errorMessage(): string {
        let debug = Debug('ApexBelongsToField:errorMessage');

        debug('this.control.errors', this.control.errors);

        let messages = [];
        for (let name in this.control.errors) {
            debug('name', name);
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

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
