// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';
import { ApexDynamicComponentsService } from '../../shared/services/apex-dynamic-components.service';

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
    selector: 'apex-state-field',
    templateUrl: './apex-state-field.component.html',
    styleUrls: ['./apex-state-field.component.scss'],
})
export class ApexStateFieldComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    control: ApexFormControl;

    @Input()
    label: string;

    options: any[];

    @Input()
    noPadding: boolean;

    @Input()
    required: boolean;

    _subscriptions: any[];

    @Output() changed: EventEmitter<string> = new EventEmitter(true);

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

        public apexDynamicComponentsService: ApexDynamicComponentsService
    ) {}

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this._subscriptions = [];

        this.setOptions();
        this.init();
        this._isInitComplete = true;
    }

    setOptions() {
        this.options = [
            {
                name: 'Alabama',
                value: 'AL',
            },
            {
                name: 'Alaska',
                value: 'AK',
            },
            {
                name: 'American Samoa',
                value: 'AS',
            },
            {
                name: 'Arizona',
                value: 'AZ',
            },
            {
                name: 'Arkansas',
                value: 'AR',
            },
            {
                name: 'California',
                value: 'CA',
            },
            {
                name: 'Colorado',
                value: 'CO',
            },
            {
                name: 'Connecticut',
                value: 'CT',
            },
            {
                name: 'Delaware',
                value: 'DE',
            },
            {
                name: 'District of Columbia',
                value: 'DC',
            },
            {
                name: 'Federated States of Micronesia',
                value: 'FM',
            },
            {
                name: 'Florida',
                value: 'FL',
            },
            {
                name: 'Georgia',
                value: 'GA',
            },
            {
                name: 'Guam',
                value: 'GU',
            },
            {
                name: 'Hawaii',
                value: 'HI',
            },
            {
                name: 'Idaho',
                value: 'ID',
            },
            {
                name: 'Illinois',
                value: 'IL',
            },
            {
                name: 'Indiana',
                value: 'IN',
            },
            {
                name: 'Iowa',
                value: 'IA',
            },
            {
                name: 'Kansas',
                value: 'KS',
            },
            {
                name: 'Kentucky',
                value: 'KY',
            },
            {
                name: 'Louisiana',
                value: 'LA',
            },
            {
                name: 'Maine',
                value: 'ME',
            },
            {
                name: 'Marshall Islands',
                value: 'MH',
            },
            {
                name: 'Maryland',
                value: 'MD',
            },
            {
                name: 'Massachusetts',
                value: 'MA',
            },
            {
                name: 'Michigan',
                value: 'MI',
            },
            {
                name: 'Minnesota',
                value: 'MN',
            },
            {
                name: 'Mississippi',
                value: 'MS',
            },
            {
                name: 'Missouri',
                value: 'MO',
            },
            {
                name: 'Montana',
                value: 'MT',
            },
            {
                name: 'Nebraska',
                value: 'NE',
            },
            {
                name: 'Nevada',
                value: 'NV',
            },
            {
                name: 'New Hampshire',
                value: 'NH',
            },
            {
                name: 'New Jersey',
                value: 'NJ',
            },
            {
                name: 'New Mexico',
                value: 'NM',
            },
            {
                name: 'New York',
                value: 'NY',
            },
            {
                name: 'North Carolina',
                value: 'NC',
            },
            {
                name: 'North Dakota',
                value: 'ND',
            },
            {
                name: 'Northern Mariana Islands',
                value: 'MP',
            },
            {
                name: 'Ohio',
                value: 'OH',
            },
            {
                name: 'Oklahoma',
                value: 'OK',
            },
            {
                name: 'Oregon',
                value: 'OR',
            },
            {
                name: 'Palau',
                value: 'PW',
            },
            {
                name: 'Pennsylvania',
                value: 'PA',
            },
            {
                name: 'Puerto Rico',
                value: 'PR',
            },
            {
                name: 'Rhode Island',
                value: 'RI',
            },
            {
                name: 'South Carolina',
                value: 'SC',
            },
            {
                name: 'South Dakota',
                value: 'SD',
            },
            {
                name: 'Tennessee',
                value: 'TN',
            },
            {
                name: 'Texas',
                value: 'TX',
            },
            {
                name: 'Utah',
                value: 'UT',
            },
            {
                name: 'Vermont',
                value: 'VT',
            },
            {
                name: 'Virgin Islands',
                value: 'VI',
            },
            {
                name: 'Virginia',
                value: 'VA',
            },
            {
                name: 'Washington',
                value: 'WA',
            },
            {
                name: 'West Virginia',
                value: 'WV',
            },
            {
                name: 'Wisconsin',
                value: 'WI',
            },
            {
                name: 'Wyoming',
                value: 'WY',
            },
        ];
    }

    init() {
        let debug = Debug('ApexStateField:init');

        debug('this.control', this.control);
        if (this.control) {
            this.unsubscribe();

            const valueChanges =
                this.apexDynamicComponentsService.getValueChangesObservable<string>(
                    this.control,
                    null
                );

            this._subscriptions.push(
                valueChanges.subscribe((newValue) => {
                    this.changed.emit(newValue);
                })
            );
        }
    }

    unsubscribe() {
        if (this._subscriptions)
            this._subscriptions.forEach((sub) => sub.unsubscribe());
        this._subscriptions = [];
    }

    ngOnDestroy() {
        this.unsubscribe();

        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
