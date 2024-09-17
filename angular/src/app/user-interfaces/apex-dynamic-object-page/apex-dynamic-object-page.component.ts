// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import * as changeCase from 'change-case';

import { NavigationEnd, ActivatedRoute, Params, Router } from '@angular/router';

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

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-dynamic-object-page',
    templateUrl: './apex-dynamic-object-page.component.html',
    styleUrls: ['./apex-dynamic-object-page.component.scss'],
    host: { class: ' apex-designer-page' },
})
export class ApexDynamicObjectPageComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    subscription: any;

    businessObjectName: string;

    id: any;

    notFound: boolean;

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
    ) {
        this.apexDesignerUserInterfacesService.setCurrentUserInterfaceId(71279);
    }

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.initialize();
        this._isInitComplete = true;
    }

    initialize() {
        let debug = Debug('ApexDynamicObjectPage:initialize');

        this.unsubscribe();
        this.subscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                debug('event', event);
                this.processPath();
            }
        });
        debug('subscribed');
        this.processPath();
    }

    processPath() {
        let debug = Debug('ApexDynamicObjectPage:processPath');

        debug('this.router.url', this.router.url);

        this.id = null;
        this.businessObjectName = null;
        this.notFound = null;

        let levels = this.router.url.split('/');
        levels.shift(); // remove the empty string from the first slash
        debug('levels', levels);

        let excludeNames = ['User', 'Role', 'AppUser', 'AppUserToRole'];

        debug('excludeNames', excludeNames);
        if (levels[0] === '' || (levels[0] && levels[0].startsWith('?'))) {
            // find the business object in current project without a parent
            let businessObject = this.apexDesignerBusinessObjectsService
                .list()
                .reverse()
                .find((businessObject: any) => {
                    if (
                        excludeNames.includes(businessObject.name) ||
                        businessObject.isClientSideOnly ||
                        businessObject.nativeType
                    ) {
                        return;
                    }
                    let hasParent = false;
                    for (let name in businessObject.relationships) {
                        if (
                            businessObject.relationships[name].type ==
                            'belongs to'
                        ) {
                            hasParent = true;
                            break;
                        }
                    }
                    return !hasParent;
                });
            debug('businessObject', businessObject);
            if (businessObject) {
                this.router.navigateByUrl(
                    '/' + changeCase.camelCase(businessObject.pluralName)
                );
            }
        } else {
            this.id = levels[1]; // may be undefined

            debug('this.id', this.id);
            for (let businessObject of this.apexDesignerBusinessObjectsService.list()) {
                if (
                    businessObject.pluralName.toLowerCase() ==
                    levels[0].toLowerCase()
                ) {
                    this.businessObjectName = businessObject.name;
                    debug('this.businessObjectName', this.businessObjectName);
                    break;
                }
            }

            if (!this.businessObjectName) this.notFound = true;
        }
    }

    unsubscribe() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
