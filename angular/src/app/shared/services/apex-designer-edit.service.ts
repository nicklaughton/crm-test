import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Params, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
const debug = require('debug')('ApexDesignerEditService');

@Injectable()
export class ApexDesignerEditService {
    private _apexDesignerUrl: string;
    private _accessToken: string;
    private _setupDebugTimeoutHandle: any;

    constructor(
        private ngZone: NgZone,
        private httpClient: HttpClient,
        private route: ActivatedRoute,
        private router: Router
    ) {
        if (!this._apexDesignerUrl) this._getApexDesignerUrl();
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) this._setupDebug();
        });
    }

    registerComponentInstance(_componentInstance: any) {
        this._setupDebug();
    }
    unregisterComponentInstance(_componentInstance: any) {
        this._setupDebug();
    }

    private _setupDebug() {
        if (this._setupDebugTimeoutHandle)
            clearTimeout(this._setupDebugTimeoutHandle);
        this.ngZone.runOutsideAngular(() => {
            this._setupDebugTimeoutHandle = setTimeout(() => {
                if (window['debug'] && window['debug']['_setup'])
                    window['debug']['_setup']();
            }, 350);
        });
    }

    private _getApexDesignerUrl() {
        // Use the full url so that the auth interceptor does not change the authorization header
        this.httpClient
            .get(
                `${window.location.origin}/apexDesigner/api/ADApplication/getDesignerUrl`,
                {}
            )
            .subscribe(
                (url: string) => {
                    debug('app.apexDesignerURL', url);
                    if (this._apexDesignerUrl != url) {
                        this._apexDesignerUrl = url;

                        this._listenForMessages();
                    }
                },
                (err) => {
                    debug('err', err);
                }
            );
    }

    private _listenForMessages() {
        this.ngZone.runOutsideAngular(() => {
            window['addEventListener'](
                'message',
                (event) => {
                    debug('event', event);
                    debug('event.origin', event.origin);
                    if (event.origin == this._apexDesignerUrl) {
                        this.ngZone.run(() => {
                            this.handleMessage(event);
                        });
                    } else {
                        debug('ignoring event from', event.origin);
                    }
                },
                false
            );
        });
    }

    handleMessage(event: any) {
        const debug = require('debug')('ApexDesignerEditService:handleMessage');
        debug('event', event);
        let message = event.data;
        debug('message', message);
        if (message.type == 'Reload Window') {
            window.location.reload();
        }
    }
}
