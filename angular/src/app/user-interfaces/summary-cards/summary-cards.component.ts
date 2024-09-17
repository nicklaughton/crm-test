import { ProjectFormArray } from '../../shared/models/project-form-array';
import { ProjectFormGroup } from '../../shared/models/project-form-group';
import { Project } from '../../shared/models/project';

import { ProjectArray } from '../../shared/models/project-array';

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
    selector: 'summary-cards',
    templateUrl: './summary-cards.component.html',
    styleUrls: ['./summary-cards.component.scss'],
})
export class SummaryCardsComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    projects: ProjectFormArray;

    @Input()
    companies: CompanyFormArray;

    @Input()
    totalValue: string;

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

        this._isInitComplete = true;
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
