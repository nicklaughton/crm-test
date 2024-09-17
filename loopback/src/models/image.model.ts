import {
    Entity,
    model,
    property,
    belongsTo,
    hasMany,
    hasOne,
} from '@loopback/repository';
import { BaseEntity } from './base-entity';
import { ContactModel, ContactWithRelations } from './contact.model';

import { ExportImportModelMixin } from '../mixins/export-import-model.mixin';

@model({
    settings: {
        strict: true,
        name: 'Image',
        displayName: 'Image',
        resourceName: 'Images',

        postgresql: { table: 'image' },

        indexes: {},
        partialIndexes: {},
        keyRelations: {
            contact: {
                type: 'belongsTo',
                modelTo: 'ContactModel',
                model: 'ContactModel',
                foreignKey: 'contactId',
                onDelete: 'CASCADE',
            },
        },
    },
})
export class ImageModel extends ExportImportModelMixin(BaseEntity) {
    @property({
        type: 'number',
        id: true,
        generated: true,
    })
    id?: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    fileName?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    mimeType?: string;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
    })
    size?: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    base64Content?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    hash?: string;

    @belongsTo(() => ContactModel, {}, { jsonSchema: { nullable: true } })
    contactId: number;

    contact?: ContactWithRelations;

    constructor(data?: Partial<ImageModel>) {
        super(data);
    }
}

export interface ImageRelations {
    // describe navigational properties here
}

export type ImageWithRelations = ImageModel & ImageRelations;
