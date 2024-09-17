import { Injectable } from '@angular/core';
import { ApexClientRepository } from '../models/apex-client-repository';
import { HttpClient } from '@angular/common/http';

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

@Injectable({
    providedIn: 'root',
})
export class InitializeService {
    constructor(private readonly httpClient: HttpClient) {}

    /* 
		Initialize repositories for Apex Data Objects/Arrays
	*/
    init() {
        Company.init(
            new ApexClientRepository(this.httpClient, '/api/Companies'),
            Company,
            CompanyArray
        );
        CompanyArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/Companies')
        );
        Company.metadata['class'] = Company;
        Company.metadata['arrayClass'] = CompanyArray;
        Company.metadata['formGroupClass'] = CompanyFormGroup;
        Company.metadata['formArrayClass'] = CompanyFormArray;
        CompanyArray.metadata = Company.metadata;

        Project.init(
            new ApexClientRepository(this.httpClient, '/api/Projects'),
            Project,
            ProjectArray
        );
        ProjectArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/Projects')
        );
        Project.metadata['class'] = Project;
        Project.metadata['arrayClass'] = ProjectArray;
        Project.metadata['formGroupClass'] = ProjectFormGroup;
        Project.metadata['formArrayClass'] = ProjectFormArray;
        ProjectArray.metadata = Project.metadata;

        Staff.init(
            new ApexClientRepository(this.httpClient, '/api/Staff'),
            Staff,
            StaffArray
        );
        StaffArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/Staff')
        );
        Staff.metadata['class'] = Staff;
        Staff.metadata['arrayClass'] = StaffArray;
        Staff.metadata['formGroupClass'] = StaffFormGroup;
        Staff.metadata['formArrayClass'] = StaffFormArray;
        StaffArray.metadata = Staff.metadata;

        Contact.init(
            new ApexClientRepository(this.httpClient, '/api/Contacts'),
            Contact,
            ContactArray
        );
        ContactArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/Contacts')
        );
        Contact.metadata['class'] = Contact;
        Contact.metadata['arrayClass'] = ContactArray;
        Contact.metadata['formGroupClass'] = ContactFormGroup;
        Contact.metadata['formArrayClass'] = ContactFormArray;
        ContactArray.metadata = Contact.metadata;

        Industry.init(
            new ApexClientRepository(this.httpClient, '/api/Industries'),
            Industry,
            IndustryArray
        );
        IndustryArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/Industries')
        );
        Industry.metadata['class'] = Industry;
        Industry.metadata['arrayClass'] = IndustryArray;
        Industry.metadata['formGroupClass'] = IndustryFormGroup;
        Industry.metadata['formArrayClass'] = IndustryFormArray;
        IndustryArray.metadata = Industry.metadata;

        Image.init(
            new ApexClientRepository(this.httpClient, '/api/Images'),
            Image,
            ImageArray
        );
        ImageArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/Images')
        );
        Image.metadata['class'] = Image;
        Image.metadata['arrayClass'] = ImageArray;
        Image.metadata['formGroupClass'] = ImageFormGroup;
        Image.metadata['formArrayClass'] = ImageFormArray;
        ImageArray.metadata = Image.metadata;

        Supplier.init(
            new ApexClientRepository(this.httpClient, '/api/Suppliers'),
            Supplier,
            SupplierArray
        );
        SupplierArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/Suppliers')
        );
        Supplier.metadata['class'] = Supplier;
        Supplier.metadata['arrayClass'] = SupplierArray;
        Supplier.metadata['formGroupClass'] = SupplierFormGroup;
        Supplier.metadata['formArrayClass'] = SupplierFormArray;
        SupplierArray.metadata = Supplier.metadata;

        Auth0User.init(
            new ApexClientRepository(this.httpClient, '/api/Auth0Users'),
            Auth0User,
            Auth0UserArray
        );
        Auth0UserArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/Auth0Users')
        );
        Auth0User.metadata['class'] = Auth0User;
        Auth0User.metadata['arrayClass'] = Auth0UserArray;
        Auth0User.metadata['formGroupClass'] = Auth0UserFormGroup;
        Auth0User.metadata['formArrayClass'] = Auth0UserFormArray;
        Auth0UserArray.metadata = Auth0User.metadata;

        User.init(
            new ApexClientRepository(this.httpClient, '/api/Users'),
            User,
            UserArray
        );
        UserArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/Users')
        );
        User.metadata['class'] = User;
        User.metadata['arrayClass'] = UserArray;
        User.metadata['formGroupClass'] = UserFormGroup;
        User.metadata['formArrayClass'] = UserFormArray;
        UserArray.metadata = User.metadata;

        AppUser.init(
            new ApexClientRepository(this.httpClient, '/api/AppUsers'),
            AppUser,
            AppUserArray
        );
        AppUserArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/AppUsers')
        );
        AppUser.metadata['class'] = AppUser;
        AppUser.metadata['arrayClass'] = AppUserArray;
        AppUser.metadata['formGroupClass'] = AppUserFormGroup;
        AppUser.metadata['formArrayClass'] = AppUserFormArray;
        AppUserArray.metadata = AppUser.metadata;

        Role.init(
            new ApexClientRepository(this.httpClient, '/api/Roles'),
            Role,
            RoleArray
        );
        RoleArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/Roles')
        );
        Role.metadata['class'] = Role;
        Role.metadata['arrayClass'] = RoleArray;
        Role.metadata['formGroupClass'] = RoleFormGroup;
        Role.metadata['formArrayClass'] = RoleFormArray;
        RoleArray.metadata = Role.metadata;

        AppUserToRole.init(
            new ApexClientRepository(this.httpClient, '/api/AppUserToRoles'),
            AppUserToRole,
            AppUserToRoleArray
        );
        AppUserToRoleArray.setRepository(
            new ApexClientRepository(this.httpClient, '/api/AppUserToRoles')
        );
        AppUserToRole.metadata['class'] = AppUserToRole;
        AppUserToRole.metadata['arrayClass'] = AppUserToRoleArray;
        AppUserToRole.metadata['formGroupClass'] = AppUserToRoleFormGroup;
        AppUserToRole.metadata['formArrayClass'] = AppUserToRoleFormArray;
        AppUserToRoleArray.metadata = AppUserToRole.metadata;
    }
}
