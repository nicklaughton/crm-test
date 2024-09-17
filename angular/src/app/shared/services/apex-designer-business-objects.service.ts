import { Injectable } from '@angular/core';

import { Company } from '../models/company';
import { CompanyArray } from '../models/company-array';
import { CompanyFormGroup } from '../models/company-form-group';
import { CompanyFormArray } from '../models/company-form-array';

import { Project } from '../models/project';
import { ProjectArray } from '../models/project-array';
import { ProjectFormGroup } from '../models/project-form-group';
import { ProjectFormArray } from '../models/project-form-array';

import { Staff } from '../models/staff';
import { StaffArray } from '../models/staff-array';
import { StaffFormGroup } from '../models/staff-form-group';
import { StaffFormArray } from '../models/staff-form-array';

import { Contact } from '../models/contact';
import { ContactArray } from '../models/contact-array';
import { ContactFormGroup } from '../models/contact-form-group';
import { ContactFormArray } from '../models/contact-form-array';

import { Industry } from '../models/industry';
import { IndustryArray } from '../models/industry-array';
import { IndustryFormGroup } from '../models/industry-form-group';
import { IndustryFormArray } from '../models/industry-form-array';

import { Image } from '../models/image';
import { ImageArray } from '../models/image-array';
import { ImageFormGroup } from '../models/image-form-group';
import { ImageFormArray } from '../models/image-form-array';

import { Supplier } from '../models/supplier';
import { SupplierArray } from '../models/supplier-array';
import { SupplierFormGroup } from '../models/supplier-form-group';
import { SupplierFormArray } from '../models/supplier-form-array';

import { Auth0User } from '../models/auth0-user';
import { Auth0UserArray } from '../models/auth0-user-array';
import { Auth0UserFormGroup } from '../models/auth0-user-form-group';
import { Auth0UserFormArray } from '../models/auth0-user-form-array';

import { User } from '../models/user';
import { UserArray } from '../models/user-array';
import { UserFormGroup } from '../models/user-form-group';
import { UserFormArray } from '../models/user-form-array';

import { AppUser } from '../models/app-user';
import { AppUserArray } from '../models/app-user-array';
import { AppUserFormGroup } from '../models/app-user-form-group';
import { AppUserFormArray } from '../models/app-user-form-array';

import { Role } from '../models/role';
import { RoleArray } from '../models/role-array';
import { RoleFormGroup } from '../models/role-form-group';
import { RoleFormArray } from '../models/role-form-array';

import { AppUserToRole } from '../models/app-user-to-role';
import { AppUserToRoleArray } from '../models/app-user-to-role-array';
import { AppUserToRoleFormGroup } from '../models/app-user-to-role-form-group';
import { AppUserToRoleFormArray } from '../models/app-user-to-role-form-array';

import * as changeCase from 'change-case';

@Injectable()
export class ApexDesignerBusinessObjectsService {
    get Company() {
        return Company.metadata;
    }

    get Project() {
        return Project.metadata;
    }

    get Staff() {
        return Staff.metadata;
    }

    get Contact() {
        return Contact.metadata;
    }

    get Industry() {
        return Industry.metadata;
    }

    get Image() {
        return Image.metadata;
    }

    get StaffRole() {
        return {
            name: `StaffRole`,
            pluralName: `StaffRoles`,
            displayName: `Staff Role`,
            pluralDisplayName: `Staff Roles`,
            infiniteArticle: `a`,
            uuid: `001a8bb9-8960-4178-9b2d-a66729eb2d40`,
            description: null,
            isInRootProject: true,
            isClientSideOnly: false,

            validValues: [
                { displayName: 'Manager', value: 'Manager' },
                { displayName: 'Developer', value: 'Developer' },
                { displayName: 'Architect', value: 'Architect' },
            ],
            nativeType: 'string',
        };
    }

    get Supplier() {
        return Supplier.metadata;
    }

    get State() {
        return {
            name: `State`,
            pluralName: `States`,
            displayName: `State`,
            pluralDisplayName: `States`,
            infiniteArticle: `a`,
            uuid: `dddecd03-d9e8-499a-b089-2e286bad6557`,
            description: null,

            isClientSideOnly: false,

            minLength: 2,
            maxLength: 2,
            nativeType: 'string',
        };
    }

    get Country() {
        return {
            name: `Country`,
            pluralName: `Countries`,
            displayName: `Country`,
            pluralDisplayName: `Countries`,
            infiniteArticle: `a`,
            uuid: `89ec6eb3-172e-4367-9bc3-e707b45ad473`,
            description: null,

            isClientSideOnly: true,

            minLength: 2,
            maxLength: 2,
            nativeType: 'string',
        };
    }

    get Auth0User() {
        return Auth0User.metadata;
    }

    get User() {
        return User.metadata;
    }

    get AppUser() {
        return AppUser.metadata;
    }

    get Role() {
        return Role.metadata;
    }

    get AppUserToRole() {
        return AppUserToRole.metadata;
    }

