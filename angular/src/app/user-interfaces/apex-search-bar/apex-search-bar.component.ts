// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';

import { FormControl } from '@angular/forms';
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
    selector: 'apex-search-bar',
    templateUrl: './apex-search-bar.component.html',
    styleUrls: ['./apex-search-bar.component.scss'],
})
export class ApexSearchBarComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    private _array: ApexDataArray;

    @Input()
    get array(): ApexDataArray {
        return this._array;
    }

    set array(value: ApexDataArray) {
        if (value != this._array) {
            this._array = value;
            if (this._isInitComplete) this.initialize();
        }
    }

    propertyNames: string;

    control: FormControl;

    subscription: any;

    @Input()
    placeholder: string;

    @Input()
    noPadding: boolean;

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

        this.initialize();
        this._isInitComplete = true;
    }

    initialize() {
        let debug = Debug('ApexSearchBar:initialize');

        this.unSubscribe();

        debug('this.array', this.array);

        this.control = new FormControl();

        let timeout;

        this.control.valueChanges.subscribe((newValue: string) => {
            debug('newValue', newValue);
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                let where: any = {
                    or: [],
                };
                let fields = this.array.getOption('fields');
                debug('fields', fields);
                if (fields && !Array.isArray(fields)) {
                    let newArray = [];
                    for (let name in fields) {
                        if (fields[name]) newArray.push(name);
                    }
                    fields = newArray;
                }
                for (let property of this.array.getMetadata('properties')) {
                    debug('property', property);
                    if (
                        !property.isHidden &&
                        property.type.name !== 'Date' &&
                        (!fields ||
                            fields.length == 0 ||
                            fields.indexOf(property.name) > -1)
                    ) {
                        where.or.push({
                            [property.name]: {
                                ilike: `%${newValue.toLowerCase()}%`,
                            },
                        });
                    }
                }
                debug('where', where);
                this.array.setOption('where', where);
                this.array.read();
            }, 250);
        });
    }

    unSubscribe() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    ngOnDestroy() {
        this.unSubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
