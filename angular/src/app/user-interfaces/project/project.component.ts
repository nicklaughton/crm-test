import { ProjectFormArray } from '../../shared/models/project-form-array';
import { ProjectFormGroup } from '../../shared/models/project-form-group';
import { Project } from '../../shared/models/project';

import { ProjectArray } from '../../shared/models/project-array';
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
    selector: 'project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss'],
    host: { class: ' apex-designer-page' },
})
export class ProjectComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;
    _generatedSubscriptions: any[] = [];

    project: ProjectFormGroup;

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
        this.apexDesignerUserInterfacesService.setCurrentUserInterfaceId(57149);
    }

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.project = new ProjectFormGroup({
            include: { company: {}, projectManager: {} },
            http: this.httpClient,
            read: 'Automatically',
            save: 'Automatically',
        });

        this._generatedSubscriptions.push(
            this.route.params.subscribe((params: Params) => {
                if (this['project'])
                    this['project']['id'] =
                        Number(params['project.id']) ||
                        (decodeURIComponent(params['project.id']) as any);
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
