// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';
import * as changeCase from 'change-case';

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

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'apex-accordion',
    templateUrl: './apex-accordion.component.html',
    styleUrls: ['./apex-accordion.component.scss'],
})
export class ApexAccordionComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    array: ApexDataArray;

    @Input()
    label: string;

    @Input()
    headingLevel: number = 2;

    expandedId: number;

    @Input()
    nameCase: string = 'capitalCase';

    sortable: boolean;

    @Input()
    defaults: any;

    expandedElement: any;

    @Input()
    hideAdd: boolean;

    @Input()
    includeLaunch: boolean;

    @Input()
    routePrefix: string;

    @Input()
    addLabel: string;

    @Input()
    preventDelete: boolean;

    @Input()
    multi: boolean;

    @Input()
    includeRelationshipsCsv: string;

    @Input()
    preventDefaultLaunch: boolean;

    @Output() added: EventEmitter<any> = new EventEmitter(true);

    @Output() launched: EventEmitter<any> = new EventEmitter(true);

    @Output() deleted: EventEmitter<any> = new EventEmitter(true);

    /******************************************************/

    constructor(
        private httpClient: HttpClient,
        public route: ActivatedRoute,
        public router: Router,
        public translate: TranslateService,
        private apexDesignerEditService: ApexDesignerEditService,
        private viewContainerRef: ViewContainerRef,
        @Inject(forwardRef(() => ApexDesignerUserInterfacesService))
        public apexDesignerUserInterfacesService: any
    ) {}

    @ViewChild('accordion', { static: false } as any) accordion;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.setSortable();
        this.setDefaultRoutePrefix();
        this._isInitComplete = true;
    }

    setSortable() {
        let debug = Debug('ApexAccordion:setSortable');

        let sequenceProperty = this.array
            .getMetadata('properties')
            .find((property: any) => property.name == 'sequence');
        debug('sequenceProperty', sequenceProperty);
        this.sortable = sequenceProperty;
        this.sortAndUpdate();
    }

    drop(event: any) {
        let debug = Debug('ApexAccordion:drop');

        debug('event', event);
        debug('event.item.data.sequence before', event.item.data.sequence);
        if (event.currentIndex > event.previousIndex) {
            event.item.data.sequence = event.currentIndex + 0.5;
        } else {
            event.item.data.sequence = event.currentIndex - 0.5;
        }
        debug('event.item.data.sequence after', event.item.data.sequence);
        this.sortAndUpdate();
    }

    sortAndUpdate() {
        let debug = Debug('ApexAccordion:sortAndUpdate');

        if (this.sortable) {
            debug('this.array', this.array);
            for (let item of this.array) {
                debug('item.sequence', item.sequence);
            }
            this.array.sort((a, b) => {
                if (a.sequence > b.sequence) return 1;
                if (a.sequence < b.sequence) return -1;
                return 0;
            });
            for (let item of this.array) {
                debug('item.sequence', item.sequence);
            }
            for (let i = 0; i < this.array.length; i++) {
                this.array[i].sequence = i;
            }
            for (let item of this.array) {
                debug('item.sequence', item.sequence);
            }
        }
    }

    setExpandedElement(event: any) {
        let debug = Debug('ApexAccordion:setExpandedElement');

        debug('event', event);

        let element = event.target;
        while (
            element &&
            element.tagName.toLowerCase() != 'mat-expansion-panel'
        ) {
            element = element.parentElement;
            debug('element', element);
        }

        this.expandedElement = element;
    }

    scrollIntoView() {
        let debug = Debug('ApexAccordion:scrollIntoView');

        setTimeout(() => {
            this.expandedElement.scrollIntoViewIfNeeded();
            debug('scrolled');
        });
    }

    handleAdded(item: any) {
        let debug = Debug('ApexAccordion:handleAdded');

        debug('item.id', item.id);
        this.expandedId = item.id;
        debug('this.expandedId', this.expandedId);

        debug('this.accordion', this.accordion);
        this.expandedElement = this.accordion.nativeElement.lastElementChild;
        debug('this.expandedElement', this.expandedElement);

        this.added.emit(item);
    }

    handleExpand(item: any) {
        let debug = Debug('ApexAccordion:handleExpand');

        debug('item', item);
        this.expandedId = item.id;
        debug('this.expandedId', this.expandedId);
        this.scrollIntoView();
    }

    setDefaultRoutePrefix() {
        let debug = Debug('ApexAccordion:setDefaultRoutePrefix');

        debug('this.routePrefix', this.routePrefix);
        if (!this.routePrefix) {
            let lastLevel = this.router.url.split('/').pop().split('?')[0];
            debug('lastLevel', lastLevel);

            let desiredLastLevel = changeCase.camelCase(
                this.array.getMetadata('pluralName')
            );
            debug('desiredLastLevel', desiredLastLevel);

            if (lastLevel != desiredLastLevel) {
                this.routePrefix = desiredLastLevel + '/';
                debug('this.routePrefix', this.routePrefix);
            }
        }
    }

    async remove(index: number) {
        let debug = Debug('ApexAccordion:remove');

        debug('index', index);
        const item = this.array[index];
        await this.array.remove(index);
        this.deleted.emit(item);
    }

    launch(item: any) {
        let debug = Debug('ApexAccordion:launch');

        debug('item', item);
        if (this.preventDefaultLaunch) this.launched.emit(item);
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
