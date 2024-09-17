// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';
import * as dayjs from 'dayjs';

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

import { ApexDesignerBusinessObjectsService } from '../../shared/services/apex-designer-business-objects.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-export-tsv-button',
    templateUrl: './apex-export-tsv-button.component.html',
    styleUrls: ['./apex-export-tsv-button.component.scss'],
})
export class ApexExportTsvButtonComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    array: ApexDataArray;

    @Input()
    label: string;

    @Input()
    fileName: string;

    @Input()
    excludePropertyNames: string[];

    @Input()
    pathsCsv: string;

    @Input()
    columnLabelsCsv: string;

    @Input()
    timezone: any;

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
        private elementRef: ElementRef,
        private apexDesignerBusinessObjectsService: ApexDesignerBusinessObjectsService
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.setFixedWidth();
        this._isInitComplete = true;
    }

    setFixedWidth() {
        let debug = Debug('ApexExportTsvButton:setFixedWidth');

        this.apexDynamicComponentsService.setFixedWidth(
            this.elementRef.nativeElement,
            '40px'
        );
        debug('width set');
    }

    async download() {
        let debug = Debug('ApexExportTsvButton:download');

        let tsvRows = [];
        let cells = [];

        let paths = [];
        let columnLabels = [];

        var utc = require('dayjs/plugin/utc');
        var timezone = require('dayjs/plugin/timezone');
        if (this.timezone) {
            dayjs.extend(utc);
            dayjs.extend(timezone);
        }

        if (this.pathsCsv) {
            paths = this.pathsCsv.split(',').map((path: string) => path.trim());
            if (this.columnLabelsCsv) {
                columnLabels = this.columnLabelsCsv
                    .split(',')
                    .map((label: string) => label.trim());
            } else {
                throw `columnLabelsCsv is required when specifying pathsCsv`;
            }
        } else {
            let excludePropertiesByName = {};
            for (let propertyName of this.excludePropertyNames || []) {
                excludePropertiesByName[propertyName] = true;
            }

            const includeAllFields = true;
            const includeId = true;
            let properties = this.apexDesignerBusinessObjectsService
                .properties(
                    this.array.getMetadata('name'),
                    includeAllFields,
                    includeId
                )
                .filter(
                    (property: any) => !excludePropertiesByName[property.name]
                );
            debug('properties', properties);

            for (let property of properties) {
                paths.push(property.name);
                columnLabels.push(property.displayName);
            }
        }

        tsvRows.push(columnLabels.join('\t'));

        for (let row of this.array) {
            let cells = [];
            for (let path of paths) {
                let value = row;
                let levels = path.split('.');
                while (levels.length > 0 && value !== undefined) {
                    let level = levels.shift();
                    value = value[level];
                }

                if (this.timezone && /GMT[+-]\d{4}/.test(value)) {
                    let datetime = dayjs(value)['tz'](this.timezone);
                    cells.push(datetime.format());
                } else if (/GMT[+-]\d{4}/.test(value)) {
                    let datetime = new Date(value);
                    cells.push(datetime.toISOString());
                } else if (/\n/m.test(value)) {
                    value = value.replace(/"/g, '""');
                    cells.push('"' + value + '"');
                } else {
                    cells.push(value);
                }
            }
            tsvRows.push(cells.join('\t'));
        }
        debug('tsvRows', tsvRows);

        const blob = new Blob([tsvRows.join('\n')], {
            type: 'text/tab-separated-values;charset=utf-8;',
        });

        const link = document.createElement('a');

        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            (this.fileName || this.array.getMetadata('pluralDisplayName')) +
                '.tsv'
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
