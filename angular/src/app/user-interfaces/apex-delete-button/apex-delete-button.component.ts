// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from '../../shared/models/apex-data-object';
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
    selector: 'apex-delete-button',
    templateUrl: './apex-delete-button.component.html',
    styleUrls: ['./apex-delete-button.component.scss'],
})
export class ApexDeleteButtonComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    object: ApexDataObject;

    @Input()
    afterDeleteRoute: string;

    @Input()
    disabled: boolean;

    subscription: any;

    deleting: boolean;

    @Input()
    objectDisplayName: string;

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
        let debug = Debug('ApexDeleteButton:setFixedWidth');

        this.apexDynamicComponentsService.setFixedWidth(
            this.elementRef.nativeElement,
            '40px'
        );
        debug('width set');
    }

    async delete() {
        let debug = Debug('ApexDeleteButton:delete');

        debug('this.object', this.object);
        this.deleting = true;
        try {
            await this.object.delete();
        } catch (err) {
            this.deleting = false;
            throw err;
        }
        this.deleting = false;
        this.deleted.emit();

        debug('this.afterDeleteRoute', this.afterDeleteRoute);
        if (this.afterDeleteRoute) {
            this.router.navigateByUrl(this.afterDeleteRoute);
        } else {
            this.unSubscribe();

            this.subscription =
                this.apexDesignerUserInterfacesService.currentUserInterfaceId.subscribe(
                    async (userInterfaceId: number) => {
                        debug('userInterfaceId', userInterfaceId);

                        let currentPage =
                            await this.apexDesignerUserInterfacesService.byId(
                                userInterfaceId
                            );
                        debug('currentPage', currentPage);

                        let parentPage =
                            await this.apexDesignerUserInterfacesService.byId(
                                currentPage.parentUserInterfaceId
                            );
                        debug('parentPage', parentPage);

                        if (parentPage) {
                            let parentLevels = parentPage.path.split('/');
                            debug('parentLevels', parentLevels);

                            let currentLevels = this.router.url.split('/');
                            debug('currentLevels', currentLevels);

                            let url;

                            if (parentLevels.length == parentLevels.length)
                                url = parentLevels.join('/');
                            else {
                                while (
                                    currentLevels.length > parentLevels.length
                                ) {
                                    currentLevels.pop();
                                }
                                debug('currentLevels', currentLevels);

                                url = currentLevels.join('/');
                                debug('url', url);
                            }

                            this.router.navigateByUrl(url);
                        }
                    }
                );
        }
    }

    unSubscribe() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    ngOnDestroy() {
        this.unSubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
