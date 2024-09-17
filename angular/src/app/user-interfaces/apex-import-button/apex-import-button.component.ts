// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';
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
    selector: 'apex-import-button',
    templateUrl: './apex-import-button.component.html',
    styleUrls: ['./apex-import-button.component.scss'],
})
export class ApexImportButtonComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    array: ApexDataArray;

    message: string;

    disabled: boolean;

    @Input()
    preprocessingFunction: Function;

    @Output() imported: EventEmitter<any> = new EventEmitter(true);

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

    @ViewChild('fileSelector', { static: false } as any) fileSelector;

    @ViewChild('dialog', { static: false } as any) dialog;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.setFixedWidth();
        this.checkForImport();
        this._isInitComplete = true;
    }

    setFixedWidth() {
        let debug = Debug('ApexImportButton:setFixedWidth');

        this.apexDynamicComponentsService.setFixedWidth(
            this.elementRef.nativeElement,
            '40px'
        );
        debug('width set');
    }

    checkForImport() {
        let debug = Debug('ApexImportButton:checkForImport');

        let classReference: any = this.array.getMetadata('class');
        debug('classReference', classReference);

        this.disabled = classReference.import === undefined;
        debug('this.disabled', this.disabled);
    }

    async handleSelection() {
        let debug = Debug('ApexImportButton:handleSelection');

        debug('this.fileSelector', this.fileSelector);

        for (let file of this.fileSelector.nativeElement.files) {
            debug('file', file);

            let reader: FileReader = new FileReader();

            reader.onload = async () => {
                debug('reader.result', reader.result);

                const exportData = JSON.parse(String(reader.result));
                debug('exportData', exportData);

                if (this.preprocessingFunction) {
                    this.preprocessingFunction(exportData);
                    debug('exportData after processing', exportData);
                }

                debug('this.array', this.array);

                let classReference = this.array.getMetadata('class');
                debug('classReference', classReference);

                try {
                    // let importedItem = await classReference.import(exportData);
                    const importedItem = await this.httpClient
                        .post(
                            `/api/${this.array.getMetadata(
                                'pluralName'
                            )}/import`,
                            { exportData: exportData }
                        )
                        .toPromise();
                    debug('importedItem', importedItem);

                    this.imported.emit(importedItem);
                } catch (err) {
                    debug('err', err);
                    this.message = err.error.error.message;
                    debug('this.message', this.message);
                    this.dialog.open();
                }
                this.fileSelector.nativeElement.value = '';
            };

            reader.readAsText(file);
        }
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
