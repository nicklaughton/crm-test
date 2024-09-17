// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';
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
    selector: 'apex-add-dialog',
    templateUrl: './apex-add-dialog.component.html',
    styleUrls: ['./apex-add-dialog.component.scss'],
})
export class ApexAddDialogComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    private _array: ApexDataArray;

    @Input()
    get array(): ApexDataArray {
        return this._array;
    }

    set array(value: ApexDataArray) {
        if (value != this._array) {
            this._array = value;
            if (this._isInitComplete) this.initialize();
        }
    }

    private _defaults: any;

    @Input()
    get defaults(): any {
        return this._defaults;
    }

    set defaults(value: any) {
        if (value != this._defaults) {
            this._defaults = value;
            if (this._isInitComplete) this.initialize();
        }
    }

    @Input()
    allFields: boolean;

    newItem: any;

    subscription: any;

    status: string;

    priorData: any;

    disabled: boolean;

    @Input()
    includeRelationshipsCsv: string;

    @Input()
    inputRequiredFieldsCsv: string;

    @Input()
    addMultiple: boolean;

    @Input()
    excludePropertiesCsv: string;

    adding: boolean;

    @Input()
    title: string;

    @Output() added: EventEmitter<any> = new EventEmitter(true);

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

        public dialog: MatDialogRef<ApexAddDialogComponent>
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.initialize();
        this._isInitComplete = true;
    }

    initialize() {
        this.setUpNewItem();
    }

    async add() {
        let debug = Debug('ApexAddDialog:add');

        this.adding = true;
        debug('this.array', this.array);
        debug('this.newItem', this.newItem);
        this.priorData = this.newItem.toJSON();
        debug('this.priorData', this.priorData);

        this.newItem = await this.array.add(this.priorData);
        await this.array.save();
        this.added.emit(this.newItem);

        this.setUpNewItem();
        this.adding = false;
    }

    setUpNewItem() {
        let debug = Debug('ApexAddDialog:setUpNewItem');

        debug('this.array', this.array);
        this.inputRequiredFieldsCsv = this.inputRequiredFieldsCsv?.replace(
            ' ',
            ''
        );
        let requiredFields = this.inputRequiredFieldsCsv?.split(',');
        this.newItem = new this.array._classReference(
            this.priorData || this.defaults || {},
            {
                read: 'On Demand',
                save: 'On Deamnd',
                required: requiredFields,
                isForms: true,
            }
        ); //this.apexFormService.initializeGroup(this.array.businessObject.name, 'Never', 'On Demand', options);
        debug('this.newItem', this.newItem);

        this.disabled = this.newItem.formGroup.status === 'INVALID';
        debug('this.disabled', this.disabled);

        this.subscription = this.newItem.formGroup.statusChanges.subscribe(
            (status: string) => {
                debug('status', status);
                this.disabled = this.newItem.formGroup.status === 'INVALID';
                debug('this.disabled', this.disabled);
            }
        );
    }

    unsubscribe() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
