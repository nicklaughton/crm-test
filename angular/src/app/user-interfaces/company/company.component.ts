import { CompanyFormArray } from '../../shared/models/company-form-array';
import { CompanyFormGroup } from '../../shared/models/company-form-group';
import { Company } from '../../shared/models/company';

import { CompanyArray } from '../../shared/models/company-array';
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
    selector: 'company',
    templateUrl: './company.component.html',
    styleUrls: ['./company.component.scss'],
    host: { class: ' apex-designer-page' },
})
export class CompanyComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;
    _generatedSubscriptions: any[] = [];

    company: CompanyFormGroup;

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
        this.apexDesignerUserInterfacesService.setCurrentUserInterfaceId(57150);
    }

    @ViewChild('addContactDialog', { static: false } as any) addContactDialog;

    @ViewChild('addProjectDialog', { static: false } as any) addProjectDialog;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.company = new CompanyFormGroup({
            include: { projects: {}, contacts: { include: { image: {} } } },
            http: this.httpClient,
            read: 'Automatically',
            save: 'Automatically',
        });

        this._generatedSubscriptions.push(
            this.route.params.subscribe((params: Params) => {
                if (this['company'])
                    this['company']['id'] =
                        Number(params['company.id']) ||
                        (decodeURIComponent(params['company.id']) as any);
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
