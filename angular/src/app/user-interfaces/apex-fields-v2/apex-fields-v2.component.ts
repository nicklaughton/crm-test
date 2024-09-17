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
    selector: 'apex-fields',
    templateUrl: './apex-fields-v2.component.html',
    styleUrls: ['./apex-fields-v2.component.scss'],
})
export class ApexFieldsV2Component implements OnInit, OnDestroy {
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
    excludePropertiesCsv: string;

    @Input()
    includeRelationshipsCsv: string;

    propertyNames: string[];

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

    async addFields() {
        let debug = Debug('ApexFieldsV2:addFields');

        debug('this.widths', this.widths);
        debug('this.allFields', this.allFields);

        const businessObjectName = this.object.getMetadata('name');
        debug('businessObjectName', businessObjectName);

        let businessObject =
            this.apexDesignerBusinessObjectsService[
                this.object.getMetadata('name')
            ];
        debug('businessObject', businessObject);

        let idFields = [];
        for (let property of businessObject.properties) {
            if (property.isId) {
                idFields.push(property.name);
            }
        }
        for (let relationshipName in businessObject.relationships) {
            const relationship = businessObject.relationships[relationshipName];
            if (relationship.type == 'belongs to') {
                idFields.push(relationship.foreignKey);
            }
        }
        debug('idFields', idFields);

        const properties: any[] =
            this.apexDesignerBusinessObjectsService.properties(
                businessObjectName,
                this.allFields,
                this.allFields
            );
        debug('properties %j', properties);

        this.propertyNames = properties.map((property: any) => property.name);
        debug('this.propertyNames', this.propertyNames);

        debug('this.excludePropertiesCsv', this.excludePropertiesCsv);
        if (this.excludePropertiesCsv) {
            for (let excludeName of this.excludePropertiesCsv
                .split(',')
                .map((name: string) => name.trim())) {
                const index = this.propertyNames.indexOf(excludeName);
                if (index != -1) {
                    this.propertyNames.splice(index, 1);
                }
            }
        }
        debug('this.propertyNames after exclusions', this.propertyNames);

        let fields: any = this.object.getOption('fields');
        debug('fields', fields);

        if (fields) {
            if (!Array.isArray(fields)) {
                // If there are "true" entries in the fields object, reset the proeprty names
                for (let name in fields) {
                    if (fields[name] === true) {
                        this.propertyNames = [];
                        break;
                    }
                }
                for (let name in fields) {
                    if (fields[name] === false) {
                        const index = this.propertyNames.indexOf(name);
                        if (index != -1) {
                            this.propertyNames.splice(index, 1);
                        }
                    } else if (fields[name] === true) {
                        this.propertyNames.push(name);
                    }
                }
            } else {
                this.propertyNames = fields.filter(
                    (item: any) => typeof item == 'string'
                );
            }
            debug('this.addFields', this.addFields);
            if (!this.allFields) {
                this.propertyNames = this.propertyNames.filter(
                    (propertyName: string) => !idFields.includes(propertyName)
                );
            }
        }
        debug('this.propertyNames after fields', this.propertyNames);

        debug('this.object', this.object);
        if (this.object) {
            for (let propertyName of this.propertyNames) {
                debug('propertyName', propertyName);

                let property = properties.find(
                    (property: any) => property.name == propertyName
                );
                debug('property', property);

                if (property) {
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

                    const includeRelationshipNames =
                        this.includeRelationshipsCsv
                            .split(',')
                            .map((name: string) => name.trim());
                    debug('includeRelationshipNames', includeRelationshipNames);

                    for (let includeRelationshipName of includeRelationshipNames) {
                        let relationship =
                            businessObject.relationships[
                                includeRelationshipName
                            ];
                        debug('relationship', relationship);

                        if (relationship.type == 'belongs to') {
                            let userInterfaceName =
                                businessObject.name +
                                changeCase
                                    .capitalCase(includeRelationshipName)
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
                                    foreignKey = includeRelationshipName + 'Id';
                                    debug('revised foreignKey', foreignKey);
                                }
                                let control =
                                    this.object[foreignKey + 'FormControl'];
                                this.addField(
                                    control,
                                    userInterface,
                                    changeCase.capitalCase(
                                        includeRelationshipName
                                    ),
                                    relationship.businessObject.name
                                );
                            }
                        }
                        if (relationship.type == 'has many') {
                            let userInterfaceName =
                                businessObject.name +
                                changeCase
                                    .capitalCase(includeRelationshipName)
                                    .replace(/ /g, '') +
                                'Section';
                            debug('userInterfaceName', userInterfaceName);

                            let userInterface =
                                await this.apexDesignerUserInterfacesService.byName(
                                    userInterfaceName
                                );
                            debug('userInterface', userInterface);

                            if (userInterface) {
                                let control = this.object[relationship.name];
                                this.addField(
                                    control,
                                    userInterface,
                                    changeCase.capitalCase(
                                        includeRelationshipName
                                    ),
                                    relationship.businessObject.name
                                );
                            }
                        }
                    }
                    debug('this.propertyNames', this.propertyNames);

                    this.setWidths();
                });
            }
            debug('this.propertyNames', this.propertyNames);

            this.setWidths();
        }
    }

    addField(
        control: any,
        userInterface: any,
        label: string,
        businessObjectName?: string
    ) {
        let debug = Debug('ApexFieldsV2:addField');

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
        } else if (control && typeof control == 'object' && control.formArray) {
            componentRef['instance']['array'] = control;
        } else {
            window['exceptionControl'] = control;
            throw `unsupported control type`;
        }
    }

    setWidths() {
        let debug = Debug('ApexFieldsV2:setWidths');

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
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
