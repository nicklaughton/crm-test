// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

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

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-objects-page-content',
    templateUrl: './apex-objects-page-content.component.html',
    styleUrls: ['./apex-objects-page-content.component.scss'],
})
export class ApexObjectsPageContentComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    private _businessObjectName: string;

    @Input()
    get businessObjectName(): string {
        return this._businessObjectName;
    }

    set businessObjectName(value: string) {
        if (value != this._businessObjectName) {
            this._businessObjectName = value;
            if (this._isInitComplete) this.initialize();
        }
    }

    array: any;

    limit: number;

    businessObject: any;

    tsvHandler: any;

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

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.limit = 100;

        this.initialize();
        this.setTsvHandler();
        this._isInitComplete = true;
    }

    async initialize() {
        let debug = Debug('ApexObjectsPageContent:initialize');

        debug('this.businessObjectName', this.businessObjectName);

        this.businessObject =
            this.apexDesignerBusinessObjectsService[this.businessObjectName];
        debug('this.businessObject', this.businessObject);

        let orderProperty = this.businessObject.properties.find(
            (property: any) => property.name == 'sequence'
        );
        debug('orderProperty', orderProperty);

        if (!orderProperty) {
            orderProperty = this.businessObject.properties.find(
                (property: any) => !property.id && !property.hidden
            );
            debug('orderProperty', orderProperty);
        }

        let thisArray = new this.businessObject.formArrayClass();
        thisArray.setOption('read', 'On Demand');
        thisArray.setOption('save', 'Automatically');
        thisArray.setOption('limit', this.limit);
        if (orderProperty) {
            thisArray.setOption('order', orderProperty.name);
        }
        await thisArray.read();
        debug('thisArray', thisArray);
        this.array = thisArray;
        debug('this.array', this.array);
    }

    camelCase(value: string) {
        return changeCase.camelCase(value);
    }

    openItem(item: any) {
        let debug = Debug('ApexObjectsPageContent:openItem');

        debug('item', item);
        this.router.navigateByUrl(this.router.url + '/' + item.id);
    }

    setTsvHandler() {
        let debug = Debug('ApexObjectsPageContent:setTsvHandler');

        const Papa = require('papaparse');

        let nativeTypeByPropertyName: any = {};
        for (let property of this.businessObject.properties) {
            let nativeType = property.type.name;
            let baseType = this.apexDesignerBusinessObjectsService[nativeType];
            if (baseType) {
                nativeType = baseType.nativeType;
            }
            nativeTypeByPropertyName[property.name] = nativeType;
        }
        if (!nativeTypeByPropertyName.id)
            nativeTypeByPropertyName.id = 'number';
        debug('nativeTypeByPropertyName', nativeTypeByPropertyName);

        // Needs to be done this way so that the function runs in this context
        this.tsvHandler = async (tsvValues: string) => {
            debug('tsvValues', tsvValues);

            let items = Papa.parse(tsvValues, {
                header: true,
                transform: (value, header) => {
                    debug('value', value);
                    debug('header', header);
                    let nativeType = nativeTypeByPropertyName[header];
                    if (!nativeType)
                        throw `"${header}" is not a property of "${this.businessObject.pluralDisplayName}"`;
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
                if (item.id) {
                    debug('updating', item);
                    await this.businessObject.class.updateById(item.id, item);
                    debug('updated');
                } else {
                    debug('creating', item);
                    await this.businessObject.class.create(item);
                    debug('created');
                }
            }

            this.array.read();
        };
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
