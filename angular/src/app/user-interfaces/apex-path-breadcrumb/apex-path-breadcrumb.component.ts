// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from '../../shared/models/apex-data-object';
import * as changeCase from 'change-case';

import { ApexDesignerBusinessObjectsService } from '../../shared/services/apex-designer-business-objects.service';

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

import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-path-breadcrumb',
    templateUrl: './apex-path-breadcrumb.component.html',
    styleUrls: ['./apex-path-breadcrumb.component.scss'],
})
export class ApexPathBreadcrumbComponent implements OnInit, OnDestroy {
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
            if (this._isInitComplete) this.watchObject();
        }
    }

    levels: any[];

    subscriptions: any[];

    message: string;

    @Input()
    pathRelationshipNames: string[];

    @Input()
    extraLevelLabel: string;

    @Input()
    includeType: boolean;

    @Input()
    extraLevelType: string;

    @Input()
    skipTopLevel: boolean;

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

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.subscriptions = [];

        this.watchObject();
        this._isInitComplete = true;
    }

    watchObject() {
        let debug = Debug('ApexPathBreadcrumb:watchObject');

        debug('this.object', this.object);

        this.unsubscribe();

        this.subscriptions.push(
            this.object.statusChanges.subscribe((status) => {
                debug('status', status);
                if (status == 'READ') {
                    this.prepareLevels();
                }
            })
        );

        if (!this.object.reading) {
            this.prepareLevels();
        }
    }

    async prepareLevels() {
        let debug = Debug('ApexPathBreadcrumb:prepareLevels');

        debug('this.object', this.object);

        if (!this.object) {
            this.message = `Please update the page to pass your object or array to the Path Breadcrumb component.`;
            return;
        }

        let plainObject = this.object.toJSON();
        debug('plainObject', plainObject);

        let objectsByLevel = [this.object];
        this.message = null;

        let path = this.pathRelationshipNames
            ? this.pathRelationshipNames
            : this.pathToRootObjectService.pathToRoot(
                  this.object.getMetadata('name')
              );
        debug('path', path);

        let currentObject = this.object;
        let currentPlainObject = plainObject;

        for (let parent of path) {
            if (!currentPlainObject[parent]) {
                let includes =
                    this.pathToRootObjectService.includesFromPath(path);
                debug('includes', includes);
                this.message = `Please update your ${this.object.getMetadata(
                    'displayName'
                )} read config to include the parents: ${JSON.stringify({
                    include: includes,
                })}`;
                break;
            }
            objectsByLevel.unshift(currentObject[parent]);
            currentObject = currentObject[parent];
            currentPlainObject = currentPlainObject[parent];
        }

        if (!this.message) {
            this.levels = objectsByLevel;
            debug('this.levels', this.levels);

            if (this.extraLevelLabel) this.levels.push(this.extraLevelLabel);
        }
    }

    camelCase(value: string) {
        return changeCase.camelCase(value);
    }

    unsubscribe() {
        while (this.subscriptions.length > 0) {
            this.subscriptions.pop().unsubscribe();
        }
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
