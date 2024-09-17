// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * @private
 */
@Component({
	template: `
		<div mat-dialog-content="" class="confimration-content">
			<p>{{options.message || options.confirmMessage}}</p>
		</div>
		<div mat-dialog-actions="" class="confirmation-actions">
			<button mat-dialog-close="" mat-raised-button (click)="options.onCancel()" class="confirmation-cancel">{{options.cancelText}}</button>
			<button mat-dialog-close="" mat-raised-button color="primary" (click)="options.onConfirm()" class="confirmation-confirm">{{options.confirmText}}</button>
		</div>
	`,
	styles: ['button + button { margin-left: 20px; }']
})
export class ConfirmationDialogComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public options: any) {}
}
