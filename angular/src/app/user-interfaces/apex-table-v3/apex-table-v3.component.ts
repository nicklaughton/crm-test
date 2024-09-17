// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';
import * as changeCase from 'change-case';
import * as dayjs from 'dayjs';

import { ApexDesignerBusinessObjectsService } from '../../shared/services/apex-designer-business-objects.service';

import { SelectionModel } from '@angular/cdk/collections';

import { formatCurrency, getCurrencySymbol } from '@angular/common';

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
    selector: 'apex-table-v3',
    templateUrl: './apex-table-v3.component.html',
    styleUrls: ['./apex-table-v3.component.scss'],
})
export class ApexTableV3Component implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.handleArrayChanges();
        }
    }

    @Input()
    routePrefix: string;

    @Input()
    noLinks: boolean;

    @Input()
    label: string;

    @Input()
    headingLevel: number = 2;

    @Input()
    allFields: boolean;

    columnPaths: string[];

    @Input()
    columnTypes: string[];

    columnLabels: string[];

    subscription: any;

    renderRowsTimeout: any;

    columnWidth: string;

    @Input()
    clickTooltip: string;

    @Input()
    pathsCsv: string;

    @Input()
    columnLabelsCsv: string;

    @Input()
    routeFunction: any;

    @Input()
    multiSelect: boolean;

    selection: any;

    private _selectedRows: any[];

    @Input()
    get selectedRows(): any[] {
        return this._selectedRows;
    }

    set selectedRows(value: any[]) {
        if (value != this._selectedRows) {
            this._selectedRows = value;
            if (this._isInitComplete) this.handleSelectedRowsChange();
        }
    }

    @Input()
    routerLink: string;

    @Input()
    idQueryParamProperty: string;

    idPropertyName: string;

    @Input()
    includeId: boolean;

    @Input()
    queryParamFunction: any;

    @Input()
    formatCellFunction: any;

    _timeoutHandle: any;

    @Input()
    singleSelect: boolean;

    @Output() selectedRowsChange: EventEmitter<any[]> = new EventEmitter(true);

    @Output() rowClicked: EventEmitter<any> = new EventEmitter(true);

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

        private apexDesignerBusinessObjectsService: ApexDesignerBusinessObjectsService,
        public apexDynamicComponentsService: ApexDynamicComponentsService
    ) {}

    @ViewChild('table', { static: false } as any) table;

    @ViewChild('wrapper', { static: false } as any) wrapper;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.selection = new SelectionModel<any>(true, []);

        this.setColumns();
        this.setDefaultRoutePrefix();
        this.setIdPropertyName();
        this.listenForChanges();
        this._isInitComplete = true;
    }

    handleArrayChanges() {
        let debug = Debug('ApexTableV3:handleArrayChanges');

        debug('this.array', this.array);
        this.listenForChanges();
    }

    setColumns() {
        let debug = Debug('ApexTableV3:setColumns');

        debug(
            '====================================================================='
        );
        debug('this.columnLabelsCsv', this.columnLabelsCsv);
        debug('this', this);

        debug('this.array', this.array);
        if (this.array) {
            const properties = this.array.getMetadata
                ? this.apexDesignerBusinessObjectsService.properties(
                      this.array.getMetadata('name'),
                      this.allFields,
                      this.allFields
                  )
                : [];
            debug('properties', properties);

            let pathsToShow = [];

            debug('this.pathsCsv', this.pathsCsv);
            if (this.pathsCsv) {
                pathsToShow.push(
                    ...this.pathsCsv
                        .split(',')
                        .map((path: string) => path.trim())
                );
            } else {
                let fields = this.array.getOption('fields');
                debug('fields', fields);
                if (fields && fields.length > 0) {
                    pathsToShow.push(...fields);
                    if (!this.allFields && !this.includeId) {
                        pathsToShow = pathsToShow.filter(
                            (path: string) => path != 'id'
                        );
                    }
                } else {
                    pathsToShow = properties.map(
                        (property: any) => property.name
                    );
                    if (!this.allFields && !this.includeId) {
                        pathsToShow = pathsToShow.filter(
                            (path: string) => path != 'id'
                        );
                    }
                }
            }
            debug('pathsToShow', pathsToShow);

            const anyPropertyNames = this.array.getMetadata
                ? this.apexDesignerBusinessObjectsService
                      .properties(this.array.getMetadata('name'), true, true)
                      .filter((property) => property.type.name == 'any')
                      .map((property) => property.name)
                : [];
            debug('anyPropertyNames', anyPropertyNames);

            let derivedColumnLabels = [];

            if (this.array.getMetadata) {
                let businessObjectName = this.array.getMetadata('name');
                let businessObject =
                    this.apexDesignerBusinessObjectsService[businessObjectName];
                let businessObjectsByPath = {};
                for (let path of pathsToShow) {
                    debug('path', path);
                    let levels = path.split('.');
                    const topLevel = levels[0];
                    debug('topLevel', topLevel);
                    // remove the last level
                    levels.pop();

                    let parentPath = levels.join('.');
                    debug('parentPath', parentPath);
                    debug('businessObjectsByPath', businessObjectsByPath);
                    if (
                        !businessObjectsByPath[parentPath] &&
                        !anyPropertyNames.includes(topLevel)
                    ) {
                        let currentBusinessObject = businessObject;
                        while (levels.length > 0) {
                            let relation =
                                currentBusinessObject.relationships[levels[0]];
                            debug('relation', relation);
                            if (!relation)
                                throw `"${levels[0]}" relationship was not found`;
                            currentBusinessObject =
                                this.apexDesignerBusinessObjectsService[
                                    relation.businessObject.name
                                ];
                            levels.shift();
                        }
                        debug('currentBusinessObject', currentBusinessObject);
                        businessObjectsByPath[parentPath] =
                            currentBusinessObject;
                    }
                }
                debug('businessObjectsByPath', businessObjectsByPath);

                this.columnTypes = [];
                this.columnPaths = [];
                for (let path of pathsToShow) {
                    debug('path', path);
                    let levels = path.split('.');
                    const topLevel = levels[0];
                    if (!anyPropertyNames.includes(topLevel)) {
                        let propertyName = levels.pop();
                        let parentPath = levels.join('.');
                        let businessObject = businessObjectsByPath[parentPath];
                        if (propertyName == '*') {
                            for (let property of businessObject.property) {
                                debug('property 1', property);
                                if (!property.isHidden || this.allFields) {
                                    derivedColumnLabels.push(
                                        property.displayName
                                    );
                                    this.columnTypes.push(property.type.name);
                                    if (parentPath !== '') {
                                        this.columnPaths.push(
                                            parentPath + '.' + property.name
                                        );
                                    } else {
                                        this.columnPaths.push(property.name);
                                    }
                                }
                            }
                        } else {
                            debug(
                                'businessObject.properties:',
                                businessObject.properties
                            );
                            let property = businessObject.properties.find(
                                (property: any) => property.name == propertyName
                            );
                            debug('property 2', property);
                            if (!property && propertyName == 'id') {
                                property = {
                                    displayName: 'Id',
                                    name: 'id',
                                    type: {
                                        name: 'number',
                                    },
                                };
                            } else {
                                for (let relationshipName in businessObject.relationships) {
                                    let relationship =
                                        businessObject.relationships[
                                            relationshipName
                                        ];
                                    debug('relationship', relationship);
                                    if (
                                        relationship.foreignKey == propertyName
                                    ) {
                                        let relatedBusinessObject =
                                            this
                                                .apexDesignerBusinessObjectsService[
                                                relationship.businessObject.name
                                            ];
                                        debug(
                                            'relatedBusinessObject',
                                            relatedBusinessObject
                                        );
                                        let idProperty =
                                            relatedBusinessObject.properties.find(
                                                (property: any) => property.isId
                                            );
                                        if (!idProperty) {
                                            idProperty = {
                                                displayName: 'Id',
                                                name: 'id',
                                                type: {
                                                    name: 'number',
                                                },
                                            };
                                        }
                                        debug('idProperty', idProperty);
                                        property = {
                                            displayName:
                                                changeCase.capitalCase(
                                                    propertyName
                                                ),
                                            name: propertyName,
                                            type: idProperty.type,
                                        };
                                        debug('property', property);
                                        break;
                                    }
                                }
                            }
                            if (!property) {
                                property = {
                                    displayName:
                                        changeCase.capitalCase(propertyName),
                                    name: propertyName,
                                    type: {
                                        name: 'string',
                                    },
                                };
                            }
                            debug(
                                'property to add to derivedColumnLabels:',
                                property
                            );
                            derivedColumnLabels.push(property.displayName);
                            this.columnTypes.push(property.type.name);
                            if (parentPath !== '') {
                                this.columnPaths.push(
                                    parentPath + '.' + property.name
                                );
                            } else {
                                this.columnPaths.push(property.name);
                            }
                        }
                    } else {
                        this.columnPaths.push(path);
                        this.columnTypes.push('any');
                        derivedColumnLabels.push(
                            changeCase.capitalCase(levels.pop())
                        );
                    }
                }
            } else {
                // This is a native javascript array
                this.columnPaths = pathsToShow;
                if (!this.columnTypes)
                    this.columnTypes = new Array(this.columnPaths.length);
            }

            debug('derivedColumnLabels', derivedColumnLabels);
            debug('this.columnLabelsCsv', this.columnLabelsCsv);
            if (this.columnLabelsCsv) {
                this.columnLabels = this.columnLabelsCsv
                    .split(',')
                    .map((label: string) => label.trim());
            } else {
                this.columnLabels = derivedColumnLabels;
            }

            //optionally add multi-select column
            if (this.multiSelect || this.singleSelect) {
                this.columnLabels.unshift('select');
                this.columnPaths.unshift('select');
                this.columnTypes.unshift('boolean');
            }

            debug('this.columnLabels', this.columnLabels);
            debug('this.columnPaths', this.columnPaths);
            debug('this.columnTypes', this.columnTypes);

            /*
setTimeout(() => {
	debug('this.wrapper', this.wrapper);
	if (this.wrapper) {
		let boundingBox = this.wrapper.nativeElement.getBoundingClientRect();
		debug('boundingBox', boundingBox);
		this.columnWidth = boundingBox.width / this.columnLabels.length + 'px';
		debug('this.columnWidth', this.columnWidth);
	}
});
*/

            this.renderRows();
        }
    }

    setDefaultRoutePrefix() {
        let debug = Debug('ApexTableV3:setDefaultRoutePrefix');

        debug('this.routeFunction', this.routeFunction);

        debug('this.routePrefix', this.routePrefix);
        if (!this.routePrefix && this.array.getMetadata) {
            let pluralName = this.array.getMetadata('pluralName');
            debug('pluralName', pluralName);

            this.routePrefix = '/' + changeCase.camelCase(pluralName) + '/';
            debug('this.routePrefix', this.routePrefix);
        }
    }

    setIdPropertyName() {
        let debug = Debug('ApexTableV3:setIdPropertyName');

        debug('this.array', this.array);
        if (!this.array.getMetadata) return;
        let idProperty = this.array
            .getMetadata('properties')
            .find((property: any) => property.isId);
        debug('idProperty', idProperty);
        if (idProperty) {
            this.idPropertyName = idProperty.name;
        } else {
            this.idPropertyName = 'id';
        }
    }

    listenForChanges() {
        let debug = Debug('ApexTableV3:listenForChanges');

        if (this.array?.getOption) {
            this.unSubscribe();

            let currentIds = this.array.map((item: any) => item.id).join(',');
            debug('currentIds', currentIds);

            let currentFields = JSON.stringify(this.array.getOption('fields'));
            debug('currentFields', currentFields);

            this.subscription = this.array.formArray.valueChanges.subscribe(
                (newValue: any) => {
                    if (this._timeoutHandle) clearTimeout(this._timeoutHandle);
                    this._timeoutHandle = setTimeout(() => {
                        let updatedFields = JSON.stringify(
                            this.array.getOption('fields')
                        );
                        debug('updatedFields', updatedFields);
                        debug('currentFields', currentFields);
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
                    }, 500);
                }
            );
        }
    }

    renderRows() {
        let debug = Debug('ApexTableV3:renderRows');

        debug('this.table', this.table);

        if (!this.table || this.array.reading) {
            let interval = setInterval(() => {
                debug('this.table', this.table);
                debug('this.array.reading', this.array.reading);
                if (this.table && !this.array.reading) {
                    clearInterval(interval);
                    this.table.renderRows();
                }
            }, 50);
        } else {
            this.table.renderRows();
        }
    }

    cellValue(item: any, path: string, type: string) {
        if (this.formatCellFunction) {
            return this.formatCellFunction(item, path, type);
        }

        const utc = require('dayjs/plugin/utc');
        const timezone = require('dayjs/plugin/timezone');
        dayjs.extend(utc);
        dayjs.extend(timezone);

        let value = item;
        let levels = path.split('.');
        while (levels.length > 0 && value !== undefined) {
            let level = levels.shift();
            value = value[level];
        }

        type = type || typeof value;

        const businessObjectType =
            this.apexDesignerBusinessObjectsService[type];

        if (value === undefined || value === null) {
            value = '';
        } else if (value && type === 'Date') {
            value = dayjs(value).format('M/D/YYYY h:mm a');
        } else if (value && type === 'DateWithoutTime') {
            value = dayjs(value).format('M/D/YYYY');
        } else if (value && type === 'DateWithFixedTimezone') {
            value = dayjs(value);
            if (this.apexDynamicComponentsService.fixedTimezone)
                value = value['tz'](
                    this.apexDynamicComponentsService.fixedTimezone
                );
            value = value.format('M/D/YYYY h:mm a');
        } else if (type === 'number') {
            value = String(value);
        } else if (type === 'boolean') {
            if (value === true) value = 'True';
            else if (value === false) value = 'False';
        } else if (type === 'Currency') {
            value = formatCurrency(
                value,
                this.apexDynamicComponentsService.currencyLocale,
                getCurrencySymbol(
                    this.apexDynamicComponentsService.currencyCode,
                    'narrow'
                )
            );
        } else if (
            businessObjectType &&
            (businessObjectType.hasThousandsSeparator ||
                businessObjectType.fixedDecimalPlaces)
        ) {
            if (businessObjectType.hasThousandsSeparator) {
                const formatOptions = {};
                if (businessObjectType.fixedDecimalPlaces) {
                    formatOptions['minimumFractionDigits'] =
                        businessObjectType.fixedDecimalPlaces;
                    formatOptions['maximumFractionDigits'] =
                        businessObjectType.fixedDecimalPlaces;
                }
                value = new Intl.NumberFormat(
                    this.apexDynamicComponentsService.currencyLocale,
                    formatOptions
                ).format(value);
            } else {
                value = value.toFixed(businessObjectType.fixedDecimalPlaces);
            }
        }
        if (value.length === 0) value = String.fromCharCode(160);
        return value;
    }

    itemUrl(item: any) {
        let url = '';
        if (this.routeFunction) {
            url = this.routeFunction(item);
        } else if (this.routerLink) {
            url = this.routerLink;
        } else {
            if (this.routePrefix) {
                url = this.routePrefix;
            }
            url = url + encodeURIComponent(item[this.idPropertyName]);
        }
        return url;
    }

    isAllSelected(): boolean {
        /** Whether the number of selected elements matches the total number of rows. */

        const numSelected = this.selection.selected.length;
        const numRows = this.array.length;
        return numSelected === numRows;
    }

    masterToggle() {
        /** Selects all rows if they are not all selected; otherwise clear selection. */

        this.isAllSelected()
            ? this.selection.clear()
            : this.array.forEach((row) => this.selection.select(row));
    }

    handleRowSelection() {
        let debug = Debug('ApexTableV3:handleRowSelection');

        debug('this.selection.selected', this.selection.selected);
        this.selectedRows = this.selection.selected;
        this.selectedRowsChange.emit(this.selectedRows);
    }

    clearSelection() {
        let debug = Debug('ApexTableV3:clearSelection');

        this.selection.clear();
        debug('this.selectedRows', this.selectedRows);
        this.selectedRowsChange.emit(this.selectedRows);
    }

    itemQueryParams(item: any) {
        if (this.idQueryParamProperty) {
            let queryParams: any = {};
            queryParams[this.idQueryParamProperty] = item.idQueryParamProperty;
            return queryParams;
        } else if (this.queryParamFunction) {
            return this.queryParamFunction(item);
        }
    }

    unSubscribe() {
        if (this.subscription) this.subscription.unsubscribe();
        if (this._timeoutHandle) clearTimeout(this._timeoutHandle);
    }

    handleSelectedRowsChange() {
        let debug = Debug('ApexTableV3:handleSelectedRowsChange');

        debug('this.selectedRows %j', this.selectedRows);
        if (this.selectedRows && this.selectedRows.length > 0) {
            this.selection.clear();
            this.selectedRows.forEach((row) => this.selection.select(row));
        }
    }

    ngOnDestroy() {
        this.unSubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
