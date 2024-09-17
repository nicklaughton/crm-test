import { ApexDataArray } from '../../shared/models/apex-data-array';
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
    selector: 'apex-crm-add-button',
    templateUrl: './apex-crm-add-button.component.html',
    styleUrls: ['./apex-crm-add-button.component.scss'],
})
export class ApexCRMAddButtonComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    array: ApexDataArray;

    @Input()
    defaults: any;

    @Input()
    allFields: boolean;

    @Input()
    includeRelationshipsCsv: string;

    @Input()
    inputRequiredFieldsCsv: string;

    label: string;

    @Input()
    addMultiple: boolean;

    @Input()
    buttonType: string = 'FAB';

    @Output() added: EventEmitter<any> = new EventEmitter(true);

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

    @ViewChild('dialog', { static: false } as any) dialog;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this.dump();
        this._isInitComplete = true;
    }

    dump() {
        let debug = Debug('ApexCRMAddButton:dump');

        debug('this.array', this.array);
        debug('this.defaults', this.defaults);
        debug('this.allFields', this.allFields);
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
