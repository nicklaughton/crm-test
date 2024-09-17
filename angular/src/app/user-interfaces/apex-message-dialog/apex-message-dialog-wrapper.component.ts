// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { ApexMessageDialogComponent } from '../apex-message-dialog/apex-message-dialog.component';

@Component({
    selector: 'apex-message-dialog-wrapper',
    template: '',
})
export class ApexMessageDialogWrapperComponent {
    /**Properties******************************************/

    @Input() options: any = {};
    private _message: string;

    @Input()
    get message(): string {
        return this._message;
    }

    set message(value: string) {
        if (value != this._message) {
            this._message = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['message'] = value;
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
            message: this.message,
        };

        let dialogRef = this.dialog.open(
            ApexMessageDialogComponent,
            this.options
        );
        var instance = dialogRef.componentInstance;

        // Handle input binding.. come back later and add setters?

        instance['message'] = this.message;

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
