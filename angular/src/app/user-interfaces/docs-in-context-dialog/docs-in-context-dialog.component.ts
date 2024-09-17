// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { DomSanitizer } from '@angular/platform-browser';

import {
    NgZone,
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

import { Location } from '@angular/common';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { MatDialogRef } from '@angular/material/dialog';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'docs-in-context-dialog',
    templateUrl: './docs-in-context-dialog.component.html',
    styleUrls: ['./docs-in-context-dialog.component.scss'],
})
export class DocsInContextDialogComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    docSiteUrl: string;

    @Input()
    pages: any[];

    currentPage: any;

    @Input()
    label: string;

    safeUrl: any;

    loading: boolean;

    history: any[];

    @Input()
    openAutomatically: boolean;

    @Input()
    readPaths: any;

    @Input()
    showRead: boolean;

    @Input()
    welcome: string;

    @Output() openAutomaticallyChange: EventEmitter<boolean> = new EventEmitter(
        true
    );

    @Output() showReadChange: EventEmitter<boolean> = new EventEmitter(true);

    @Output() updateList: EventEmitter<void> = new EventEmitter(true);

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

        private domSanitizer: DomSanitizer,
        private ngZone: NgZone,
        private location: Location,
        public dialog: MatDialogRef<DocsInContextDialogComponent>
    ) {}

    @ViewChild('iframe', { static: false } as any) iframe;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.setDialogSize();
        this.handleIframeResize();
        this._isInitComplete = true;
    }

    setDialogSize() {
        this.dialog.updateSize('500px', '');
    }

    handleIframeResize() {
        let debug = Debug('DocsInContextDialog:handleIframeResize');

        this.ngZone.runOutsideAngular(async () => {
            window.addEventListener('message', (event) => {
                debug('event.origin', event.origin);
                debug(
                    'this.safeUrl.changingThisBreaksApplicationSecurity',
                    this.safeUrl?.changingThisBreaksApplicationSecurity
                );
                if (
                    this.safeUrl?.changingThisBreaksApplicationSecurity?.startsWith(
                        event.origin
                    )
                ) {
                    this.ngZone.run(() => {
                        debug('event.data', event.data);

                        if (!this.currentPage) return;
                        this.currentPage = JSON.parse(
                            JSON.stringify(this.currentPage)
                        );
                        delete this.currentPage.id;
                        for (let name in event.data) {
                            this.currentPage[name] = event.data[name];
                        }

                        if (
                            this.history &&
                            this.history[this.history.length - 1].path !=
                                this.currentPage.path
                        )
                            this.history.push(this.currentPage);
                        debug('this.history', this.history);

                        debug('this.iframe', this.iframe);
                        debug(
                            'this.iframe.nativeElement',
                            this.iframe.nativeElement
                        );
                        if (this.iframe?.nativeElement?.style) {
                            this.iframe.nativeElement.style.height =
                                event.data.height + 'px';
                            debug(
                                'this.iframe.nativeElement.style.height',
                                this.iframe.nativeElement.style.height
                            );
                            this.loading = false;
                        }
                    });
                }
            });
        });
    }

    handleMouseEnter(page: any) {
        let debug = Debug('DocsInContextDialog:handleMouseEnter');

        debug('page', page);
        page.element?.classList.add('docsInContext');
    }

    handleMouseLeave(page: any) {
        let debug = Debug('DocsInContextDialog:handleMouseLeave');

        debug('page', page);
        page.element?.classList.remove('docsInContext');
    }

    setCurrentPage(page: any) {
        let debug = Debug('DocsInContextDialog:setCurrentPage');

        this.loading = true;

        debug('page', page);
        this.currentPage = JSON.parse(JSON.stringify(page));

        this.history = [this.currentPage];
        debug('this.history', this.history);

        this.safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
            this.docSiteUrl + this.currentPage.path
        );
        debug('this.safeUrl', this.safeUrl);

        this.markPathRead(page.path);
    }

    back() {
        let debug = Debug('DocsInContextDialog:back');

        this.history.pop();
        debug('this.history', this.history);

        if (this.history.length) {
            this.loading = true;

            this.currentPage = this.history[this.history.length - 1];

            this.safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.docSiteUrl + this.currentPage.path
            );
            debug('this.safeUrl', this.safeUrl);
        } else {
            this.currentPage = null;
        }
        debug('this.currentPage', this.currentPage);
    }

    markPathRead(path: string) {
        let debug = Debug('DocsInContextDialog:markPathRead');

        debug('path', path);
        if (!this.readPaths[path]) {
            this.readPaths[path] = 1;
            debug('this.readPaths', this.readPaths);

            this.saveReadPaths();
            debug('saved');

            this.updateList.emit();
        }
    }

    markAllRead() {
        for (let page of this.pages) {
            this.readPaths[page.path] = 1;
        }
        this.saveReadPaths();

        this.updateList.emit();
    }

    markPathUnread(path: string) {
        let debug = Debug('DocsInContextDialog:markPathUnread');

        debug('path', path);
        if (this.readPaths[path]) {
            delete this.readPaths[path];
            debug('this.readPaths', this.readPaths);
            this.saveReadPaths();
        }
        this.updateList.emit();
    }

    saveReadPaths() {
        let debug = Debug('DocsInContextDialog:saveReadPaths');

        localStorage.setItem(
            'docsInContextReadPaths',
            JSON.stringify(this.readPaths)
        );
        debug('saved');
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
