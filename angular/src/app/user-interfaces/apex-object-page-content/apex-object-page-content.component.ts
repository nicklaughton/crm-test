// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import * as changeCase from 'change-case';

import { ApexDesignerBusinessObjectsService } from '../../shared/services/apex-designer-business-objects.service';

import { NavigationEnd, ActivatedRoute, Params, Router } from '@angular/router';

import { PathToRootObjectService } from '../../shared/services/path-to-root-object.service';

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

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-object-page-content',
    templateUrl: './apex-object-page-content.component.html',
    styleUrls: ['./apex-object-page-content.component.scss'],
})
export class ApexObjectPageContentComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.getObject();
        }
    }

    private _id: any;

    @Input()
    get id(): any {
        return this._id;
    }

    set id(value: any) {
        if (value != this._id) {
            this._id = value;
            if (this._isInitComplete) this.getObject();
        }
    }

    businessObject: any;

    object: any;

    childRelationships: any[];

    subscription: any;

    timeout: any;

    selectedList: any;

    afterDeleteRoute: string;

    selectedDefaults: any;

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
        private pathToRootObjectService: PathToRootObjectService
    ) {}

    @ViewChild('addDialog', { static: false } as any) addDialog;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.getObject();
        this._isInitComplete = true;
    }

    async getObject() {
        let debug = Debug('ApexObjectPageContent:getObject');

        debug('this.businessObjectName', this.businessObjectName);
        debug('this.id', this.id);

        this.object = null;

        if (this.businessObjectName && this.id) {
            if (this.timeout) clearTimeout(this.timeout);

            // A timeout is needed to ensure that both the id and business object inputs have a chance to be updated
            this.timeout = setTimeout(async () => {
                this.businessObject =
                    this.apexDesignerBusinessObjectsService[
                        this.businessObjectName
                    ];

                let pathToRoot = this.pathToRootObjectService.pathToRoot(
                    this.businessObject.name
                );
                debug('pathToRoot', pathToRoot);

                let includes =
                    this.pathToRootObjectService.includesFromPath(pathToRoot);
                debug('includes', includes);

                this.childRelationships = [];
                for (let name in this.businessObject.relationships) {
                    let relationship = this.businessObject.relationships[name];
                    if (relationship.type !== 'belongs to') {
                        let data = JSON.parse(JSON.stringify(relationship));
                        let relatedBusinessObject =
                            this.apexDesignerBusinessObjectsService[
                                relationship.businessObject.name
                            ];
                        data.relatedBusinessObject = relatedBusinessObject;
                        data.defaults = {};
                        data.defaults[relationship.foreignKey] = this.id;
                        this.childRelationships.push(data);
                        includes[name] = { limit: 100 };

                        let orderProperty =
                            relatedBusinessObject.properties.find(
                                (property: any) => property.name == 'sequence'
                            );
                        debug('orderProperty', orderProperty);

                        if (!orderProperty) {
                            orderProperty =
                                relatedBusinessObject.properties.find(
                                    (property: any) =>
                                        property.isId != true &&
                                        property.hidden != true
                                );
                            debug('orderProperty', orderProperty);
                        }
                        if (orderProperty) {
                            includes[name].order = orderProperty.name;
                        }
                    }
                }
                debug('this.childRelationships', this.childRelationships);
                debug('includes', includes);

                let nextObject = new this.businessObject.formGroupClass(
                    { id: this.id },
                    {
                        read: 'On Demand',
                        save: 'Automatically',
                        include: includes,
                    }
                );
                await nextObject.read();
                debug('nextObject', nextObject);
                this.object = nextObject;

                if (pathToRoot.length > 0) {
                    let parentRelationship =
                        this.businessObject.relationships[pathToRoot[0]];
                    debug('parentRelationship', parentRelationship);
                    let parentBusinessObject =
                        this.apexDesignerBusinessObjectsService[
                            parentRelationship.businessObject.name
                        ];
                    debug('parentBusinessObject', parentBusinessObject);
                    this.afterDeleteRoute = `/${changeCase.camelCase(
                        parentBusinessObject.pluralName
                    )}/${this.object[parentRelationship.foreignKey]}`;
                } else {
                    this.afterDeleteRoute = `/${changeCase.camelCase(
                        this.businessObject.pluralName
                    )}`;
                }
                debug('this.afterDeleteRoute', this.afterDeleteRoute);
            });
        }
    }

    unsubscribe() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    openItem(item: any) {
        let debug = Debug('ApexObjectPageContent:openItem');

        debug('item', item);

        let url = `/${changeCase.camelCase(item.getMetadata('pluralName'))}/${
            item.id
        }`;
        debug('url', url);

        this.router.navigateByUrl(url);
    }

    startAdd(relationship: any) {
        let debug = Debug('ApexObjectPageContent:startAdd');

        debug('relationship', relationship);
        this.selectedList = this.object[relationship.name];

        this.selectedDefaults = {};
        this.selectedDefaults[relationship.foreignKey] = this.id;

        let sequenceProperty =
            relationship.relatedBusinessObject.properties.find(
                (property: any) => property.name == 'sequence'
            );
        debug('sequenceProperty', sequenceProperty);

        if (sequenceProperty) {
            this.selectedDefaults.sequence = this.selectedList.length;
        }
        debug('this.selectedDefaults', this.selectedDefaults);

        this.addDialog.open();
    }

    getTsvHandler(relationship: any) {
        let debug = Debug('ApexObjectPageContent:getTsvHandler');

        const Papa = require('papaparse');

        let relatedBusinessObject =
            this.apexDesignerBusinessObjectsService[
                relationship.businessObject.name
            ];
        //let relatedBusinessObject = this.businessObjectsService.properties[this.array.getMetadata('name')];

        let displayNameToName: any = {}; //KM
        let nativeTypeByPropertyName: any = {};
        for (let property of relatedBusinessObject.properties) {
            let nativeType = property.type.name;
            let baseType = this.apexDesignerBusinessObjectsService[nativeType];
            if (baseType) {
                //
                nativeType = baseType.nativeType;
            }
            nativeTypeByPropertyName[property.name] = nativeType;

            displayNameToName[property.displayName] = property.name;
        }
        if (!nativeTypeByPropertyName.id)
            nativeTypeByPropertyName.id = 'number';

        // Needs to be done this way so that the function runs in this context
        return async (tsvValues: string) => {
            debug('tsvValues', tsvValues);
            debug('nativeTypeByPropertyName', nativeTypeByPropertyName);

            let items = Papa.parse(tsvValues, {
                header: true,
                transformHeader: function (h) {
                    return displayNameToName[h];
                },
                transform: (value, header) => {
                    debug('value', value);
                    debug('header', header);
                    let nativeType = nativeTypeByPropertyName[header];
                    if (!nativeType)
                        throw `"${header}" is not a property of "${relatedBusinessObject.pluralDisplayName}"`;
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
                item[relationship.foreignKey] = this.object.id;
                if (item.id) {
                    debug('updating', item);
                    await relatedBusinessObject.class.updateById(item.id, item);
                    debug('updated');
                } else {
                    debug('creating', item);
                    await relatedBusinessObject.class.create(item);
                    debug('created');
                }
            }

            this.object[relationship.name].read();
        };
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
