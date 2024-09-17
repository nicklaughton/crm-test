import { ImageFormArray } from '../../shared/models/image-form-array';
import { ImageFormGroup } from '../../shared/models/image-form-group';
import { Image } from '../../shared/models/image';

import { ImageArray } from '../../shared/models/image-array';
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
    selector: 'image-section',
    templateUrl: './image-section.component.html',
    styleUrls: ['./image-section.component.scss'],
})
export class ImageSectionComponent implements OnInit, OnDestroy {
    /**Properties******************************************/
    _isInitComplete: boolean;

    @Input()
    image: ImageFormGroup;

    uploading: boolean;

    @Output() imageChange: EventEmitter<ImageFormGroup> = new EventEmitter(
        true
    );

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

    @ViewChild('fileUploadInput', { static: false } as any) fileUploadInput;

    /**Methods*********************************************/

    ngOnInit() {
        this.apexDesignerEditService.registerComponentInstance(this);

        this._isInitComplete = true;
    }

    upload() {
        let debug = Debug('ImageSection:upload');

        debug('this.fileUploadInput', this.fileUploadInput);

        let files = this.fileUploadInput.nativeElement.files;
        debug('files', files);

        if (files && files.length == 1) {
            let file = files[0];
            debug('file', file);

            let reader: FileReader = new FileReader();

            reader.onload = async () => {
                debug('file', file);

                if (file.size > 10 * 1024 * 1024) {
                    throw `That file is ${Math.ceil(
                        file.size / (1024 * 1024)
                    )}mb. You can upload files up to 10mb in size.`;
                }

                this.uploading = true;

                const base64 = (reader.result + '').split(',')[1];

                if (!this.image) {
                    this.image = await ImageFormGroup.create({
                        fileName: file.name,
                        mimeType: file.type,
                        size: file.size,
                        base64Content: base64,
                    });
                    this.imageChange.emit(this.image);
                } else {
                    this.image.fileName = file.name;
                    this.image.mimeType = file.type;
                    this.image.size = file.size;
                    this.image.base64Content = base64;
                    await this.image.save();
                }

                this.uploading = false;

                this.fileUploadInput.nativeElement.value = '';
            };

            reader.readAsDataURL(file);
        }
    }

    async remove() {
        await this.image.delete();
        this.image = null;
        this.imageChange.emit(this.image);
    }

    ngOnDestroy() {
        this.apexDesignerEditService.unregisterComponentInstance(this);
    }
    /******************************************************/
}
