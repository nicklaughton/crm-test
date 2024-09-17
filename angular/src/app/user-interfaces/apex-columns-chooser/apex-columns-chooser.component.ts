// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';
import * as changeCase from 'change-case';

import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

import {
    ElementRef,
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

import { ApexDesignerBusinessObjectsService } from '../../shared/services/apex-designer-business-objects.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-columns-chooser',
    templateUrl: './apex-columns-chooser.component.html',
    styleUrls: ['./apex-columns-chooser.component.scss'],
})
export class ApexColumnsChooserComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.preparePropertySelections();
        }
    }

    @Input()
    iconName: string = 'view_column';

    @Input()
    allFields: boolean;

    propertySelections: any[];

    localStorageKey: string;

    @Input()
    relationshipName: string;

    properties: any[];

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
        private elementRef: ElementRef,
        private apexDesignerBusinessObjectsService: ApexDesignerBusinessObjectsService
    ) {}

    @ViewChild('dialog', { static: false } as any) dialog;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.setFixedWidth();
        this.preparePropertySelections();
        this._isInitComplete = true;
    }

    setFixedWidth() {
        let debug = Debug('ApexColumnsChooser:setFixedWidth');

        debug('this.elementRef', this.elementRef);
        this.apexDynamicComponentsService.setFixedWidth(
            this.elementRef.nativeElement,
            '40px'
        );
    }

    preparePropertySelections() {
        let debug = Debug('ApexColumnsChooser:preparePropertySelections');

        debug('this.relationshipName', this.relationshipName);
        if (this.relationshipName) {
            let relationships = this.array.getMetadata('relationships');
            debug('relationships', relationships);

            let businessObjectName =
                relationships[this.relationshipName].businessObject.name;
            debug('businessObjectName', businessObjectName);

            this.properties =
                this.apexDesignerBusinessObjectsService.properties(
                    businessObjectName,
                    this.allFields,
                    this.allFields
                );
        } else {
            this.properties =
                this.apexDesignerBusinessObjectsService[
                    this.array.getMetadata('name')
                ].properties;
            if (!this.allFields) {
                this.properties = this.properties.filter(
                    (property: any) => !property.isHidden && !property.isId
                );
            }
        }
        debug('this.properties', this.properties);

        this.propertySelections = this.properties.map(
            (property: any, index: number) => {
                return {
                    name: property.name,
                    displayName: property.displayName,
                    selected: false,
                    sequence: 1000 + index,
                };
            }
        );
        debug('this.propertySelections', this.propertySelections);

        let modelName = this.array.getMetadata('name');
        debug('modelName', modelName);

        this.localStorageKey = modelName + 'SelectedColumns';
        debug('this.localStorageKey', this.localStorageKey);

        let currentPropertyNames = [];
        let namesCsv = localStorage.getItem(this.localStorageKey);
        debug('namesCsv', namesCsv);
        if (namesCsv) currentPropertyNames = namesCsv.split(',');
        if (currentPropertyNames.length == 0) {
            let fields = this.array.getOption('fields');
            debug('fields', fields);
            currentPropertyNames = fields;
        }
        debug('currentPropertyNames', currentPropertyNames);

        let foundOne = false;
        for (let propertySelection of this.propertySelections) {
            let index = currentPropertyNames.indexOf(propertySelection.name);
            if (index != -1) {
                propertySelection.sequence = index;
                propertySelection.selected = true;
                foundOne = true;
            }
        }
        debug('foundOne', foundOne);

        this.propertySelections.sort((a, b) => {
            if (a.selected && !b.selected) return -1;
            if (!a.selected && b.selected) return 1;
            if (a.sequence < b.sequence) return -1;
            if (a.sequence > b.sequence) return 1;
        });

        for (let i = 0; i < this.propertySelections.length; i++) {
            this.propertySelections[i].sequence = i;
            if (!foundOne) this.propertySelections[i].selected = true;
        }

        debug('this.propertySelections', this.propertySelections);

        if (namesCsv) {
            this.apply();
        }
    }

    apply() {
        let debug = Debug('ApexColumnsChooser:apply');

        let fields = [];

        for (let propertySelection of this.propertySelections) {
            if (propertySelection.selected) {
                fields.push(propertySelection.name);
            }
        }
        debug('fields', fields);

        localStorage.setItem(this.localStorageKey, fields.join(','));

        debug('this.properties', this.properties);
        let idProperty = this.properties.find((property: any) => property.isId);
        debug('idProperty', idProperty);

        if (!idProperty) {
            idProperty = {
                name: 'id',
            };
        }
        if (fields.indexOf(idProperty.name) == -1) {
            fields.push(idProperty.name);
        }
        if (this.relationshipName) {
            fields.push(this.relationshipName + 'Id');
        }
        debug('fields', fields);

        if (this.relationshipName) {
            let include = this.array.getOption('include');
            include[this.relationshipName].fields = fields;
            debug('includeOption', include);
            let originalInclude = this.array.getOption('include');
            if (JSON.stringify(originalInclude) != JSON.stringify(include)) {
                this.array.setOption('include', include);
                this.array.read();
            }
        } else {
            let originalFields = this.array.getOption('fields');
            if (JSON.stringify(originalFields) != JSON.stringify(fields)) {
                this.array.setOption('fields', fields);
                this.array.read();
            }
        }
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
