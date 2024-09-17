// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexFormControl } from '../../shared/models/apex-form-control';

import { Subscription } from 'rxjs';
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
    selector: 'country-field',
    templateUrl: './country-field.component.html',
    styleUrls: ['./country-field.component.scss'],
})
export class CountryFieldComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    private _control: ApexFormControl;

    @Input()
    get control(): ApexFormControl {
        return this._control;
    }

    set control(value: ApexFormControl) {
        if (value != this._control) {
            this._control = value;
            if (this._isInitComplete) this.init();
        }
    }

    @Input()
    label: string = 'Country';

    @Input()
    noPadding: boolean;

    options: any[];

    _subscriptions: Subscription[];

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
                name: 'United States',
                value: 'US',
            },
            {
                name: 'Afghanistan',
                value: 'AF',
            },
            {
                name: 'Albania',
                value: 'AL',
            },
            {
                name: 'Algeria',
                value: 'DZ',
            },
            {
                name: 'American Samoa',
                value: 'AS',
            },
            {
                name: 'Andorra',
                value: 'AD',
            },
            {
                name: 'Angola',
                value: 'AO',
            },
            {
                name: 'Anguilla',
                value: 'AI',
            },
            {
                name: 'Antarctica',
                value: 'AQ',
            },
            {
                name: 'Antigua And Barbuda',
                value: 'AG',
            },
            {
                name: 'Argentina',
                value: 'AR',
            },
            {
                name: 'Armenia',
                value: 'AM',
            },
            {
                name: 'Aruba',
                value: 'AW',
            },
            {
                name: 'Australia',
                value: 'AU',
            },
            {
                name: 'Austria',
                value: 'AT',
            },
            {
                name: 'Azerbaijan',
                value: 'AZ',
            },
            {
                name: 'Bahamas',
                value: 'BS',
            },
            {
                name: 'Bahrain',
                value: 'BH',
            },
            {
                name: 'Bangladesh',
                value: 'BD',
            },
            {
                name: 'Barbados',
                value: 'BB',
            },
            {
                name: 'Belarus',
                value: 'BY',
            },
            {
                name: 'Belgium',
                value: 'BE',
            },
            {
                name: 'Belize',
                value: 'BZ',
            },
            {
                name: 'Benin',
                value: 'BJ',
            },
            {
                name: 'Bermuda',
                value: 'BM',
            },
            {
                name: 'Bhutan',
                value: 'BT',
            },
            {
                name: 'Bolivia',
                value: 'BO',
            },
            {
                name: 'Bosnia And Herzegowina',
                value: 'BA',
            },
            {
                name: 'Botswana',
                value: 'BW',
            },
            {
                name: 'Bouvet Island',
                value: 'BV',
            },
            {
                name: 'Brazil',
                value: 'BR',
            },
            {
                name: 'British Indian Ocean Territory',
                value: 'IO',
            },
            {
                name: 'Brunei Darussalam',
                value: 'BN',
            },
            {
                name: 'Bulgaria',
                value: 'BG',
            },
            {
                name: 'Burkina Faso',
                value: 'BF',
            },
            {
                name: 'Burundi',
                value: 'BI',
            },
            {
                name: 'Cambodia',
                value: 'KH',
            },
            {
                name: 'Cameroon',
                value: 'CM',
            },
            {
                name: 'Canada',
                value: 'CA',
            },
            {
                name: 'Cape Verde',
                value: 'CV',
            },
            {
                name: 'Cayman Islands',
                value: 'KY',
            },
            {
                name: 'Central African Republic',
                value: 'CF',
            },
            {
                name: 'Chad',
                value: 'TD',
            },
            {
                name: 'Chile',
                value: 'CL',
            },
            {
                name: 'China',
                value: 'CN',
            },
            {
                name: 'Christmas Island',
                value: 'CX',
            },
            {
                name: 'Cocos (Keeling) Islands',
                value: 'CC',
            },
            {
                name: 'Colombia',
                value: 'CO',
            },
            {
                name: 'Comoros',
                value: 'KM',
            },
            {
                name: 'Congo',
                value: 'CG',
            },
            {
                name: 'Congo, The Democratic Republic Of The',
                value: 'CD',
            },
            {
                name: 'Cook Islands',
                value: 'CK',
            },
            {
                name: 'Costa Rica',
                value: 'CR',
            },
            {
                name: "Cote D'ivoire",
                value: 'CI',
            },
            {
                name: 'Croatia (Local Name: Hrvatska)',
                value: 'HR',
            },
            {
                name: 'Cuba',
                value: 'CU',
            },
            {
                name: 'Cyprus',
                value: 'CY',
            },
            {
                name: 'Czech Republic',
                value: 'CZ',
            },
            {
                name: 'Denmark',
                value: 'DK',
            },
            {
                name: 'Djibouti',
                value: 'DJ',
            },
            {
                name: 'Dominica',
                value: 'DM',
            },
            {
                name: 'Dominican Republic',
                value: 'DO',
            },
            {
                name: 'East Timor',
                value: 'TP',
            },
            {
                name: 'Ecuador',
                value: 'EC',
            },
            {
                name: 'Egypt',
                value: 'EG',
            },
            {
                name: 'El Salvador',
                value: 'SV',
            },
            {
                name: 'Equatorial Guinea',
                value: 'GQ',
            },
            {
                name: 'Eritrea',
                value: 'ER',
            },
            {
                name: 'Estonia',
                value: 'EE',
            },
            {
                name: 'Ethiopia',
                value: 'ET',
            },
            {
                name: 'Falkland Islands (Malvinas)',
                value: 'FK',
            },
            {
                name: 'Faroe Islands',
                value: 'FO',
            },
            {
                name: 'Fiji',
                value: 'FJ',
            },
            {
                name: 'Finland',
                value: 'FI',
            },
            {
                name: 'France',
                value: 'FR',
            },
            {
                name: 'France, Metropolitan',
                value: 'FX',
            },
            {
                name: 'French Guiana',
                value: 'GF',
            },
            {
                name: 'French Polynesia',
                value: 'PF',
            },
            {
                name: 'French Southern Territories',
                value: 'TF',
            },
            {
                name: 'Gabon',
                value: 'GA',
            },
            {
                name: 'Gambia',
                value: 'GM',
            },
            {
                name: 'Georgia',
                value: 'GE',
            },
            {
                name: 'Germany',
                value: 'DE',
            },
            {
                name: 'Ghana',
                value: 'GH',
            },
            {
                name: 'Gibraltar',
                value: 'GI',
            },
            {
                name: 'Greece',
                value: 'GR',
            },
            {
                name: 'Greenland',
                value: 'GL',
            },
            {
                name: 'Grenada',
                value: 'GD',
            },
            {
                name: 'Guadeloupe',
                value: 'GP',
            },
            {
                name: 'Guam',
                value: 'GU',
            },
            {
                name: 'Guatemala',
                value: 'GT',
            },
            {
                name: 'Guinea',
                value: 'GN',
            },
            {
                name: 'Guinea-bissau',
                value: 'GW',
            },
            {
                name: 'Guyana',
                value: 'GY',
            },
            {
                name: 'Haiti',
                value: 'HT',
            },
            {
                name: 'Heard And Mc Donald Islands',
                value: 'HM',
            },
            {
                name: 'Holy See (Vatican City State)',
                value: 'VA',
            },
            {
                name: 'Honduras',
                value: 'HN',
            },
            {
                name: 'Hong Kong',
                value: 'HK',
            },
            {
                name: 'Hungary',
                value: 'HU',
            },
            {
                name: 'Iceland',
                value: 'IS',
            },
            {
                name: 'India',
                value: 'IN',
            },
            {
                name: 'Indonesia',
                value: 'ID',
            },
            {
                name: 'Iran (Islamic Republic Of)',
                value: 'IR',
            },
            {
                name: 'Iraq',
                value: 'IQ',
            },
            {
                name: 'Ireland',
                value: 'IE',
            },
            {
                name: 'Israel',
                value: 'IL',
            },
            {
                name: 'Italy',
                value: 'IT',
            },
            {
                name: 'Jamaica',
                value: 'JM',
            },
            {
                name: 'Japan',
                value: 'JP',
            },
            {
                name: 'Jordan',
                value: 'JO',
            },
            {
                name: 'Kazakhstan',
                value: 'KZ',
            },
            {
                name: 'Kenya',
                value: 'KE',
            },
            {
                name: 'Kiribati',
                value: 'KI',
            },
            {
                name: "Korea, Democratic People's Republic Of",
                value: 'KP',
            },
            {
                name: 'Korea, Republic Of',
                value: 'KR',
            },
            {
                name: 'Kuwait',
                value: 'KW',
            },
            {
                name: 'Kyrgyzstan',
                value: 'KG',
            },
            {
                name: "Lao People's Democratic Republic",
                value: 'LA',
            },
            {
                name: 'Latvia',
                value: 'LV',
            },
            {
                name: 'Lebanon',
                value: 'LB',
            },
            {
                name: 'Lesotho',
                value: 'LS',
            },
            {
                name: 'Liberia',
                value: 'LR',
            },
            {
                name: 'Libyan Arab Jamahiriya',
                value: 'LY',
            },
            {
                name: 'Liechtenstein',
                value: 'LI',
            },
            {
                name: 'Lithuania',
                value: 'LT',
            },
            {
                name: 'Luxembourg',
                value: 'LU',
            },
            {
                name: 'Macau',
                value: 'MO',
            },
            {
                name: 'Macedonia, The Former Yugoslav Republic Of',
                value: 'MK',
            },
            {
                name: 'Madagascar',
                value: 'MG',
            },
            {
                name: 'Malawi',
                value: 'MW',
            },
            {
                name: 'Malaysia',
                value: 'MY',
            },
            {
                name: 'Maldives',
                value: 'MV',
            },
            {
                name: 'Mali',
                value: 'ML',
            },
            {
                name: 'Malta',
                value: 'MT',
            },
            {
                name: 'Marshall Islands',
                value: 'MH',
            },
            {
                name: 'Martinique',
                value: 'MQ',
            },
            {
                name: 'Mauritania',
                value: 'MR',
            },
            {
                name: 'Mauritius',
                value: 'MU',
            },
            {
                name: 'Mayotte',
                value: 'YT',
            },
            {
                name: 'Mexico',
                value: 'MX',
            },
            {
                name: 'Micronesia, Federated States Of',
                value: 'FM',
            },
            {
                name: 'Moldova, Republic Of',
                value: 'MD',
            },
            {
                name: 'Monaco',
                value: 'MC',
            },
            {
                name: 'Mongolia',
                value: 'MN',
            },
            {
                name: 'Montserrat',
                value: 'MS',
            },
            {
                name: 'Morocco',
                value: 'MA',
            },
            {
                name: 'Mozambique',
                value: 'MZ',
            },
            {
                name: 'Myanmar',
                value: 'MM',
            },
            {
                name: 'Namibia',
                value: 'NA',
            },
            {
                name: 'Nauru',
                value: 'NR',
            },
            {
                name: 'Nepal',
                value: 'NP',
            },
            {
                name: 'Netherlands',
                value: 'NL',
            },
            {
                name: 'Netherlands Antilles',
                value: 'AN',
            },
            {
                name: 'New Caledonia',
                value: 'NC',
            },
            {
                name: 'New Zealand',
                value: 'NZ',
            },
            {
                name: 'Nicaragua',
                value: 'NI',
            },
            {
                name: 'Niger',
                value: 'NE',
            },
            {
                name: 'Nigeria',
                value: 'NG',
            },
            {
                name: 'Niue',
                value: 'NU',
            },
            {
                name: 'Norfolk Island',
                value: 'NF',
            },
            {
                name: 'Northern Mariana Islands',
                value: 'MP',
            },
            {
                name: 'Norway',
                value: 'NO',
            },
            {
                name: 'Oman',
                value: 'OM',
            },
            {
                name: 'Pakistan',
                value: 'PK',
            },
            {
                name: 'Palau',
                value: 'PW',
            },
            {
                name: 'Panama',
                value: 'PA',
            },
            {
                name: 'Papua New Guinea',
                value: 'PG',
            },
            {
                name: 'Paraguay',
                value: 'PY',
            },
            {
                name: 'Peru',
                value: 'PE',
            },
            {
                name: 'Philippines',
                value: 'PH',
            },
            {
                name: 'Pitcairn',
                value: 'PN',
            },
            {
                name: 'Poland',
                value: 'PL',
            },
            {
                name: 'Portugal',
                value: 'PT',
            },
            {
                name: 'Puerto Rico',
                value: 'PR',
            },
            {
                name: 'Qatar',
                value: 'QA',
            },
            {
                name: 'Reunion',
                value: 'RE',
            },
            {
                name: 'Romania',
                value: 'RO',
            },
            {
                name: 'Russian Federation',
                value: 'RU',
            },
            {
                name: 'Rwanda',
                value: 'RW',
            },
            {
                name: 'Saint Kitts And Nevis',
                value: 'KN',
            },
            {
                name: 'Saint Lucia',
                value: 'LC',
            },
            {
                name: 'Saint Vincent And The Grenadines',
                value: 'VC',
            },
            {
                name: 'Samoa',
                value: 'WS',
            },
            {
                name: 'San Marino',
                value: 'SM',
            },
            {
                name: 'Sao Tome And Principe',
                value: 'ST',
            },
            {
                name: 'Saudi Arabia',
                value: 'SA',
            },
            {
                name: 'Senegal',
                value: 'SN',
            },
            {
                name: 'Seychelles',
                value: 'SC',
            },
            {
                name: 'Sierra Leone',
                value: 'SL',
            },
            {
                name: 'Singapore',
                value: 'SG',
            },
            {
                name: 'Slovakia (Slovak Republic)',
                value: 'SK',
            },
            {
                name: 'Slovenia',
                value: 'SI',
            },
            {
                name: 'Solomon Islands',
                value: 'SB',
            },
            {
                name: 'Somalia',
                value: 'SO',
            },
            {
                name: 'South Africa',
                value: 'ZA',
            },
            {
                name: 'South Georgia And The South Sandwich Islands',
                value: 'GS',
            },
            {
                name: 'Spain',
                value: 'ES',
            },
            {
                name: 'Sri Lanka',
                value: 'LK',
            },
            {
                name: 'St. Helena',
                value: 'SH',
            },
            {
                name: 'St. Pierre And Miquelon',
                value: 'PM',
            },
            {
                name: 'Sudan',
                value: 'SD',
            },
            {
                name: 'Suriname',
                value: 'SR',
            },
            {
                name: 'Svalbard And Jan Mayen Islands',
                value: 'SJ',
            },
            {
                name: 'Swaziland',
                value: 'SZ',
            },
            {
                name: 'Sweden',
                value: 'SE',
            },
            {
                name: 'Switzerland',
                value: 'CH',
            },
            {
                name: 'Syrian Arab Republic',
                value: 'SY',
            },
            {
                name: 'Taiwan, Province Of China',
                value: 'TW',
            },
            {
                name: 'Tajikistan',
                value: 'TJ',
            },
            {
                name: 'Tanzania, United Republic Of',
                value: 'TZ',
            },
            {
                name: 'Thailand',
                value: 'TH',
            },
            {
                name: 'Togo',
                value: 'TG',
            },
            {
                name: 'Tokelau',
                value: 'TK',
            },
            {
                name: 'Tonga',
                value: 'TO',
            },
            {
                name: 'Trinidad And Tobago',
                value: 'TT',
            },
            {
                name: 'Tunisia',
                value: 'TN',
            },
            {
                name: 'Turkey',
                value: 'TR',
            },
            {
                name: 'Turkmenistan',
                value: 'TM',
            },
            {
                name: 'Turks And Caicos Islands',
                value: 'TC',
            },
            {
                name: 'Tuvalu',
                value: 'TV',
            },
            {
                name: 'Uganda',
                value: 'UG',
            },
            {
                name: 'Ukraine',
                value: 'UA',
            },
            {
                name: 'United Arab Emirates',
                value: 'AE',
            },
            {
                name: 'United Kingdom',
                value: 'GB',
            },
            {
                name: 'United States Minor Outlying Islands',
                value: 'UM',
            },
            {
                name: 'Uruguay',
                value: 'UY',
            },
            {
                name: 'Uzbekistan',
                value: 'UZ',
            },
            {
                name: 'Vanuatu',
                value: 'VU',
            },
            {
                name: 'Venezuela',
                value: 'VE',
            },
            {
                name: 'Viet Nam',
                value: 'VN',
            },
            {
                name: 'Virgin Islands (British)',
                value: 'VG',
            },
            {
                name: 'Virgin Islands (U.S.)',
                value: 'VI',
            },
            {
                name: 'Wallis And Futuna Islands',
                value: 'WF',
            },
            {
                name: 'Western Sahara',
                value: 'EH',
            },
            {
                name: 'Yemen',
                value: 'YE',
            },
            {
                name: 'Yugoslavia',
                value: 'YU',
            },
            {
                name: 'Zambia',
                value: 'ZM',
            },
            {
                name: 'Zimbabwe',
                value: 'ZW',
            },
        ];
    }

    init() {
        let debug = Debug('CountryField:init');

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
