// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { DeactivateGuardService } from '../../shared/services/deactivate-guard.service';

import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

import { MatDialog } from '@angular/material/dialog';

import {
    Component,
    Input,
    Output,
    OnInit,
    OnDestroy,
    EventEmitter,
    ViewChild,
    ViewChildren,
    ViewContainerRef,
    Inject,
    forwardRef,
} from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateService } from '../../shared/services/translate.service';
import { ApexDesignerEditService } from '../../shared/services/apex-designer-edit.service';
import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';

@Component({
    selector: 'unload-confirmation-dialog',
    templateUrl: './unload-confirmation-dialog.component.html',
    styleUrls: ['./unload-confirmation-dialog.component.scss'],
})
export class UnloadConfirmationDialogComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    confirmIf: boolean;

    @Input()
    confirmIfPendingChanges: any;

    @Input()
    confirmMessage: string;

    @Input()
    confirmText: string = 'Continue';

    @Input()
    cancelText: string = 'Stay on Page';

    key: string;

    /******************************************************/

    constructor(
        private httpClient: HttpClient,
        public route: ActivatedRoute,
        public router: Router,
        public translate: TranslateService,
        private apexDesignerEditService: ApexDesignerEditService,
        private viewContainerRef: ViewContainerRef,
        @Inject(forwardRef(() => ApexDesignerUserInterfacesService))
        public apexDesignerUserInterfacesService: any,

        private deactivateGuardService: DeactivateGuardService,
        public dialog: MatDialog
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.key = `Math.random()`;

        this.init();
        this._isInitComplete = true;
    }

    init() {
        if (!this.confirmMessage) {
            if (this.confirmIfPendingChanges)
                this.confirmMessage =
                    'Are you sure you wish to leave this page?';
            else
                this.confirmMessage =
                    'Are you sure you wish to leave this page?';
        }

        this.deactivateGuardService.registerDeactivationCallback(
            this.key,
            this.showDialog.bind(this)
        );

        if (!this.route.routeConfig.canDeactivate)
            this.route.routeConfig.canDeactivate = [];
        if (
            !this.route.routeConfig.canDeactivate.includes(
                DeactivateGuardService
            )
        )
            this.route.routeConfig.canDeactivate = [
                ...this.route.routeConfig.canDeactivate,
                DeactivateGuardService,
            ];
    }

    unload() {
        this.deactivateGuardService.removeDeactivationCallback(this.key);
    }

    async showDialog(): Promise<boolean> {
        let debug = Debug('UnloadConfirmationDialog:showDialog');

        if (
            !this.confirmIf &&
            !(
                this.confirmIfPendingChanges &&
                this.confirmIfPendingChanges['hasPendingChanges'] &&
                this.confirmIfPendingChanges['hasPendingChanges']()
            )
        )
            return true;

        const result = await new Promise<boolean>((resolve) => {
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                maxWidth: '400px',
                data: {
                    confirmMessage: this.confirmMessage,
                    confirmText: this.confirmText,
                    cancelText: this.cancelText,
                    onConfirm: () => {
                        dialogRef.close(true);
                    },
                    onCancel: () => {
                        dialogRef.close(false);
                    },
                },
            });
            dialogRef.afterClosed().subscribe((result) => {
                debug(`Dialog result: ${result}`);
                resolve(!!result);
            });
        });
        return result;
    }

    ngOnDestroy() {
        this.unload();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
