// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
    NgZone,
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
    selector: 'error-alert',
    templateUrl: './error-alert.component.html',
    styleUrls: ['./error-alert.component.scss'],
})
export class ErrorAlertComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    messages: string[];

    isOpen: boolean;

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

        private ngZone: NgZone
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.messages = [];

        this.watchForErrors();
        this._isInitComplete = true;
    }

    watchForErrors() {
        let debug = Debug('ErrorAlert:watchForErrors');

        debug('subscribing to errors');

        this.ngZone.onError.subscribe((e: any) => {
            this.ngZone.run(() => {
                let newMessage;

                debug('e', e);
                window['errorAlertErrors'] = {
                    e: e,
                };
                debug('e.rejection', e.rejection);
                debug('e.rejection', e.rejection);
                debug('e.rejection.error', e.rejection?.error);
                debug('e.rejection.error.error', e.rejection?.error?.error);
                debug(
                    'e.rejection.error.error.message',
                    e.rejection?.error?.error?.message
                );
                if (e.rejection) {
                    if (e.rejection.status == 503) {
                        newMessage =
                            'The system is temporarily unavailable. Please try again in a few minutes.';
                    } else if (e.rejection.status >= 500) {
                        newMessage =
                            'Oops. Something unexpected happened. Please reload the page and try again.';
                    } else if (
                        e.rejection.status == 403 &&
                        e.message?.includes('Request is forbidden')
                    ) {
                        newMessage =
                            'The request is forbidden.  Please verify access and try again.';
                    } else if (
                        e.rejection.status == 403 &&
                        e.message?.includes('The request is blocked')
                    ) {
                        newMessage =
                            'The request is blocked.  Please contact an administrator.';
                    } else {
                        if (typeof e.rejection === 'string') {
                            // See if there is a message property
                            newMessage = e.rejection;
                        } else if (
                            e.rejection.error?.error?.message &&
                            typeof e.rejection.error.error.message === 'string'
                        ) {
                            newMessage = e.rejection.error.error.message;
                        } else {
                            // Finally just use the string
                            newMessage = e.toString();
                        }
                    }
                } else {
                    newMessage = e.toString();
                }
                newMessage = newMessage.replace('Uncaught (in promise): ', '');
                debug('newMessage', newMessage);

                // if (newMessage.includes('ReferenceError:') || newMessage.includes('TypeError:')) {
                // 	newMessage = 'Oops. Something unexpected happened. Please reload the page and try again.';
                // }

                if (
                    newMessage.includes(
                        'Please verify your email before logging in.'
                    )
                ) {
                    debug('ignoring verify email error');
                    return;
                }

                if (this.messages[this.messages.length - 1] != newMessage) {
                    this.messages.push(newMessage);
                    if (!this.isOpen) {
                        this.isOpen = true;
                    }
                }
            });
        });
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
