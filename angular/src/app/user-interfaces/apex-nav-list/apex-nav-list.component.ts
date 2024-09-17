// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';
import * as changeCase from 'change-case';

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
    selector: 'apex-nav-list',
    templateUrl: './apex-nav-list.component.html',
    styleUrls: ['./apex-nav-list.component.scss'],
})
export class ApexNavListComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    array: ApexDataArray;

    @Input()
    propertyName: string;

    @Input()
    routePrefix: string;

    @Input()
    allowDelete: boolean;

    sortable: boolean;

    @Input()
    label: string;

    @Input()
    headingLevel: number = 2;

    @Input()
    queryParamName: string;

    @Input()
    routeFunction: any;

    @Input()
    queryParamFunction: any;

    @Input()
    deleteIconName: string;

    idPropertyName: string;

    @Input()
    noItemsMessage: string;

    /******************************************************/

    constructor(
        private httpClient: HttpClient,
        public route: ActivatedRoute,
        public router: Router,
        public translate: TranslateService,
        private apexDesignerEditService: ApexDesignerEditService,
        private viewContainerRef: ViewContainerRef,
        @Inject(forwardRef(() => ApexDesignerUserInterfacesService))
        public apexDesignerUserInterfacesService: any
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.setDefaultRoutePrefix();
        this.setIdPropertyName();
        this.setSortable();
        this._isInitComplete = true;
    }

    setDefaultRoutePrefix() {
        let debug = Debug('ApexNavList:setDefaultRoutePrefix');

        debug('this.array', this.array);

        debug('this.routePrefix', this.routePrefix);
        if (!this.routePrefix) {
            let lastLevel = this.router.url.split('/').pop().split('?')[0];
            debug('lastLevel', lastLevel);

            let desiredLastLevel = changeCase.camelCase(
                this.array.getMetadata('pluralName')
            );
            debug('desiredLastLevel', desiredLastLevel);

            if (lastLevel != desiredLastLevel) {
                this.routePrefix = desiredLastLevel + '/';
                debug('this.routePrefix', this.routePrefix);
            }
        }
    }

    setIdPropertyName() {
        let debug = Debug('ApexNavList:setIdPropertyName');

        debug('this.array', this.array);
        let idProperty = this.array
            .getMetadata('properties')
            .find((property: any) => property.isId);
        debug('idProperty', idProperty);
        if (idProperty) {
            this.idPropertyName = idProperty.name;
        } else {
            this.idPropertyName = 'id';
        }
    }

    setSortable() {
        let debug = Debug('ApexNavList:setSortable');

        let sequenceProperty = this.array
            .getMetadata('properties')
            .find((property: any) => property.name == 'sequence');
        debug('sequenceProperty', sequenceProperty);
        this.sortable = sequenceProperty;
        debug('this.sortable', this.sortable);
        this.sortAndUpdate();
    }

    drop(event: any) {
        let debug = Debug('ApexNavList:drop');

        debug('event', event);
        debug('event.item.data.sequence before', event.item.data.sequence);
        if (event.currentIndex > event.previousIndex) {
            event.item.data.sequence = event.currentIndex + 0.5;
        } else {
            event.item.data.sequence = event.currentIndex - 0.5;
        }
        debug('event.item.data.sequence after', event.item.data.sequence);
        this.sortAndUpdate();
    }

    sortAndUpdate() {
        let debug = Debug('ApexNavList:sortAndUpdate');

        if (this.sortable) {
            debug('this.array', this.array);
            for (let item of this.array) {
                debug('item.sequence', item.sequence);
            }
            this.array.sort((a, b) => {
                if (a.sequence > b.sequence) return 1;
                if (a.sequence < b.sequence) return -1;
                return 0;
            });
            for (let item of this.array) {
                debug('item.sequence', item.sequence);
            }
            for (let i = 0; i < this.array.length; i++) {
                this.array[i].sequence = i;
            }
            for (let item of this.array) {
                debug('item.sequence', item.sequence);
            }
        }
    }

    getRouterLink(item: any) {
        let routerLink = '';
        if (this.routeFunction) {
            routerLink = this.routeFunction(item);
        } else if (this.routePrefix) {
            routerLink = this.routePrefix;
        }
        if (!this.routeFunction && !this.queryParamName) {
            routerLink += String(item[this.idPropertyName]);
        }
        return routerLink;
    }

    getQueryParams(item: any) {
        let queryParams = {};
        if (this.queryParamName) {
            if (this.queryParamFunction) {
                queryParams[this.queryParamName] =
                    this.queryParamFunction(item);
            } else {
                queryParams[this.queryParamName] = item.id;
            }
        }
        return queryParams;
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
