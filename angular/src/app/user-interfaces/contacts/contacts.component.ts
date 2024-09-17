import { ContactFormArray } from '../../shared/models/contact-form-array';
import { ContactFormGroup } from '../../shared/models/contact-form-group';
import { Contact } from '../../shared/models/contact';

import { ContactArray } from '../../shared/models/contact-array';

import { StaffFormArray } from '../../shared/models/staff-form-array';
import { StaffFormGroup } from '../../shared/models/staff-form-group';
import { Staff } from '../../shared/models/staff';

import { StaffArray } from '../../shared/models/staff-array';
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
    selector: 'contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss'],
    host: { class: ' apex-designer-page' },
})
export class ContactsComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    contacts: ContactFormArray;

    staff: StaffFormArray;

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
        this.apexDesignerUserInterfacesService.setCurrentUserInterfaceId(57152);
    }

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.contacts = new ContactFormArray({
            include: { company: {} },
            http: this.httpClient,
            read: 'Automatically',
            save: 'Automatically',
        });

        this.staff = new StaffFormArray({
            http: this.httpClient,
            read: 'Automatically',
            save: 'Never',
        });

        this._isInitComplete = true;
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
