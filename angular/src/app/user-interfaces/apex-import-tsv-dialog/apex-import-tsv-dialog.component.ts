// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';
import * as changeCase from 'change-case';

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

import { MatDialogRef } from '@angular/material/dialog';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-import-tsv-dialog',
    templateUrl: './apex-import-tsv-dialog.component.html',
    styleUrls: ['./apex-import-tsv-dialog.component.scss'],
})
export class ApexImportTsvDialogComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    array: ApexDataArray;

    @Input()
    label: string;

    tabSeparatedValues: string;

    @Input()
    tsvHandler: any;

    @Input()
    parentObject: any;

    @Input()
    customTemplate: string;

    @Output() changes: EventEmitter<void> = new EventEmitter(true);

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

        public businessObjectsService: ApexDesignerBusinessObjectsService,
        public dialog: MatDialogRef<ApexImportTsvDialogComponent>
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this._isInitComplete = true;
    }

    async importData() {
        let debug = Debug('ApexImportTsvDialog:importData');

        debug('this.tabSeparatedValues', this.tabSeparatedValues);
        const Papa = require('papaparse');

        // remove trailing line breaks or spaces (aka "trim" with removing trailing tabs)
        if (this.tabSeparatedValues)
            this.tabSeparatedValues = this.tabSeparatedValues.replace(
                /(\n| )*$/,
                ''
            );

        if (this.tsvHandler) {
            await this.tsvHandler(this.tabSeparatedValues);
            this.dialog.close();
        } else {
            let rows = this.tabSeparatedValues.split('\n');
            let foreignKeyId = '';
            let parentIdField = '';
            debug('rows', rows);

            const includeAllFields = true;
            const includeId = true;

            debug('this.parentObject', this.parentObject);
            if (this.parentObject) {
                let parentBOProperties = this.businessObjectsService.properties(
                    this.parentObject.getMetadata('name'),
                    includeAllFields,
                    includeId
                );
                let parentIdProperty = parentBOProperties.find(
                    (property: any) => property.isId
                );
                parentIdField = parentIdProperty.name;
                debug('parentIdField', parentIdField);
                debug('parentBOProperties', parentBOProperties);
            }

            let businessObject =
                this.businessObjectsService[this.array.getMetadata('name')];
            debug('businessObject', businessObject);
            if (this.parentObject) {
                debug(
                    'parentObjectName',
                    this.parentObject.getMetadata('name')
                );
                debug(
                    'businessObject.relationships',
                    businessObject.relationships
                );

                // Need to loop thought to find the right one
                for (const relationship in businessObject.relationships) {
                    debug('relationship', relationship);
                    if (
                        businessObject.relationships[relationship].type ==
                        'belongs to'
                    ) {
                        if (
                            (businessObject.relationships[
                                relationship
                            ].businessObject.name =
                                this.parentObject.getMetadata('name'))
                        ) {
                            foreignKeyId =
                                businessObject.relationships[relationship]
                                    .foreignKey;
                            break;
                        }
                    }
                }
                debug('foreignKeyId', foreignKeyId);
            }

            let properties = this.businessObjectsService.properties(
                this.array.getMetadata('name'),
                includeAllFields,
                includeId
            );
            debug('properties', properties);

            let idProperty = properties.find((property: any) => property.isId);
            if (!idProperty) {
                idProperty = {
                    name: 'id',
                    displayName: 'Id',
                    type: {
                        name: 'number',
                    },
                };
                properties.push(idProperty);
            }

            let displayNameToName: any = {};
            let nativeTypeByPropertyName: any = {};
            debug('businessObject', businessObject);
            for (let property of businessObject.properties) {
                let nativeType = property.type.name;
                let baseType = this.businessObjectsService[nativeType];
                if (baseType) {
                    nativeType = baseType.nativeType;
                }
                nativeTypeByPropertyName[property.name] = nativeType;
                displayNameToName[property.displayName] = property.name;
            }
            for (let name in businessObject.relationships) {
                let relationship = businessObject.relationships[name];
                debug('relationship', relationship);
                if (relationship.type == 'belongs to') {
                    displayNameToName[
                        changeCase.capitalCase(relationship.foreignKey)
                    ] = relationship.foreignKey;
                    let parentBusinessObject =
                        this.businessObjectsService[
                            relationship.businessObject.name
                        ];
                    debug('parentBusinessObject', parentBusinessObject);
                    let idProperty = parentBusinessObject.properties.find(
                        (property: any) => property.isId
                    );
                    if (idProperty) {
                        nativeTypeByPropertyName[relationship.foreignKey] =
                            idProperty.type.name;
                    } else {
                        nativeTypeByPropertyName[relationship.foreignKey] =
                            'number';
                    }
                }
            }
            if (!nativeTypeByPropertyName.id)
                nativeTypeByPropertyName.id = 'number';

            // Needs to be done this way so that the function runs in this context
            debug('this.tabSeparatedValues', this.tabSeparatedValues);
            debug('nativeTypeByPropertyName', nativeTypeByPropertyName);

            let items = Papa.parse(this.tabSeparatedValues, {
                header: true,
                delimiter: '\t',
                transformHeader: function (header) {
                    debug('header', header);
                    const propertyName = displayNameToName[header];
                    debug('propertyName', propertyName);
                    return propertyName;
                },
                transform: (value, header) => {
                    debug('value', value);
                    debug('header', header);
                    let nativeType = nativeTypeByPropertyName[header];
                    if (!nativeType)
                        throw `"${header}" is not a property of "${businessObject.pluralDisplayName}"`;
                    if (value != '') {
                        if (nativeType == 'string') return value;
                        if (nativeType == 'number') return Number(value);
                        if (nativeType == 'date') return new Date(value);
                        if (nativeType == 'boolean')
                            return value === 'true' ? true : false;
                    }
                },
            });
            debug('items', items);

            for (let item of items.data) {
                if (this.parentObject) {
                    item[foreignKeyId] = this.parentObject[parentIdField];
                }
                if (item.id) {
                    debug('updating', item);
                    await businessObject.class.updateById(item.id, item);
                    debug('updated');
                } else {
                    debug('creating', item);
                    await businessObject.class.create(item);
                    debug('created');
                }
            }
            this.array.read();
            this.changes.emit();
            this.dialog.close();
        }
    }

    downloadTemplate() {
        let debug = Debug('ApexImportTsvDialog:downloadTemplate');

        const includeAllFields = false;
        const includeId = false;
        let properties = this.businessObjectsService.properties(
            this.array.getMetadata('name'),
            includeAllFields,
            includeId
        );

        debug('properties', properties);

        debug('this.customTemplate', this.customTemplate);

        let tsvString =
            this.customTemplate ||
            properties.map((property: any) => property.displayName).join('\t');
        debug('tsvString', tsvString);

        const blob = new Blob([tsvString], {
            type: 'text/tab-separated-values;charset=utf-8;',
        });

        const link = document.createElement('a');

        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            this.array.getMetadata('pluralDisplayName') + '.tsv'
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
