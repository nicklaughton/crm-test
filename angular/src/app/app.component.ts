// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { PackageService } from './shared/services/package.service';

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

import { ApexDynamicComponentsService } from './shared/services/apex-dynamic-components.service';

import { ApexDesignerCustomElementsService } from './shared/services/apex-designer-custom-elements.service';

import { MetaTagService } from './shared/services/meta-tag.service';

import { AuthService } from './shared/services/auth.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateService } from './shared/services/translate.service';
import { ApexDesignerEditService } from './shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from './shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    rootPages: any[];

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

        public packageService: PackageService,
        private componentFactoryResolver: ComponentFactoryResolver,
        public apexDynamicComponentsService: ApexDynamicComponentsService,
        private apexDesignerCustomElementsService: ApexDesignerCustomElementsService,
        private metaTagService: MetaTagService,
        private authService: AuthService
    ) {}

    @ViewChild('container', { read: ViewContainerRef, static: false } as any)
    container: ViewContainerRef;

    @ViewChild('sidenav', { static: false } as any) sidenav;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.prepareRootPages();
        this.addToolbarComponents();
        this._isInitComplete = true;
    }

    async prepareRootPages() {
        let debug = Debug('App:prepareRootPages');

        debug(
            'this.apexDesignerUserInterfacesService',
            this.apexDesignerUserInterfacesService
        );
        const userInterfaces =
            await this.apexDesignerUserInterfacesService.listAsync();

        this.rootPages = [];
        let pages = userInterfaces
            .map((item) => {
                debug('item', item);
                if (item.path && item.path.endsWith('/**')) {
                    let levels = item.path.split('/');
                    levels.pop();
                    item.path = levels.join('/');
                    debug('item.path', item.path);
                }
                if (item.sidenavIconName?.includes('.')) {
                    item.sidenavImageName = item.sidenavIconName;
                    item.sidenavIconName = null;
                }
                return item;
            })
            .filter(
                (item) =>
                    item.path &&
                    item.path.split('/').length == 2 &&
                    !item.excludeFromSidenav
            );

        if (pages.length == 0) {
            this.rootPages.push({
                displayName: 'Home',
                path: '/',
                sidenavIconName: 'home',
            });
        } else {
            for (let page of pages) {
                let hasAccess = await this.hasAccessToPage(page);
                if (hasAccess) {
                    this.rootPages.push(page);
                }
            }
        }

        this.rootPages.sort((a, b) => {
            if (a.sequence < b.sequence) return -1;
            if (a.sequence > b.sequence) return 1;
        });
        debug('this.rootPages', this.rootPages);
    }

    addToolbarComponents() {
        let debug = Debug('App:addToolbarComponents');

        setTimeout(() => {
            let toolbarComponentNames = this.apexDesignerUserInterfacesService
                .list()
                .map((userInterface: any) => userInterface.name)
                .filter((name: string) => name.startsWith('Toolbar'));

            toolbarComponentNames.sort();
            debug('toolbarComponentNames', toolbarComponentNames);

            for (let name of toolbarComponentNames) {
                let userInterface =
                    this.apexDesignerUserInterfacesService.fromName(name);
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
                }
            }
        });
    }

    async hasAccessToPage(page: any) {
        let debug = Debug('App:hasAccessToPage');

        debug('page', page);

        let isAuthenticated = await this.authService.isAuthenticated();
        debug('isAuthenticated', isAuthenticated);

        let hasAccess;

        if (page.authNotRequired) {
            hasAccess = true;
        } else if (!page.accessRules.length) {
            debug('Everyone has access');

            hasAccess = true;
        } else if (isAuthenticated) {
            if (page.accessRules[0].hasAccess) {
                debug('Certain teams have access');
            } else {
                debug('Certain teams do not have access');
            }

            hasAccess = !page.accessRules[0].hasAccess;
            for (let accessRule of page.accessRules) {
                let role = accessRule.team.name;
                debug('role', role);
                let hasRole = await this.authService.hasRole(role);
                debug('hasRole', hasRole);

                if (hasRole) {
                    hasAccess = page.accessRules[0].hasAccess;
                    break;
                }
            }
        } else {
            hasAccess = false;
        }

        debug('hasAccess', hasAccess);
        return hasAccess;
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
