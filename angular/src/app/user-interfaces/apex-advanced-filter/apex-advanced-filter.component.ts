// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';

import { FormControl } from '@angular/forms';
import * as changeCase from 'change-case';

import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

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
    selector: 'apex-advanced-filter',
    templateUrl: './apex-advanced-filter.component.html',
    styleUrls: ['./apex-advanced-filter.component.scss'],
})
export class ApexAdvancedFilterComponent implements OnInit, OnDestroy {
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

    filters: any[];

    @Output() filterChange: EventEmitter<void> = new EventEmitter(true);

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

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.initialize();
        this._isInitComplete = true;
    }

    initialize() {
        let debug = Debug('ApexAdvancedFilter:initialize');

        this.unSubscribe();

        debug('this.array', this.array);

        this.getFilters();

        this.control = new FormControl();
    }

    unSubscribe() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    getFilters() {
        let debug = Debug('ApexAdvancedFilter:getFilters');

        this.filters = [];

        const where = this.array.getOption('where') || {};
        debug('where', where);

        for (let name in where) {
            debug('name', name);
            let value = where[name];
            debug('value', value);
            if (value && typeof value == 'object') {
                value = JSON.stringify(value);
                debug('value', value);
            }
            this.filters.push({
                name: name,
                value: value,
            });
        }

        debug('this.filters', this.filters);
    }

    addFilter() {
        let debug = Debug('ApexAdvancedFilter:addFilter');

        let value = this.control.value;
        debug('value', value);

        if (value) {
            let parts = value.split(' ');
            debug('parts', parts);
            let where = this.array.getOption('where') || {};
            debug('where', where);
            let propertyName = parts.shift();
            debug('propertyName', propertyName);
            if (propertyName) {
                propertyName = changeCase.camelCase(propertyName);
                debug('propertyName', propertyName);
                let property = this.apexDesignerBusinessObjectsService
                    .properties(this.array.getMetadata('name'), true)
                    .find((property: any) => property.name == propertyName);
                debug('property', property);
                if (property) {
                    let whereValue = parts.join(' ');
                    debug('whereValue', whereValue);
                    if (whereValue.startsWith('{')) {
                        whereValue = require('json5').parse(whereValue);
                    } else {
                        debug('property.type', property.type);
                        if (property.type.name == 'number') {
                            whereValue = Number(whereValue);
                        } else if (property.type.name == 'boolean') {
                            whereValue = whereValue === 'true';
                        }
                    }
                    where[propertyName] = whereValue;
                    this.array.setOption('where', where);
                    this.array.read();
                    this.getFilters();
                    this.filterChange.emit();
                }
            }
            this.control.reset();
        }
    }

    removeFilter(name: string) {
        let debug = Debug('ApexAdvancedFilter:removeFilter');

        let where = this.array.getOption('where') || {};
        debug('where', where);
        delete where[name];
        debug('where', where);
        this.array.setOption('where', where);
        this.array.read();
        this.getFilters();
        this.filterChange.emit();
    }

    ngOnDestroy() {
        this.unSubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
