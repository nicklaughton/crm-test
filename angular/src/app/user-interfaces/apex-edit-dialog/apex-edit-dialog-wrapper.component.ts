// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataObject } from '../../shared/models/apex-data-object';

import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { ApexEditDialogComponent } from '../apex-edit-dialog/apex-edit-dialog.component';

@Component({
    selector: 'apex-edit-dialog-wrapper',
    template: '',
})
export class ApexEditDialogWrapperComponent {
    /**Properties******************************************/

    @Input() options: any = {};
    private _object: ApexDataObject;

    @Input()
    get object(): ApexDataObject {
        return this._object;
    }

    set object(value: ApexDataObject) {
        if (value != this._object) {
            this._object = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['object'] = value;
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

    private _allowDelete: boolean;

    @Input()
    get allowDelete(): boolean {
        return this._allowDelete;
    }

    set allowDelete(value: boolean) {
        if (value != this._allowDelete) {
            this._allowDelete = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['allowDelete'] = value;
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

    private _label: string;

    @Input()
    get label(): string {
        return this._label;
    }

    set label(value: string) {
        if (value != this._label) {
            this._label = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['label'] = value;
        }
    }
    @Output() deleted: EventEmitter<void> = new EventEmitter(true);

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
            object: this.object,
            allFields: this.allFields,
            allowDelete: this.allowDelete,
            includeRelationshipsCsv: this.includeRelationshipsCsv,
            label: this.label,
        };

        let dialogRef = this.dialog.open(ApexEditDialogComponent, this.options);
        var instance = dialogRef.componentInstance;

        // Handle input binding.. come back later and add setters?

        instance['object'] = this.object;

        instance['allFields'] = this.allFields;

        instance['allowDelete'] = this.allowDelete;

        instance['includeRelationshipsCsv'] = this.includeRelationshipsCsv;

        instance['label'] = this.label;

        // Handle output binding

        instance['deleted'].subscribe((value) => {
            this.deleted.emit(value);
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
