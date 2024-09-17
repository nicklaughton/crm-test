// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
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

import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-wrap-deprecated',
    templateUrl: './apex-wrap-deprecated.component.html',
    styleUrls: ['./apex-wrap-deprecated.component.scss'],
})
export class ApexWrapDeprecatedComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    gap: number;

    private _widths: string = '100 100 50 25 25';

    @Input()
    get widths(): string {
        return this._widths;
    }

    set widths(value: string) {
        if (value != this._widths) {
            this._widths = value;
            if (this._isInitComplete) this.maintainCurrentWidth();
        }
    }

    observer: any;

    nodes: any[];

    currentWidth: string;

    halfGap: number;

    subscription: any;

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

        private elementRef: ElementRef,
        private apexDynamicComponentsService: ApexDynamicComponentsService
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.maintainNodes();
        this.maintainCurrentWidth();
        this._isInitComplete = true;
    }

    maintainNodes() {
        let debug = Debug('ApexWrapDeprecated:maintainNodes');

        this.halfGap =
            (this.gap || this.apexDynamicComponentsService.layoutGap) / 2;
        debug('this.halfGap', this.halfGap);

        setTimeout(() => {
            this.elementRef.nativeElement.style.marginLeft =
                '-' + this.halfGap + 'px';
            this.elementRef.nativeElement.style.marginRight =
                '-' + this.halfGap + 'px';

            this.observer = new MutationObserver((mutationList: any) => {
                debug('mutationList', mutationList);
                for (let mutation of mutationList) {
                    for (let node of mutation.removedNodes) {
                        this.nodes.splice(this.nodes.indexOf(node), 1);
                    }
                    for (let node of mutation.addedNodes) {
                        debug('node', node);
                        this.nodes.push(node);
                    }
                    this.applyStyles();
                }
            });

            this.observer.observe(this.elementRef.nativeElement, {
                childList: true,
            });

            this.nodes = [...this.elementRef.nativeElement.childNodes];
            debug('this.nodes', this.nodes);

            this.applyStyles();
        });
    }

    maintainCurrentWidth() {
        let debug = Debug('ApexWrapDeprecated:maintainCurrentWidth');

        this.unsubscribe();

        if (this.widths) {
            this.subscription = this.apexDynamicComponentsService
                .width(this.widths)
                .subscribe((width: string) => {
                    debug('width', width);
                    debug('this.currentWidth', this.currentWidth);
                    if (width != this.currentWidth) {
                        this.currentWidth = width;
                        setTimeout(() => {
                            debug('this.nodes', this.nodes);
                            this.applyStyles();
                        });
                    }
                });
        }
    }

    applyStyles() {
        let debug = Debug('ApexWrapDeprecated:applyStyles');

        for (let node of this.nodes) {
            debug('node', node);
            if (node.style) {
                node.style.marginLeft = this.halfGap + 'px';
                node.style.marginRight = this.halfGap + 'px';
                node.style.marginBottom =
                    (this.gap || this.apexDynamicComponentsService.layoutGap) +
                    'px';

                if (!node.hasAttribute('apexWidth')) {
                    this.apexDynamicComponentsService.setWidth(
                        node,
                        this.currentWidth
                    );
                }
            }
        }
    }

    disconnectObserver() {
        let debug = Debug('ApexWrapDeprecated:disconnectObserver');

        debug('this.observer', this.observer);
        this.observer.disconnect();
    }

    unsubscribe() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    ngOnDestroy() {
        this.disconnectObserver();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
