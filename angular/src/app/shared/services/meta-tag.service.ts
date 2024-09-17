// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Title, Meta } from '@angular/platform-browser';

import { NavigationEnd, ActivatedRoute, Params, Router } from '@angular/router';

import { ApexDesignerUserInterfacesService } from '../../shared/services/apex-designer-user-interfaces.service';

import { PackageService } from '../../shared/services/package.service';

import {
    Component,
    Injectable,
    EventEmitter,
    ViewChild,
    ViewContainerRef,
    Inject,
    forwardRef,
} from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Debug from 'debug';
@Injectable({ providedIn: 'root' })
export class MetaTagService {
    /**Properties******************************************/
    private _isInitComplete: boolean;

    subscription: any;

    private _title: string;

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        if (value != this._title) {
            this._title = value;
            if (this._isInitComplete) this.setTags();
        }
    }

    private _description: string;

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        if (value != this._description) {
            this._description = value;
            if (this._isInitComplete) this.setTags();
        }
    }

    private _author: string;

    get author(): string {
        return this._author;
    }

    set author(value: string) {
        if (value != this._author) {
            this._author = value;
            if (this._isInitComplete) this.setTags();
        }
    }

    private _twitterUsername: string;

    get twitterUsername(): string {
        return this._twitterUsername;
    }

    set twitterUsername(value: string) {
        if (value != this._twitterUsername) {
            this._twitterUsername = value;
            if (this._isInitComplete) this.setTags();
        }
    }

    private _facebookUrl: string;

    get facebookUrl(): string {
        return this._facebookUrl;
    }

    set facebookUrl(value: string) {
        if (value != this._facebookUrl) {
            this._facebookUrl = value;
            if (this._isInitComplete) this.setTags();
        }
    }

    timeout: any;

    userInterfacesByPath: any;

    private _imageUrl: string;

    get imageUrl(): string {
        return this._imageUrl;
    }

    set imageUrl(value: string) {
        if (value != this._imageUrl) {
            this._imageUrl = value;
            if (this._isInitComplete) this.setTags();
        }
    }

    private _imageAlt: string;

    get imageAlt(): string {
        return this._imageAlt;
    }

    set imageAlt(value: string) {
        if (value != this._imageAlt) {
            this._imageAlt = value;
            if (this._isInitComplete) this.setTags();
        }
    }

    /******************************************************/

    constructor(
        private httpClient: HttpClient,
        public route: ActivatedRoute,
        public router: Router,

        private titleService: Title,
        private metaService: Meta,
        @Inject(forwardRef(() => ApexDesignerUserInterfacesService))
        private apexDesignerUserInterfacesService: any,
        private packageService: PackageService
    ) {
        this.initialize();
        this.setTags();

        this._isInitComplete = true;
    }

    /**Methods*********************************************/

    initialize() {
        let debug = Debug('MetaTagService:initialize');

        let pages = this.apexDesignerUserInterfacesService
            .list()
            .filter(
                (userInterface: any) =>
                    userInterface.path && userInterface.path !== 'null'
            );
        debug('pages', pages);

        this.userInterfacesByPath = {};
        for (let userInterface of pages) {
            let levels = userInterface.path.split('/');
            levels.forEach((level, index) => {
                if (level.startsWith(':')) {
                    levels[index] = '*';
                }
            });
            const path = levels.join('/');
            this.userInterfacesByPath[path] = userInterface;
        }
        debug('this.userInterfacesByPath', this.userInterfacesByPath);

        this.subscription = this.router.events.subscribe(async (event: any) => {
            if (event instanceof NavigationEnd) {
                debug('event', event);

                this.setTitleAndDescription();
            }
        });

        this.setTitleAndDescription();
    }

    setTitleAndDescription() {
        let debug = Debug('MetaTagService:setTitleAndDescription');

        let path = this.router.url.split('?')[0].replace('../', '');
        debug('path', path);

        let levels = path.split('/');
        levels.forEach((level, index) => {
            if (level !== '' && !isNaN(Number(level))) {
                levels[index] = '*';
            }
        });
        path = levels.join('/');
        debug('path', path);

        const userInterface = this.userInterfacesByPath[path];
        if (userInterface) {
            debug('userInterface', userInterface);

            debug('userInterface.displayName', userInterface.displayName);

            this.title =
                userInterface.displayName +
                ' | ' +
                this.packageService.applicationTitle;
            debug('this.title', this.title);

            this.description =
                userInterface.description || this.packageService.description;
            debug('this.description', this.description);
        } else {
            this.title = this.packageService.applicationTitle;
            debug('this.title', this.title);

            this.description = this.packageService.description;
            debug('this.description', this.description);
        }
    }

    setTags() {
        let debug = Debug('MetaTagService:setTags');

        debug('this.timeout', this.timeout);
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.metaService.updateTag({
                property: 'og:type',
                content: 'website',
            });

            this.metaService.updateTag({
                property: 'og:url',
                content: window.location.href,
            });

            this.metaService.updateTag({
                name: 'referrer',
                content: 'no-referrer-when-downgrade',
            });

            if (this.title) {
                this.titleService.setTitle(this.title);
                this.metaService.updateTag({
                    property: 'og:title',
                    content: this.title,
                });
            } else {
                this.metaService.removeTag('property="og:title"');
            }

            if (this.description) {
                this.metaService.updateTag({
                    property: 'og:description',
                    content: this.description,
                });
                this.metaService.updateTag({
                    name: 'description',
                    content: this.description,
                });
            } else {
                this.metaService.removeTag('property="og:description"');
                this.metaService.removeTag('name="description"');
            }

            if (this.imageUrl) {
                this.metaService.updateTag({
                    property: 'og:image',
                    content: this.imageUrl,
                });
            } else {
                this.metaService.removeTag('property="og:image"');
            }

            if (this.imageAlt) {
                this.metaService.updateTag({
                    property: 'og:image:alt',
                    content: this.imageAlt,
                });
            } else {
                this.metaService.removeTag('property="og:image:alt"');
            }

            if (this.author) {
                this.metaService.updateTag({
                    name: 'author',
                    content: this.author,
                });
            }

            if (this.twitterUsername) {
                this.metaService.updateTag({
                    name: 'twitter:site',
                    content: this.twitterUsername,
                });
            }

            if (this.facebookUrl) {
                this.metaService.updateTag({
                    property: 'article:publisher',
                    content: this.facebookUrl,
                });
            }

            if (debug.enabled) {
                document.querySelectorAll('meta').forEach((node: any) => {
                    debug('meta tag', node);
                });
            }
        });
    }

    unsubscribe() {
        let debug = Debug('MetaTagService:unsubscribe');

        if (this.subscription) {
            debug('unsubscribing');
            this.subscription.unsubscribe();
        }
    }

    /******************************************************/
}
