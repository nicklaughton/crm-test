// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { ApexAuthAccessDialogComponent } from '../apex-auth-access-dialog/apex-auth-access-dialog.component';

@Component({
    selector: 'apex-auth-access-dialog-wrapper',
    template: '',
})
export class ApexAuthAccessDialogWrapperComponent {
    /**Properties******************************************/
    private _options: any = { autoFocus: false, maxWidth: '300px' };

    @Input()
    get options(): any {
        return this._options;
    }

    set options(value: any) {
        if (value != this._options) {
            this._options = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['options'] = value;
        }
    }

    private _teamNames: string[] = [];

    @Input()
    get teamNames(): string[] {
        return this._teamNames;
    }

    set teamNames(value: string[]) {
        if (value != this._teamNames) {
            this._teamNames = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['teamNames'] = value;
        }
    }

    private _isNotTeamMemberCheck: boolean;

    @Input()
    get isNotTeamMemberCheck(): boolean {
        return this._isNotTeamMemberCheck;
    }

    set isNotTeamMemberCheck(value: boolean) {
        if (value != this._isNotTeamMemberCheck) {
            this._isNotTeamMemberCheck = value;
            if (this.dialogRef && this.dialogRef.componentInstance)
                this.dialogRef.componentInstance['isNotTeamMemberCheck'] =
                    value;
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
            options: this.options,
            teamNames: this.teamNames,
            isNotTeamMemberCheck: this.isNotTeamMemberCheck,
        };

        let dialogRef = this.dialog.open(
            ApexAuthAccessDialogComponent,
            this.options
        );
        var instance = dialogRef.componentInstance;

        // Handle input binding.. come back later and add setters?

        instance['options'] = this.options;

        instance['teamNames'] = this.teamNames;

        instance['isNotTeamMemberCheck'] = this.isNotTeamMemberCheck;

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
