import { ContactFormArray } from '../../shared/models/contact-form-array';
import { ContactFormGroup } from '../../shared/models/contact-form-group';
import { Contact } from '../../shared/models/contact';

import { ContactArray } from '../../shared/models/contact-array';
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
    selector: 'contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss'],
    host: { class: ' apex-designer-page' },
})
export class ContactComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;
    _generatedSubscriptions: any[] = [];

    contact: ContactFormGroup;

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
    ) {
        this.apexDesignerUserInterfacesService.setCurrentUserInterfaceId(57154);
    }

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.contact = new ContactFormGroup({
            include: { image: { fields: { base64Content: false } } },
            http: this.httpClient,
            read: 'Automatically',
            save: 'Automatically',
        });

        this._generatedSubscriptions.push(
            this.route.params.subscribe((params: Params) => {
                if (this['contact'])
                    this['contact']['id'] =
                        Number(params['contact.id']) ||
                        (decodeURIComponent(params['contact.id']) as any);
            })
        );

        this._isInitComplete = true;
    }

    ngOnDestroy() {
        if (this._generatedSubscriptions)
            this._generatedSubscriptions.forEach((sub) => sub.unsubscribe());

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
