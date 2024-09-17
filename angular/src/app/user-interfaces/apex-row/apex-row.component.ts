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
    selector: 'apex-row',
    templateUrl: './apex-row.component.html',
    styleUrls: ['./apex-row.component.scss'],
})
export class ApexRowComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    gap: number;

    @Input()
    horizontalAlignment: string = 'start';

    @Input()
    verticalAlignment: string = 'start';

    observer: any;

    nodes: any[];

    halfGap: number;

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
        public apexDynamicComponentsService: ApexDynamicComponentsService
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.maintainNodes();
        this._isInitComplete = true;
    }

    maintainNodes() {
        let debug = Debug('ApexRow:maintainNodes');

        debug('this.gap', this.gap);
        this.halfGap =
            (this.gap === undefined
                ? this.apexDynamicComponentsService.layoutGap
                : this.gap) / 2;
        debug('this.halfGap', this.halfGap);

        setTimeout(() => {
            debug('this.elementRef', this.elementRef);
            this.elementRef.nativeElement.style.marginLeft =
                '-' + this.halfGap + 'px';
            this.elementRef.nativeElement.style.marginRight =
                '-' + this.halfGap + 'px';
            this.elementRef.nativeElement.style.width = `calc(100 % + ${this.gap}px)`;

            this.elementRef.nativeElement.style.justifyContent =
                this.horizontalAlignment == 'center'
                    ? 'center'
                    : 'flex-' + this.horizontalAlignment;

            this.elementRef.nativeElement.style.alignItems =
                this.verticalAlignment == 'center'
                    ? 'center'
                    : 'flex-' + this.verticalAlignment;

            this.elementRef.nativeElement.style.alignContent =
                this.verticalAlignment == 'center'
                    ? 'center'
                    : 'flex-' + this.verticalAlignment;

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
            debug('watching for children');

            this.nodes = [...this.elementRef.nativeElement.childNodes];
            debug('this.nodes', this.nodes);

            this.applyStyles();
        });
    }

    applyStyles() {
        let debug = Debug('ApexRow:applyStyles');

        for (let node of this.nodes) {
            debug('node', node);
            debug('node.style', node.style);
            if (node.style) {
                node.style.marginLeft = this.halfGap + 'px';
                node.style.marginRight = this.halfGap + 'px';

                if (!node.hasAttribute('apexWidth')) {
                    debug('setting width');
                    this.apexDynamicComponentsService.setWidth(node, 'grow');
                }
            }
        }
    }

    disconnectObserver() {
        let debug = Debug('ApexRow:disconnectObserver');

        debug('this.observer', this.observer);
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    ngOnDestroy() {
        this.disconnectObserver();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
