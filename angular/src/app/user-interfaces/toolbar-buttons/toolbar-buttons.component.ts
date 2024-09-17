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
    selector: 'toolbar-buttons',
    templateUrl: './toolbar-buttons.component.html',
    styleUrls: ['./toolbar-buttons.component.scss'],
})
export class ToolbarButtonsComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    openDocs: boolean;

    /******************************************************/

    constructor(
        private httpClient: HttpClient,
        public route: ActivatedRoute,
        public router: Router,
        public translate: TranslateService,
        private apexDesignerEditService: ApexDesignerEditService,
        private viewContainerRef: ViewContainerRef,
        @Inject(forwardRef(() => ApexDesignerUserInterfacesService))
        public apexDesignerUserInterfacesService: any
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.openDocs = false;

        this.bootGoogleTagManager();
        this.openDocsFirstTime();
        this._isInitComplete = true;
    }

    bootGoogleTagManager() {
        //Google Tag Manager setup
        //For collecting usage information on the sample app. If you are using this app as a template, update this method to initialize your analytics solution or delete it.

        let w = window;
        let d = document;
        let s = 'script';
        let l = 'dataLayer';
        let i = 'GTM-WK25X9V';

        w[l] = w[l] || [];
        w[l].push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js',
        });
        var f = d.getElementsByTagName(s)[0],
            j: any = d.createElement(s),
            dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
    }

    openDocsFirstTime() {
        let debug = Debug('ToolbarButtons:openDocsFirstTime');

        let key = 'readDocuments';
        debug('readDocuments cookie', readCookie(key));

        if (!readCookie(key)) {
            this.openDocs = true;
            createCookie(key, 'read');
        }

        function createCookie(name, value) {
            document.cookie = name + '=' + value + '; path=/';
            debug('document.cookie', document.cookie);
        }
        function readCookie(name) {
            var nameEQ = name + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0)
                    return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
