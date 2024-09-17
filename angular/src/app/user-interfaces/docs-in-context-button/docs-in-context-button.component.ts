// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { NavigationEnd, ActivatedRoute, Params, Router } from '@angular/router';

import {
    NgZone,
    ElementRef,
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

import { PackageService } from '../../shared/services/package.service';

import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'docs-in-context-button',
    templateUrl: './docs-in-context-button.component.html',
    styleUrls: ['./docs-in-context-button.component.scss'],
})
export class DocsInContextButtonComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    label: string = 'Help Docs';

    @Input()
    appVersion: string;

    @Input()
    docSiteUrl: string;

    @Input()
    appName: string;

    pages: any[];

    pathMatchPages: any[];

    selectorMatchPages: any[];

    showPages: any[];

    subscriptions: any[];

    @Input()
    dialogOpen: boolean;

    private _openAutomatically: boolean;

    get openAutomatically(): boolean {
        return this._openAutomatically;
    }

    set openAutomatically(value: boolean) {
        if (value != this._openAutomatically) {
            this._openAutomatically = value;
            if (this._isInitComplete) this.saveOpenAutomatically();
        }
    }

    readPaths: any;

    unreadCount: number;

    private _showRead: boolean;

    get showRead(): boolean {
        return this._showRead;
    }

    set showRead(value: boolean) {
        if (value != this._showRead) {
            this._showRead = value;
            if (this._isInitComplete) this.applyReadPages();
        }
    }

    @Input()
    iconName: string = 'help_center';

    @Input()
    position: any = { right: '16px', top: '84px' };

    @Input()
    welcome: string =
        'This dialog shows you the help documentation for the current context. You can leave it open while you navigate around the app or close it. You can reopen it at any time by clicking the Help Docs icon.';

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

        private ngZone: NgZone,
        private packageService: PackageService,
        public apexDynamicComponentsService: ApexDynamicComponentsService,
        private elementRef: ElementRef
    ) {}

    @ViewChild('dialog', { static: false } as any) dialog;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.pages = [];

        this.pathMatchPages = [];

        this.selectorMatchPages = [];

        this.subscriptions = [];

        this.setFixedWidth();
        this.getOpenAutomatically();
        this.getReadPaths();
        this.getPages();
        this._isInitComplete = true;
    }

    setFixedWidth() {
        let debug = Debug('DocsInContextButton:setFixedWidth');

        this.apexDynamicComponentsService.setFixedWidth(
            this.elementRef.nativeElement,
            '40px'
        );
        debug('width set');
    }

    getOpenAutomatically() {
        let debug = Debug('DocsInContextButton:getOpenAutomatically');

        this.openAutomatically =
            (localStorage.getItem('docsInContextOpenAutomatically') ||
                'true') == 'true';
        debug('this.openAutomatically', this.openAutomatically);
    }

    getReadPaths() {
        let debug = Debug('DocsInContextButton:getReadPaths');

        this.readPaths = JSON.parse(
            localStorage.getItem('docsInContextReadPaths') || '{}'
        );
        debug('this.readPaths', this.readPaths);
    }

    async getPages() {
        let debug = Debug('DocsInContextButton:getPages');

        if (!this.docSiteUrl.endsWith('/')) this.docSiteUrl += '/';
        debug('this.docSiteUrl', this.docSiteUrl);

        if (!this.appVersion)
            this.appVersion = await this.packageService.version;
        let url = this.docSiteUrl + 'api/Pages/forContext';

        const includeDrafts =
            localStorage.getItem('docsInContextIncludeDrafts') == 'true';
        debug('includeDrafts', includeDrafts);

        debug('url', url);
        let paramString = `appName=${this.appName}&appVersion=${this.appVersion}&includeDrafts=${includeDrafts}`;
        debug('paramString', paramString);

        this.pages = (await this.httpClient
            .get(url + '?' + paramString)
            .toPromise()) as any[];

        debug('this.pages', this.pages);

        this.watchRoute();

        if (this.openAutomatically) {
            this.dialogOpen = true;
        }
    }

    watchRoute() {
        let debug = Debug('DocsInContextButton:watchRoute');

        debug('subscribing');
        this.subscriptions.push(
            this.router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.applyRoute();
                }
            })
        );
        this.applyRoute();
        this.startCheckInterval();
    }

    startCheckInterval() {
        this.ngZone.runOutsideAngular(async () => {
            setInterval(() => {
                this.ngZone.run(() => {
                    this.applySelector();
                });
            }, 3000);
        });
    }

    applyRoute() {
        let debug = Debug('DocsInContextButton:applyRoute');

        debug('this.router.url', this.router.url);
        let urlParts = this.router.url.split(/[#?]/);
        let cleanUrl = urlParts[0];
        debug('cleanUrl', cleanUrl);

        this.pathMatchPages = this.pages.filter((page: any) =>
            this.pathMatch(cleanUrl, page.contextPathExpression)
        );
        debug('this.pathMatchPages', this.pathMatchPages);

        this.applySelector();
    }

    async applySelector() {
        let debug = Debug('DocsInContextButton:applySelector');

        debug('this.showRead', this.showRead);

        this.selectorMatchPages = this.pathMatchPages.filter((page: any) => {
            if (!page.contextSelector) return true;
            page.element = document.querySelector(page.contextSelector);
            return !!page.element;
        });
        debug('this.selectorMatchPages', this.selectorMatchPages);

        this.applyReadPages();
    }

    applyReadPages() {
        let debug = Debug('DocsInContextButton:applyReadPages');

        debug('this.showRead', this.showRead);
        debug('this.readPaths', this.readPaths);
        this.showPages = this.selectorMatchPages.filter(
            (page: any) => this.showRead || this.readPaths[page.path] != 1
        );
        debug('this.showPages', this.showPages);

        this.unreadCount = this.showPages.filter(
            (page: any) => this.readPaths[page.path] != 1
        ).length;
        debug('this.unreadCount', this.unreadCount);
    }

    pathMatch(path: string, pathExpression: string): boolean {
        let debug = Debug('DocsInContextButton:pathMatch');

        if (!pathExpression) return false;

        let pathLevels = path.split('/');
        debug('pathLevels', pathLevels);

        let pathExpressionLevels = pathExpression.split('/');
        debug('pathExpressionLevels', pathExpressionLevels);

        if (pathLevels.length != pathExpressionLevels.length) return false;

        for (let i = 0; i < pathLevels.length; i++) {
            if (
                pathExpressionLevels[i] != '*' &&
                pathExpressionLevels[i] != pathLevels[i]
            )
                return false;
        }

        return true;
    }

    unsubscribe() {
        while (this.subscriptions.length > 0) {
            this.subscriptions.pop().unsubscribe();
        }
    }

    saveOpenAutomatically() {
        let debug = Debug('DocsInContextButton:saveOpenAutomatically');

        debug('this.openAutomatically', this.openAutomatically);
        localStorage.setItem(
            'docsInContextOpenAutomatically',
            this.openAutomatically ? 'true' : 'false'
        );
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
