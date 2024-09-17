// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';

import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { ApexAddDialogComponent } from '../apex-add-dialog/apex-add-dialog.component';

@Component({
    selector: 'apex-add-dialog-wrapper',
    template: '',
})
export class ApexAddDialogWrapperComponent {
    /**Properties******************************************/

    @Input() options: any = {};
    private _array: ApexDataArray;

    @Input()
    get array(): ApexDataArray {
        return this._array;
    }

    set array(value: ApexDataArray) {
        if (value != this._array) {
            this._array = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['array'] = value;
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
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['defaults'] = value;
        }
    }

    private _allFields: boolean;

    @Input()
    get allFields(): boolean {
        return this._allFields;
    }

    set allFields(value: boolean) {
        if (value != this._allFields) {
            this._allFields = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['allFields'] = value;
        }
    }

    private _includeRelationshipsCsv: string;

    @Input()
    get includeRelationshipsCsv(): string {
        return this._includeRelationshipsCsv;
    }

    set includeRelationshipsCsv(value: string) {
        if (value != this._includeRelationshipsCsv) {
            this._includeRelationshipsCsv = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['includeRelationshipsCsv'] =
                    value;
        }
    }

    private _inputRequiredFieldsCsv: string;

    @Input()
    get inputRequiredFieldsCsv(): string {
        return this._inputRequiredFieldsCsv;
    }

    set inputRequiredFieldsCsv(value: string) {
        if (value != this._inputRequiredFieldsCsv) {
            this._inputRequiredFieldsCsv = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['inputRequiredFieldsCsv'] =
                    value;
        }
    }

    private _addMultiple: boolean;

    @Input()
    get addMultiple(): boolean {
        return this._addMultiple;
    }

    set addMultiple(value: boolean) {
        if (value != this._addMultiple) {
            this._addMultiple = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['addMultiple'] = value;
        }
    }

    private _excludePropertiesCsv: string;

    @Input()
    get excludePropertiesCsv(): string {
        return this._excludePropertiesCsv;
    }

    set excludePropertiesCsv(value: string) {
        if (value != this._excludePropertiesCsv) {
            this._excludePropertiesCsv = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['excludePropertiesCsv'] =
                    value;
        }
    }

    private _title: string;

    @Input()
    get title(): string {
        return this._title;
    }

    set title(value: string) {
        if (value != this._title) {
            this._title = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['title'] = value;
        }
    }
    @Output() added: EventEmitter<any> = new EventEmitter(true);

    private _isOpen: boolean;

    @Input()
    get isOpen(): boolean {
        return this._isOpen;
    }

    set isOpen(value: boolean) {
        if (value != this._isOpen) {
            this._isOpen = value;
            this.handleIsOpenChange();
        }
    }

    dialogRef: any;

    @Output() isOpenChange: EventEmitter<boolean> = new EventEmitter(true);

    /******************************************************/

    constructor(private dialog: MatDialog) {}

    /**Methods*********************************************/

    ngOnInit() {}

    close() {
        if (this.dialogRef) this.dialogRef.close();
    }

    open() {
        this.options['data'] = {
            array: this.array,
            defaults: this.defaults,
            allFields: this.allFields,
            includeRelationshipsCsv: this.includeRelationshipsCsv,
            inputRequiredFieldsCsv: this.inputRequiredFieldsCsv,
            addMultiple: this.addMultiple,
            excludePropertiesCsv: this.excludePropertiesCsv,
            title: this.title,
        };

        let dialogRef = this.dialog.open(ApexAddDialogComponent, this.options);
        var instance = dialogRef.componentInstance;

        // Handle input binding.. come back later and add setters?

        instance['array'] = this.array;

        instance['defaults'] = this.defaults;

        instance['allFields'] = this.allFields;

        instance['includeRelationshipsCsv'] = this.includeRelationshipsCsv;

        instance['inputRequiredFieldsCsv'] = this.inputRequiredFieldsCsv;

        instance['addMultiple'] = this.addMultiple;

        instance['excludePropertiesCsv'] = this.excludePropertiesCsv;

        instance['title'] = this.title;

        // Handle output binding

        instance['added'].subscribe((value) => {
            this.added.emit(value);
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.isOpenChange.emit(false);
        });

        this.dialogRef = dialogRef;
    }

    handleIsOpenChange() {
        setTimeout(() => {
            if (this.isOpen) this.open();
            else this.close();
        });
    }
    /******************************************************/
}
