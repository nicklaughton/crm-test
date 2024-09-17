// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from '../../shared/models/apex-data-object';
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

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-display-name',
    templateUrl: './apex-display-name.component.html',
    styleUrls: ['./apex-display-name.component.scss'],
})
export class ApexDisplayNameComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.setComponent();
        }
    }

    found: boolean;

    displayName: string;

    subscriptions: any[];

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

        private componentFactoryResolver: ComponentFactoryResolver
    ) {}

    @ViewChild('container', { read: ViewContainerRef, static: false } as any)
    container: ViewContainerRef;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.subscriptions = [];

        this.setComponent();
        this._isInitComplete = true;
    }

    async setComponent() {
        let debug = Debug('ApexDisplayName:setComponent');

        debug('this.object', this.object);
        if (this.object) {
            setTimeout(async () => {
                let userInterfaceName =
                    this.object.getMetadata('name') + 'DisplayName';
                debug('userInterfaceName', userInterfaceName);

                let userInterface =
                    await this.apexDesignerUserInterfacesService.byName(
                        userInterfaceName
                    );
                debug('userInterface', userInterface);

                if (userInterface) {
                    let classReference = userInterface.classReference;
                    debug('classReference', classReference);

                    let componentFactory =
                        this.componentFactoryResolver.resolveComponentFactory(
                            classReference
                        );
                    debug('componentFactory', componentFactory);

                    let componentRef =
                        this.container.createComponent(componentFactory);
                    debug('componentRef', componentRef);

                    componentRef['instance']['object'] = this.object;

                    this.found = true;
                } else {
                    this.found = false;
                    if (this.object) {
                        let properties = this.object.getMetadata('properties');
                        let property =
                            properties.find(
                                (property: any) =>
                                    !property.isHidden && !property.isId
                            ) || properties[0];
                        debug('property', property);

                        if (!property) {
                            this.displayName =
                                '(' +
                                userInterfaceName +
                                ' display name property not found)';
                            return;
                        }

                        this.displayName = this.object[property.name];
                        this.watchForChanges;
                        if (!this.displayName) {
                            this.displayName =
                                '(' + property.name + ' does not have a value)';
                        }

                        if (this.object[property.name + 'FormControl'])
                            this.watchForChanges(property.name);
                    }
                }
            });
        }
    }

    watchForChanges(propertyName: string) {
        let debug = Debug('ApexDisplayName:watchForChanges');

        debug('propertyName', propertyName);

        if (!this.object) return;

        if (!this.subscriptions) this.subscriptions = [];

        this.subscriptions.push(
            this.object[propertyName + 'FormControl'].valueChanges.subscribe(
                (value) => {
                    debug('value changed', value);
                    this.displayName = value;
                }
            )
        );
    }

    unsubscribe() {
        while (this.subscriptions && this.subscriptions.length > 0) {
            this.subscriptions.pop().unsubscribe();
        }
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
