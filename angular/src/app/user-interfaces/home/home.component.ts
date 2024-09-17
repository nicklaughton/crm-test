import { ProjectFormArray } from '../../shared/models/project-form-array';
import { ProjectFormGroup } from '../../shared/models/project-form-group';
import { Project } from '../../shared/models/project';

import { ProjectArray } from '../../shared/models/project-array';

import { CompanyFormArray } from '../../shared/models/company-form-array';
import { CompanyFormGroup } from '../../shared/models/company-form-group';
import { Company } from '../../shared/models/company';

import { CompanyArray } from '../../shared/models/company-array';

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
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    host: { class: ' apex-designer-page' },
})
export class HomeComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;
    _generatedSubscriptions: any[] = [];

    projects: ProjectFormArray;

    companies: CompanyFormArray;

    totalValue: string;

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
        this.apexDesignerUserInterfacesService.setCurrentUserInterfaceId(57148);
    }

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.projects = new ProjectFormArray({
            include: { projectManager: {}, company: {} },
            onReadComplete: () => {
                this.calculateValue();
            },
            http: this.httpClient,
            read: 'Automatically',
            save: null,
        });

        this.companies = new CompanyFormArray({
            include: { industry: {} },
            http: this.httpClient,
            read: 'Automatically',
            save: null,
        });

        this.contacts = new ContactFormArray({
            include: { company: {} },
            http: this.httpClient,
            read: 'Automatically',
            save: null,
        });

        this.staff = new StaffFormArray({
            include: { projects: {} },
            http: this.httpClient,
            read: 'Automatically',
            save: null,
        });

        this._isInitComplete = true;
    }

    calculateValue() {
        let debug = Debug('Home:calculateValue');

        var value = 0;
        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        for (let i = 0; i < this.projects.length; i++) {
            debug('total', this.projects[i].total);
            value += parseInt(this.projects[i].total);
            debug('value', value);
        }
        this.totalValue = formatter.format(value);

        debug('this.totalValue', this.totalValue);
    }

    ngOnDestroy() {
        if (this._generatedSubscriptions)
            this._generatedSubscriptions.forEach((sub) => sub.unsubscribe());

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
