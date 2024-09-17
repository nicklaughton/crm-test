// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
	Directive,
	Input,
	Output,
	EventEmitter,
	HostListener,
	OnDestroy,
	ElementRef,
	OnChanges,
	OnInit,
	Inject
} from '@angular/core';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

/**
 * All properties can be set on the directive as attributes like so (use `ConfirmationPopoverModule.forRoot()` to configure them globally):
 * ```
 * <button
 *  class="btn btn-default"
 *  mwlConfirmationPopover
 *  [title]="title"
 *  [message]="message"
 *  placement="left"
 *  (confirm)="confirmClicked = true"
 *  (cancel)="cancelClicked = true"
 *  [(isOpen)]="isOpen">
 *   Show confirm popover!
 * </button>
 * ```
 */
@Directive({
	selector: '[confirm][confirmMessage]'
})
export class ConfirmationDialogDirective implements OnDestroy, OnChanges, OnInit {
	dialogRef: MatDialogRef<ConfirmationDialogComponent>;
	/**
	 * The title of the popover.
	 * Note, if you use an expression, you may want to consider using "data-title" instead of "title" so
	 * that the browser doesn't show native tooltips with the angular expression listed.
	 */

	@Input() title: string;

	/**
	 * The body text of the popover.
	 */
	@Input() message: string;
	@Input() confirmMessage: string;

	/**
	 * The text of the confirm button. Default `Confirm`
	 */
	@Input() confirmText: string = 'Confirm';

	/**
	 * The text of the cancel button. Default `Cancel`
	 */
	@Input() cancelText: string = 'Cancel';

	@Input() confirmColor: string = 'primary';

	/**
	 * The bootstrap button type of the cancel button. It can be any supported bootstrap color type
	 * e.g. `default`, `warning`, `danger` etc. Default `default`
	 */
	@Input() cancelColor: string;

	/**
	 * Set to either `confirm` or `cancel` to focus the confirm or cancel button.
	 * If omitted, by default it will not focus either button.
	 */
	@Input() focusButton: string;

	/**
	 * Whether to hide the confirm button. Default `false`.
	 */
	@Input() hideConfirmButton: boolean = false;

	/**
	 * Whether to hide the cancel button. Default `false`.
	 */
	@Input() hideCancelButton: boolean = false;

	/**
	 * Whether to disable showing the popover. Default `false`.
	 */
	@Input() isDisabled: boolean = false;
	@Input() confirmDisabled: boolean = false;

	/**
	 * Will open or show the popover when changed.
	 * Can be sugared with `isOpenChange` to emulate 2-way binding like so `[(isOpen)]="isOpen"`
	 */
	@Input() isOpen: boolean = false;

	/**
	 * Will emit when the popover is opened or closed
	 */
	@Output() isOpenChange: EventEmitter<any> = new EventEmitter(true);

	/**
	 * An expression that is called when the confirm button is clicked.
	 */
	@Output() confirm: EventEmitter<any> = new EventEmitter();

	/**
	 * An expression that is called when the cancel button is clicked.
	 */
	@Output() cancel: EventEmitter<any> = new EventEmitter();

	/**
	 * A custom CSS class to be added to the popover
	 */
	@Input() popoverClass: string;

	/**
	 * Append the element to the document body rather than the trigger element
	 */
	@Input() appendToBody: boolean = false;

	/**
	 * @private
	 */
	constructor(private elm: ElementRef, private dialog: MatDialog) {}

	/**
	 * @private
	 */
	ngOnInit(): void {
		this.isOpenChange.emit(false);
	}

	/**
	 * @private
	 */
	ngOnChanges(changes: any): void {
		if (changes.isOpen) {
			if (changes.isOpen.currentValue === true) {
				if (!this.confirmDisabled) this.showPopover();
				else this.confirm.emit(null);
			} else {
				this.hidePopover();
			}
		}
	}

	/**
	 * @private
	 */
	ngOnDestroy(): void {
		this.hidePopover();
	}

	/**
	 * @private
	 */
	onConfirm(): void {
		this.confirm.emit(null);
		this.hidePopover();
	}

	/**
	 * @private
	 */
	onCancel(): void {
		this.cancel.emit(null);
		this.hidePopover();
	}

	/**
	 * @private
	 */
	@HostListener('click', ['$event'])
	togglePopover(e: Event): void {
		e.stopPropagation();
		e.preventDefault();
		if (!this.confirmDisabled) {
			this.showPopover();
		} else this.confirm.emit(null);
	}

	private showPopover(): void {
		var options = this;
		this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			maxWidth: '400px',
			data: options
		});
	}

	private hidePopover(): void {
		if (this.dialogRef) this.dialogRef.close();
	}
}
