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
    selector: 'apex-wrap',
    templateUrl: './apex-wrap.component.html',
    styleUrls: ['./apex-wrap.component.scss'],
})
export class ApexWrapComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    private _gap: number = 20;

    @Input()
    get gap(): number {
        return this._gap;
    }

    set gap(value: number) {
        if (value != this._gap) {
            this._gap = value;
            if (this._isInitComplete) this.setGap();
        }
    }

    private _widths: string = '100 100 50 25 25';

    @Input()
    get widths(): string {
        return this._widths;
    }

    set widths(value: string) {
        if (value != this._widths) {
            this._widths = value;
            if (this._isInitComplete) this.adjustStyleBasedOnWidth();
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

        this.setGap();
        this.adjustStyleBasedOnWidth();
        this._isInitComplete = true;
    }

    setGap() {
        let debug = Debug('ApexWrap:setGap');

        debug('this.elementRef', this.elementRef);
        this.elementRef.nativeElement.style.display = 'grid';
        debug(
            'this.elementRef.nativeElement.style.display',
            this.elementRef.nativeElement.style.display
        );

        this.elementRef.nativeElement.style.gridGap = this.gap + 'px';
        debug(
            'this.elementRef.nativeElement.style.gridGap',
            this.elementRef.nativeElement.style.gridGap
        );

        this.elementRef.nativeElement.style.marginBottom = this.gap + 'px';
    }

    adjustStyleBasedOnWidth() {
        let debug = Debug('ApexWrap:adjustStyleBasedOnWidth');

        this.unsubscribe();

        debug('this.widths', this.widths);
        if (this.widths) {
            this.subscription = this.apexDynamicComponentsService
                .width(this.widths)
                .subscribe((width: string) => {
                    debug('width', width);
                    debug('this.currentWidth', this.currentWidth);
                    if (width != this.currentWidth) {
                        this.currentWidth = width;
                        let repeat = Math.floor(100 / Number(width));
                        debug('repeat', repeat);
                        this.elementRef.nativeElement.style.gridTemplateColumns = `repeat(${repeat}, 1fr)`;
                    }
                });
        }
    }

    unsubscribe() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
