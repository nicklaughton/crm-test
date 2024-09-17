// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogDirective } from './confirmation-dialog.directive';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
	declarations: [ConfirmationDialogDirective, ConfirmationDialogComponent],
	imports: [CommonModule, MatButtonModule],
	exports: [ConfirmationDialogDirective],
	entryComponents: [ConfirmationDialogComponent]
})
export class ConfirmationDialogModule {
	/*
	static forRoot(): ModuleWithProviders {

		return {
			ngModule: ConfirmationDialogModule,

		};

	}
*/
}
