// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from '../../shared/models/apex-data-object';
import * as changeCase from 'change-case';

import {
    ComponentFactoryResolver,
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

import { ApexFormControl } from '../../shared/models/apex-form-control';

import { ApexDesignerBusinessObjectsService } from '../../shared/services/apex-designer-business-objects.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-fields-deprecated',
    templateUrl: './apex-fields.component.html',
    styleUrls: ['./apex-fields.component.scss'],
})
export class ApexFieldsComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.addFields();
        }
    }

    @Input()
    allFields: boolean;

    @Input()
    widths: string;

    @Input()
    label: string;

    @Input()
    headingLevel: number = 2;

    @Input()
    disabled: boolean;

    @Input()
    excludePropertyNames: string[];

    @Input()
    excludePropertiesCsv: string;

    propertyNames: string[];

    @Input()
    includeRelationshipsCsv: string;

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

        private componentFactoryResolver: ComponentFactoryResolver,
        private apexDesignerBusinessObjectsService: ApexDesignerBusinessObjectsService
    ) {}

    @ViewChild('container', { read: ViewContainerRef, static: false } as any)
    container: ViewContainerRef;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.addFields();
        this._isInitComplete = true;
    }

    addFields() {
        let debug = Debug('ApexFields:addFields');

        debug('this.widths', this.widths);
        debug('this.allFields', this.allFields);

        if (this.excludePropertiesCsv) {
            this.excludePropertyNames = this.excludePropertiesCsv
                .split(',')
                .map((name: string) => name.trim());
        }

        debug('this.object', this.object);
        if (this.object) {
            this.propertyNames = [];
            let properties: any[] =
                this.apexDesignerBusinessObjectsService.properties(
                    this.object.getMetadata('name'),
                    this.allFields,
                    this.allFields
                );
            debug('properties %j', properties);

            let count = 0;

            for (let property of properties) {
                debug('property', property);
                if (
                    !this.excludePropertyNames ||
                    !this.excludePropertyNames.includes(property.name)
                ) {
                    this.propertyNames.push(property.name);
                    let control: any =
                        this.object[property.name + 'FormControl'];
                    if (control) {
                        if (property.isId) control.disable();
                        if (!control.name) control.name = property.name;
                        if (!control.displayName)
                            control.displayName = property.displayName;
                        if (!control.typeName)
                            control.typeName = property.type.name;
                    }
                }
            }

            debug('this.includeRelationshipsCsv', this.includeRelationshipsCsv);
            if (this.includeRelationshipsCsv) {
                setTimeout(async () => {
                    debug('this.container', this.container);
                    this.container.clear();

                    let relationNames = this.includeRelationshipsCsv
                        .split(',')
                        .map((name: string) => name.trim());
                    debug('relationNames', relationNames);

                    let businessObject =
                        this.apexDesignerBusinessObjectsService[
                            this.object.getMetadata('name')
                        ];
                    debug('businessObject', businessObject);
                    for (let relationName of relationNames) {
                        let relationship =
                            businessObject.relationships[relationName];
                        debug('relationship', relationship);
                        if (
                            !this.excludePropertyNames ||
                            !this.excludePropertyNames.includes(relationName)
                        ) {
                            if (relationship.type == 'belongs to') {
                                let userInterfaceName =
                                    businessObject.name +
                                    changeCase
                                        .capitalCase(relationName)
                                        .replace(/ /g, '') +
                                    'Field';
                                debug('userInterfaceName', userInterfaceName);

                                let userInterface =
                                    await this.apexDesignerUserInterfacesService.byName(
                                        userInterfaceName
                                    );
                                debug('userInterface', userInterface);

                                if (!userInterface) {
                                    userInterface =
                                        await this.apexDesignerUserInterfacesService.byName(
                                            'ApexBelongsToField'
                                        );

                                    debug('userInterface', userInterface);
                                }
                                if (userInterface) {
                                    let foreignKey = relationship.foreignKey;
                                    debug('foreignKey', foreignKey);
                                    if (!foreignKey || foreignKey === 'null') {
                                        foreignKey = relationName + 'Id';
                                        debug('revised foreignKey', foreignKey);
                                    }
                                    let control =
                                        this.object[foreignKey + 'FormControl'];
                                    this.addField(
                                        control,
                                        userInterface,
                                        changeCase.capitalCase(relationName),
                                        relationship.businessObject.name
                                    );
                                    count++;
                                }
                            }
                        }
                    }
                });
            }

            debug('this.widths', this.widths);
            if (!this.widths) {
                if (this.propertyNames.length == 1) {
                    this.widths = '100';
                } else if (this.propertyNames.length == 2) {
                    this.widths = '100 100 50';
                } else if (this.propertyNames.length == 3) {
                    this.widths = '100 100 33';
                } else if (this.propertyNames.length == 5) {
                    this.widths = '100 100 50 20';
                } else {
                    this.widths = '100 100 50 25';
                }
                debug('this.widths', this.widths);
            }
            debug('this.propertyNames', this.propertyNames);
        }
    }

    addField(
        control: any,
        userInterface: any,
        label: string,
        businessObjectName?: string
    ) {
        let debug = Debug('ApexFields:addField');

        debug('control', control);
        debug('userInterface', userInterface);

        let classReference = userInterface.classReference;
        debug('classReference', classReference);

        let componentFactory =
            this.componentFactoryResolver.resolveComponentFactory(
                classReference
            );
        debug('componentFactory', componentFactory);

        let componentRef = this.container.createComponent(componentFactory);
        debug('componentRef', componentRef);

        componentRef['instance']['label'] = label;
        componentRef['instance']['noPadding'] = true;
        componentRef['instance']['disabled'] = this.disabled;
        if (businessObjectName) {
            if (userInterface.name == 'ApexSelectField') {
                let baseType =
                    this.apexDesignerBusinessObjectsService[businessObjectName];
                componentRef['instance']['options'] = baseType.validValues;
                componentRef['instance']['displayPropertyName'] = 'displayName';
                componentRef['instance']['valuePropertyName'] = 'value';
            } else {
                componentRef['instance']['businessObjectName'] =
                    businessObjectName;
            }
        }

        if (control instanceof ApexFormControl) {
            componentRef['instance']['control'] = control;
        } else if (control && typeof control == 'object' && control.formGroup) {
            componentRef['instance']['object'] = control;
        } else {
            throw `unsupported control type`;
        }
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
