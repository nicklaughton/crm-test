// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from '../../shared/models/apex-data-array';

import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { ApexImportTsvDialogComponent } from '../apex-import-tsv-dialog/apex-import-tsv-dialog.component';

@Component({
    selector: 'apex-import-tsv-dialog-wrapper',
    template: '',
})
export class ApexImportTsvDialogWrapperComponent {
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

    private _tsvHandler: any;

    @Input()
    get tsvHandler(): any {
        return this._tsvHandler;
    }

    set tsvHandler(value: any) {
        if (value != this._tsvHandler) {
            this._tsvHandler = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['tsvHandler'] = value;
        }
    }

    private _parentObject: any;

    @Input()
    get parentObject(): any {
        return this._parentObject;
    }

    set parentObject(value: any) {
        if (value != this._parentObject) {
            this._parentObject = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['parentObject'] = value;
        }
    }

    private _customTemplate: string;

    @Input()
    get customTemplate(): string {
        return this._customTemplate;
    }

    set customTemplate(value: string) {
        if (value != this._customTemplate) {
            this._customTemplate = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['customTemplate'] = value;
        }
    }
    @Output() changes: EventEmitter<void> = new EventEmitter(true);

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
            label: this.label,
            tsvHandler: this.tsvHandler,
            parentObject: this.parentObject,
            customTemplate: this.customTemplate,
        };

        let dialogRef = this.dialog.open(
            ApexImportTsvDialogComponent,
            this.options
        );
        var instance = dialogRef.componentInstance;

        // Handle input binding.. come back later and add setters?

        instance['array'] = this.array;

        instance['label'] = this.label;

        instance['tsvHandler'] = this.tsvHandler;

        instance['parentObject'] = this.parentObject;

        instance['customTemplate'] = this.customTemplate;

        // Handle output binding

        instance['changes'].subscribe((value) => {
            this.changes.emit(value);
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
