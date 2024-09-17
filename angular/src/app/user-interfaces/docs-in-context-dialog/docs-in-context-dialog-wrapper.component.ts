// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { DocsInContextDialogComponent } from '../docs-in-context-dialog/docs-in-context-dialog.component';

@Component({
    selector: 'docs-in-context-dialog-wrapper',
    template: '',
})
export class DocsInContextDialogWrapperComponent {
    /**Properties******************************************/

    @Input() options: any = {};
    private _docSiteUrl: string;

    @Input()
    get docSiteUrl(): string {
        return this._docSiteUrl;
    }

    set docSiteUrl(value: string) {
        if (value != this._docSiteUrl) {
            this._docSiteUrl = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['docSiteUrl'] = value;
        }
    }

    private _pages: any[];

    @Input()
    get pages(): any[] {
        return this._pages;
    }

    set pages(value: any[]) {
        if (value != this._pages) {
            this._pages = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['pages'] = value;
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

    private _openAutomatically: boolean;

    @Input()
    get openAutomatically(): boolean {
        return this._openAutomatically;
    }

    set openAutomatically(value: boolean) {
        if (value != this._openAutomatically) {
            this._openAutomatically = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['openAutomatically'] = value;
        }
    }

    private _readPaths: any;

    @Input()
    get readPaths(): any {
        return this._readPaths;
    }

    set readPaths(value: any) {
        if (value != this._readPaths) {
            this._readPaths = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['readPaths'] = value;
        }
    }

    private _showRead: boolean;

    @Input()
    get showRead(): boolean {
        return this._showRead;
    }

    set showRead(value: boolean) {
        if (value != this._showRead) {
            this._showRead = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['showRead'] = value;
        }
    }

    private _welcome: string;

    @Input()
    get welcome(): string {
        return this._welcome;
    }

    set welcome(value: string) {
        if (value != this._welcome) {
            this._welcome = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['welcome'] = value;
        }
    }
    @Output() openAutomaticallyChange: EventEmitter<boolean> = new EventEmitter(
        true
    );
    @Output() showReadChange: EventEmitter<boolean> = new EventEmitter(true);
    @Output() updateList: EventEmitter<void> = new EventEmitter(true);

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
            docSiteUrl: this.docSiteUrl,
            pages: this.pages,
            label: this.label,
            openAutomatically: this.openAutomatically,
            readPaths: this.readPaths,
            showRead: this.showRead,
            welcome: this.welcome,
        };

        let dialogRef = this.dialog.open(
            DocsInContextDialogComponent,
            this.options
        );
        var instance = dialogRef.componentInstance;

        // Handle input binding.. come back later and add setters?

        instance['docSiteUrl'] = this.docSiteUrl;

        instance['pages'] = this.pages;

        instance['label'] = this.label;

        instance['openAutomatically'] = this.openAutomatically;

        instance['readPaths'] = this.readPaths;

        instance['showRead'] = this.showRead;

        instance['welcome'] = this.welcome;

        // Handle output binding

        instance['openAutomaticallyChange'].subscribe((value) => {
            this.openAutomatically = value;
            this.openAutomaticallyChange.emit(value);
        });

        instance['showReadChange'].subscribe((value) => {
            this.showRead = value;
            this.showReadChange.emit(value);
        });

        instance['updateList'].subscribe((value) => {
            this.updateList.emit(value);
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
