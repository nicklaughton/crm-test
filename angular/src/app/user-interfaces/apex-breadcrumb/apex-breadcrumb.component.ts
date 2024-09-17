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
    selector: 'apex-breadcrumb',
    templateUrl: './apex-breadcrumb.component.html',
    styleUrls: ['./apex-breadcrumb.component.scss'],
})
export class ApexBreadcrumbComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    levels: any[];

    subscription: any;

    @Input()
    gap: number = 0;

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

        this.setLevels();
        this._isInitComplete = true;
    }

    async setLevels() {
        let debug = Debug('ApexBreadcrumb:setLevels');

        this.unSubscribe();

        this.levels = [];

        this.subscription =
            this.apexDesignerUserInterfacesService.currentUserInterfaceId.subscribe(
                async (userInterfaceId: number) => {
                    debug('userInterfaceId', userInterfaceId);

                    while (userInterfaceId) {
                        let userInterface =
                            await this.apexDesignerUserInterfacesService.byId(
                                userInterfaceId
                            );
                        debug('userInterface', userInterface);

                        let level = this.levelForUserInterface(userInterface);
                        debug('level', level);

                        this.levels.unshift(level);

                        userInterfaceId = userInterface.parentUserInterfaceId;
                    }

                    debug('this.levels', this.levels);
                }
            );
    }

    levelForUserInterface(userInterface: any) {
        let debug = Debug('ApexBreadcrumb:levelForUserInterface');

        debug('userInterface', userInterface);

        let level: any = {};

        let pathLevels = userInterface.path.split('/');
        debug('pathLevels', pathLevels);

        let lastLevel = pathLevels[pathLevels.length - 1];
        debug('lastLevel', lastLevel);

        if (lastLevel.startsWith(':')) {
            let propertyName = lastLevel.split(':')[1].split('.')[0];
            debug('propertyName', propertyName);

            debug('userInterface.properties', userInterface.properties);
            let property = userInterface.properties.find(
                (property: any) => property.name == propertyName
            );
            debug('property', property);

            let businessObject =
                this.apexDesignerBusinessObjectsService[property.type.name];
            debug('businessObject', businessObject);

            let displayNameProperty =
                businessObject?.properties?.length > 0
                    ? businessObject.properties[0].name
                    : 'id';
            debug('displayNameProperty', displayNameProperty);

            let id = this.router.url.split('/')[pathLevels.length - 1];
            debug('id', id);

            const idPropertyObject = businessObject?.properties?.find(
                (property: any) => property.isId
            );

            let idProperty =
                (idPropertyObject && idPropertyObject.name) || 'id';
            debug('idProperty', idProperty);

            let boInstance = new businessObject.formGroupClass(
                { [idProperty]: id },
                {
                    read: 'On Demand',
                    save: 'Never',
                    readConfig: {
                        fields: ['id', displayNameProperty],
                    },
                }
            );
            debug('boInstance', boInstance);

            let formGroup = boInstance.formGroup;
            debug('formGroup', formGroup);

            let skipAnchor = this.levels.length == 0;

            boInstance.read().then(() => {
                debug('boInstance', boInstance);
                let displayName = boInstance[displayNameProperty];
                debug('displayName', displayName);
                level.object = boInstance;
                debug('level.object', level.object);
                if (skipAnchor) {
                    level.tooltip = `This page is ${businessObject.displayName} "${displayName}"`;
                } else {
                    level.tooltip = `Open ${businessObject.displayName} "${displayName}"`;
                }
            });

            if (!skipAnchor) {
                level.routerLink = this.router.url
                    .split('/')
                    .slice(0, pathLevels.length)
                    .join('/');
            }
        } else {
            level.displayName = userInterface.displayName;
            if (this.levels.length > 0) {
                level.tooltip = 'Open ' + level.displayName;
                level.routerLink = this.router.url
                    .split('/')
                    .slice(0, pathLevels.length)
                    .join('/');
            }
        }

        if (level.routerLink && level.routerLink.includes('?'))
            level.routerLink = level.routerLink.split('?')[0];

        debug('level', level);
        return level;
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
