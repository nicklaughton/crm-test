// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from '../../shared/models/apex-data-object';

import { ApexDataArray } from '../../shared/models/apex-data-array';

import { FormControl } from '@angular/forms';
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
    selector: 'apex-select-object-field',
    templateUrl: './apex-select-object-field.component.html',
    styleUrls: ['./apex-select-object-field.component.scss'],
})
export class ApexSelectObjectFieldComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    private _object: ApexDataObject;

    @Input()
    get object(): ApexDataObject {
        return this._object;
    }

    set object(value: ApexDataObject) {
        if (value != this._object) {
            this._object = value;
            if (this._isInitComplete) this.setFunctions();
        }
    }

    @Input()
    label: string;

    private _options: ApexDataArray;

    @Input()
    get options(): ApexDataArray {
        return this._options;
    }

    set options(value: ApexDataArray) {
        if (value != this._options) {
            this._options = value;
            if (this._isInitComplete) this.setFunctions();
        }
    }

    @Input()
    displayPropertyName: string;

    @Input()
    displayNameFunction: any;

    @Input()
    required: boolean;

    @Input()
    noPadding: boolean;

    formControl: FormControl;

    @Output() objectChange: EventEmitter<ApexDataObject> = new EventEmitter(
        true
    );

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

        this.setFunctions();
        this.initialize();
        this._isInitComplete = true;
    }

    setFunctions() {
        let debug = Debug('ApexSelectObjectField:setFunctions');

        debug('this.options', this.options);
        if (this.options) {
            if (!this.displayNameFunction) {
                if (!this.displayPropertyName) {
                    let property = this.options
                        .getMetadata('properties')
                        .find((property: any) => !property.isHidden);
                    this.displayPropertyName = property.name;
                }
                debug('this.displayPropertyName', this.displayPropertyName);

                this.displayNameFunction = (option: any) => {
                    if (option) {
                        return option[this.displayPropertyName];
                    }
                };
            }
        }
    }

    initialize() {
        let debug = Debug('ApexSelectObjectField:initialize');

        this.formControl = new FormControl(this.object);
        debug('this.formControl', this.formControl);

        debug('this.required', this.required);
        if (this.required) {
            this.formControl.setValidators(Validators.required);
        }
    }

    handleSelect(event: any) {
        let debug = Debug('ApexSelectObjectField:handleSelect');

        debug('event', event);
        this.object = event.value;
        this.objectChange.emit(this.object);
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
