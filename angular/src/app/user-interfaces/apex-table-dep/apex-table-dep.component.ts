// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';
import * as changeCase from 'change-case';
import * as dayjs from 'dayjs';

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
    selector: 'apex-table-dep',
    templateUrl: './apex-table-dep.component.html',
    styleUrls: ['./apex-table-dep.component.scss'],
})
export class ApexTableDepComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.setColumns();
        }
    }

    @Input()
    routePrefix: string;

    columnProperties: any[];

    columnLabels: string[];

    subscription: any;

    @Input()
    noLinks: boolean;

    columnWidth: string;

    renderRowsTimeout: any;

    @Input()
    relationshipName: string;

    @Input()
    headingLevel: number = 2;

    @Input()
    label: string;

    @Input()
    allFields: boolean;

    columnTypes: string[];

    @Input()
    paths: string[];

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

        private apexDesignerBusinessObjectsService: ApexDesignerBusinessObjectsService
    ) {}

    @ViewChild('table', { static: false } as any) table;

    @ViewChild('wrapper', { static: false } as any) wrapper;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.setColumns();
        this.setDefaultRoutePrefix();
        this._isInitComplete = true;
    }

    setColumns() {
        let debug = Debug('ApexTableDep:setColumns');

        this.unSubscribe();

        let properties = this.apexDesignerBusinessObjectsService.properties(
            this.array.getMetadata('name'),
            this.allFields,
            this.allFields
        );

        debug('this.relationshipName', this.relationshipName);
        if (this.relationshipName) {
            let relationships = this.array.getMetadata('relationships');
            debug('relationships', relationships);

            let businessObjectName =
                relationships[this.relationshipName].businessObject.name;
            debug('businessObjectName', businessObjectName);

            properties = this.apexDesignerBusinessObjectsService.properties(
                businessObjectName,
                this.allFields,
                this.allFields
            );
        }
        debug('properties %j', properties);

        let propertiesByName = {};

        for (let property of properties) {
            propertiesByName[property.name] = property;
        }
        debug('propertiesByName', propertiesByName);

        let fields = this.getFields();
        debug('fields', fields);

        if (fields.length == 0) {
            fields = properties.map((property: any) => property.name);
            debug('fields from properties', fields);
        }

        this.columnLabels = [];
        this.columnProperties = [];
        this.columnTypes = [];
        let columnsByName = {};
        for (let fieldName of fields) {
            let property = propertiesByName[fieldName];
            debug('property', property);
            if (property && !columnsByName[fieldName]) {
                this.columnProperties.push(fieldName);
                this.columnLabels.push(property.displayName);
                this.columnTypes.push(property.type.name);
                columnsByName[fieldName] = true;
            }
        }
        debug('this.columnLabels', this.columnLabels);
        debug('this.columnProperties', this.columnProperties);
        debug('this.columnTypes', this.columnTypes);

        setTimeout(() => {
            debug('this.wrapper', this.wrapper);
            if (this.wrapper) {
                let boundingBox =
                    this.wrapper.nativeElement.getBoundingClientRect();
                debug('boundingBox', boundingBox);
                this.columnWidth =
                    boundingBox.width / this.columnLabels.length + 'px';
                debug('this.columnWidth', this.columnWidth);
            }
        });

        this.listenForChanges();
        this.renderRows();
    }

    setDefaultRoutePrefix() {
        let debug = Debug('ApexTableDep:setDefaultRoutePrefix');

        debug('this.routePrefix', this.routePrefix);
        if (!this.routePrefix) {
            let lastLevel = this.router.url.split('/').pop().split('?')[0];
            debug('lastLevel', lastLevel);

            let desiredLastLevel = changeCase.camelCase(
                this.array.getMetadata('pluralName')
            );
            debug('desiredLastLevel', desiredLastLevel);

            if (lastLevel != desiredLastLevel) {
                this.routePrefix = desiredLastLevel + '/';
                debug('this.routePrefix', this.routePrefix);
            }
        }
    }

    listenForChanges() {
        let debug = Debug('ApexTableDep:listenForChanges');

        if (this.subscription) this.subscription.unsubscribe();

        let currentIds = this.array.map((item: any) => item.id).join(',');
        debug('currentIds', currentIds);

        let currentFields = this.getFields();

        let timeout;

        this.subscription = this.array.formArray.valueChanges.subscribe(
            (newValue: any) => {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => {
                    let updatedFields = this.getFields();
                    if (updatedFields != currentFields) {
                        debug('fields changed');
                        this.setColumns();
                        currentFields = updatedFields;
                    }
                    let newIds = this.array
                        .map((item: any) => item.id)
                        .join(',');
                    debug('newIds', newIds);
                    if (!newIds || !currentIds || newIds != currentIds) {
                        this.renderRows();
                    }
                    currentIds = newIds;
                }, 50);
            }
        );
    }

    renderRows() {
        if (this.renderRowsTimeout) clearTimeout(this.renderRowsTimeout);
        if (!this.table) {
            this.renderRowsTimeout = setTimeout(() => {
                this.renderRows();
            }, 50);
        } else {
            this.renderRowsTimeout = setTimeout(() => {
                this.table.renderRows();
            }, 50);
        }
    }

    getFields() {
        let debug = Debug('ApexTableDep:getFields');

        let fields = this.array.getOption('fields') || [];
        if (this.relationshipName) {
            let include = this.array.getOption('include');
            debug('include', include);
            fields = include[this.relationshipName].fields;
        }
        debug('fields', fields);
        return fields;
    }

    cellValue(item: any, columnProperty: string, columnType: string) {
        let value: any;
        if (this.relationshipName) {
            value = item[this.relationshipName][columnProperty];
        } else {
            value = item[columnProperty];
        }
        if (value && columnType === 'Date') {
            value = dayjs(value).format('M/D/YYYY h:mm a');
        }
        if (value === undefined) {
            value = '&nbsp;';
        }
        return value;
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
