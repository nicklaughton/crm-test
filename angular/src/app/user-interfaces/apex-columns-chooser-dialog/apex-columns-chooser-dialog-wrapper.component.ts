// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { ApexColumnsChooserDialogComponent } from '../apex-columns-chooser-dialog/apex-columns-chooser-dialog.component';

@Component({
    selector: 'apex-columns-chooser-dialog-wrapper',
    template: '',
})
export class ApexColumnsChooserDialogWrapperComponent {
    /**Properties******************************************/

    @Input() options: any = {};
    private _propertySelections: any[];

    @Input()
    get propertySelections(): any[] {
        return this._propertySelections;
    }

    set propertySelections(value: any[]) {
        if (value != this._propertySelections) {
            this._propertySelections = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['propertySelections'] = value;
        }
    }

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
            propertySelections: this.propertySelections,
        };

        let dialogRef = this.dialog.open(
            ApexColumnsChooserDialogComponent,
            this.options
        );
        var instance = dialogRef.componentInstance;

        // Handle input binding.. come back later and add setters?

        instance['propertySelections'] = this.propertySelections;

        // Handle output binding

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
