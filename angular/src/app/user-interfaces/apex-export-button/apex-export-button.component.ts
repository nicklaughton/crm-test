// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from '../../shared/models/apex-data-object';
import * as changeCase from 'change-case';

import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

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
    selector: 'apex-export-button',
    templateUrl: './apex-export-button.component.html',
    styleUrls: ['./apex-export-button.component.scss'],
})
export class ApexExportButtonComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    object: ApexDataObject;

    @Input()
    fileName: string;

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

        public apexDynamicComponentsService: ApexDynamicComponentsService,
        private elementRef: ElementRef
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.setFixedWidth();
        this._isInitComplete = true;
    }

    setFixedWidth() {
        let debug = Debug('ApexExportButton:setFixedWidth');

        this.apexDynamicComponentsService.setFixedWidth(
            this.elementRef.nativeElement,
            '40px'
        );
        debug('width set');
    }

    async saveFile() {
        let debug = Debug('ApexExportButton:saveFile');

        debug('this.object', this.object);

        if (!this.object['export'])
            throw `Business object "${this.object.getMetadata(
                'name'
            )}" does not have an export method (mixin not configured?)`;

        let exportData = await this.object['export']();
        debug('exportData', exportData);

        const blob = new Blob([JSON.stringify(exportData)], {
            type: 'application/json',
        });

        const url = window['URL'].createObjectURL(blob);

        debug('this.fileName', this.fileName);
        let link = document.createElement('a');

        link.href = url;
        link.download =
            this.fileName ||
            `${changeCase.paramCase(
                this.object[this.object.getMetadata('properties')[0].name]
            )}.${changeCase.paramCase(this.object.getMetadata('name'))}.json`;
        debug('link %j', link);

        document.body.appendChild(link);
        debug('appended');

        link.click();
        debug('clicked');

        link.parentNode.removeChild(link);
        debug('removed');
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
