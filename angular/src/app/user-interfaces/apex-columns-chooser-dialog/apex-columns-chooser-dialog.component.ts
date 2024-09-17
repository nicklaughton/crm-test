// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import * as changeCase from 'change-case';

import { moveItemInArray } from '@angular/cdk/drag-drop';

import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

import {
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

import { MatDialogRef } from '@angular/material/dialog';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-columns-chooser-dialog',
    templateUrl: './apex-columns-chooser-dialog.component.html',
    styleUrls: ['./apex-columns-chooser-dialog.component.scss'],
})
export class ApexColumnsChooserDialogComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    propertySelections: any[];

    searchString: string;

    width: string;

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
        public dialog: MatDialogRef<ApexColumnsChooserDialogComponent>
    ) {}

    @ViewChild('content', { static: false } as any) content;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.setWidth();
        this._isInitComplete = true;
    }

    setWidth() {
        // This makes the width sticky based on the width of the content
        setTimeout(() => {
            this.width = this.content.nativeElement.clientWidth + 'px';
        });

        // Fix the position of the top so it does not jump around
        this.dialog.updatePosition({ top: '60px' });
    }

    drop(event: any) {
        let debug = Debug('ApexColumnsChooserDialog:drop');

        debug('event', event);
        moveItemInArray(
            this.propertySelections,
            event.previousIndex,
            event.currentIndex
        );
        debug('this.propertySelections', this.propertySelections);
    }

    setAll(selected: boolean) {
        let debug = Debug('ApexColumnsChooserDialog:setAll');

        debug('selected', selected);
        for (let propertySelection of this.propertySelections) {
            propertySelection.selected = selected;
        }
    }

    show(displayName: string) {
        return (
            !this.searchString ||
            displayName.toLowerCase().includes(this.searchString.toLowerCase())
        );
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
