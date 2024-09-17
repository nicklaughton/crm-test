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

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-ng-content',
    templateUrl: './apex-ng-content.component.html',
    styleUrls: ['./apex-ng-content.component.scss'],
})
export class ApexNgContentComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

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

        private elementRef: ElementRef
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.replaceWithComment();
        this._isInitComplete = true;
    }

    replaceWithComment() {
        let debug = Debug('ApexNgContent:replaceWithComment');

        debug('this.elementRef', this.elementRef);
        let domElement = this.elementRef.nativeElement;
        debug('domElement', domElement);
        let selector = domElement.getAttribute('for-selector');
        debug('selector', selector);
        let comment = document.createComment('apex-ng-content for ' + selector);
        debug('comment', comment);
        domElement.parentElement?.replaceChild(comment, domElement);
        debug('replaced');
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
