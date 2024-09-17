// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Component({
    selector: 'error-dialog-wrapper',
    template: '',
})
export class ErrorDialogWrapperComponent {
    /**Properties******************************************/

    @Input() options: any = {};
    private _messages: string[];

    @Input()
    get messages(): string[] {
        return this._messages;
    }

    set messages(value: string[]) {
        if (value != this._messages) {
            this._messages = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['messages'] = value;
        }
    }
    @Output() messagesChange: EventEmitter<string[]> = new EventEmitter(true);

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
            messages: this.messages,
        };

        let dialogRef = this.dialog.open(ErrorDialogComponent, this.options);
        var instance = dialogRef.componentInstance;

        // Handle input binding.. come back later and add setters?

        instance['messages'] = this.messages;

        // Handle output binding

        instance['messagesChange'].subscribe((value) => {
            this.messages = value;
            this.messagesChange.emit(value);
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
