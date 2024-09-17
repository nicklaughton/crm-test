import {
    Entity,
    model,
    property,
    belongsTo,
    hasMany,
    hasOne,
} from '@loopback/repository';
import { BaseEntity } from './base-entity';
import { CompanyModel, CompanyWithRelations } from './company.model';
import { ImageModel, ImageWithRelations } from './image.model';

import { EmailAddress } from './';

import { ExportImportModelMixin } from '../mixins/export-import-model.mixin';

@model({
    settings: {
        strict: true,
        name: 'Contact',
        displayName: 'Contact',
        resourceName: 'Contacts',

        memory: { table: 'contact' },

        indexes: {},
        partialIndexes: {},
        keyRelations: {
            image: {
                type: 'hasOne',
                modelTo: 'ImageModel',
                model: 'ImageModel',
                foreignKey: 'contactId',
                onDelete: 'CASCADE',
            },

            company: {
                type: 'belongsTo',
                modelTo: 'CompanyModel',
                model: 'CompanyModel',
                foreignKey: 'companyId',
                onDelete: 'CASCADE',
            },
        },
    },
})
export class ContactModel extends ExportImportModelMixin(BaseEntity) {
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
    name?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    email?: EmailAddress;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    phoneNumber?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    jobTitle?: string;

    @belongsTo(() => CompanyModel, {}, { jsonSchema: { nullable: true } })
    companyId: number;

    @hasOne(() => ImageModel, { keyTo: 'contactId' })
    image: ImageModel;

    company?: CompanyWithRelations;

    constructor(data?: Partial<ContactModel>) {
        super(data);
    }
}

export interface ContactRelations {
    // describe navigational properties here
}

export type ContactWithRelations = ContactModel & ContactRelations;