    get DateWithoutTime() {
        return {
            name: `DateWithoutTime`,
            pluralName: `DateWithoutTimes`,
            displayName: `Date Without Time`,
            pluralDisplayName: `Date Without Times`,
            infiniteArticle: `a`,
            uuid: `b9aab877-ec27-4a77-95a7-f64c403c5ac2`,
            description: null,

            isClientSideOnly: false,

            pattern: `(\\d{4})-(\\d{2})-(\\d{2})`,
            minLength: 10,
            maxLength: 10,
            nativeType: 'string',
        };
    }

    get Integer() {
        return {
            name: `Integer`,
            pluralName: `Integers`,
            displayName: `Integer`,
            pluralDisplayName: `Integers`,
            infiniteArticle: `an`,
            uuid: `953b74cf-1761-4bd1-8256-2c8bb9116ab9`,
            description: null,

            isClientSideOnly: false,

            nativeType: 'number',
        };
    }

    get MultilineString() {
        return {
            name: `MultilineString`,
            pluralName: `MultilineStrings`,
            displayName: `Multiline String`,
            pluralDisplayName: `Multiline Strings`,
            infiniteArticle: `a`,
            uuid: `eb235956-c470-4c9e-941f-00f0bf90482b`,
            description: null,

            isClientSideOnly: false,

            nativeType: 'string',
        };
    }

    get Currency() {
        return {
            name: `Currency`,
            pluralName: `Currencies`,
            displayName: `Currency`,
            pluralDisplayName: `Currencies`,
            infiniteArticle: `a`,
            uuid: `e7a6749b-081f-415a-94d2-aaed44474ecc`,
            description: null,

            isClientSideOnly: false,

            nativeType: 'number',
        };
    }

    get DateWithFixedTimezone() {
        return {
            name: `DateWithFixedTimezone`,
            pluralName: `DateWithFixedTimezones`,
            displayName: `Date With Fixed Timezone`,
            pluralDisplayName: `Date With Fixed Timezones`,
            infiniteArticle: `a`,
            uuid: `275de895-0deb-41bd-89de-96663a0bdf32`,
            description: null,

            isClientSideOnly: false,

            nativeType: 'Date',
        };
    }

    get EmailAddress() {
        return {
            name: `EmailAddress`,
            pluralName: `EmailAddresses`,
            displayName: `Email Address`,
            pluralDisplayName: `Email Addresses`,
            infiniteArticle: `an`,
            uuid: `90d22f89-5315-4d09-acfb-ecb0b326e176`,
            description: null,

            isClientSideOnly: false,

            pattern: `^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$`,
            patternMessage: `Please enter a valid email address.`,
            nativeType: 'string',
        };
    }

    list(): any[] {
        return [
            this.Company,

            this.Project,

            this.Staff,

            this.Contact,

            this.Industry,

            this.Image,

            this.StaffRole,

            this.Supplier,

            this.State,

            this.Country,

            this.Auth0User,

            this.User,

            this.AppUser,

            this.Role,

            this.AppUserToRole,

            this.DateWithoutTime,

            this.Integer,

            this.MultilineString,

            this.Currency,

            this.DateWithFixedTimezone,

            this.EmailAddress,
        ];
    }

    listRootProjectObjects(): any[] {
        return this.list().filter((obj) => obj.isInRootProject);
    }

    properties(
        businessObjectName: string,
        allFields: boolean,
        includeId?: boolean
    ): any[] {
        let properties = [];
        let businessObject = this[businessObjectName];
        if (businessObject) {
            properties = JSON.parse(JSON.stringify(businessObject.properties));

            if (allFields) {
                let idProperty = properties.find(
                    (property: any) => property.isId
                );
                if (idProperty && !includeId) {
                    const index = properties.indexOf(idProperty);
                    properties.splice(index, 1);
                } else if (!idProperty && includeId) {
                    idProperty = {
                        name: 'id',
                        displayName: 'Id',
                        isId: true,
                        type: {
                            name: 'number',
                        },
                    };
                    properties.unshift(idProperty);
                }

                for (let relationName in businessObject.relationships) {
                    let relation = businessObject.relationships[relationName];
                    if (
                        relation.type == 'belongs to' ||
                        relation.type == 'references'
                    ) {
                        let foreignKeyName =
                            relation.foreignKey || relationName + 'Id';
                        let foreignKeyProperty = properties.find(
                            (property: any) => property.name == foreignKeyName
                        );
                        if (!foreignKeyProperty) {
                            const foreignBusinessObject =
                                this[relation.businessObject.name];
                            const foreignBusinessObjectIdProperty =
                                foreignBusinessObject.properties.find(
                                    (property: any) => property.isId
                                );
                            foreignKeyProperty = {
                                name: foreignKeyName,
                                displayName:
                                    changeCase.capitalCase(foreignKeyName),
                                type: {
                                    name: foreignBusinessObjectIdProperty
                                        ? foreignBusinessObjectIdProperty.type
                                              .name
                                        : 'number',
                                },
                            };
                        }
                        properties.push(foreignKeyProperty);
                    }
                }
            } else {
                properties = properties.filter(
                    (property: any) => !property.isId && !property.isHidden
                );
            }
        }
        return properties;
    }
}
