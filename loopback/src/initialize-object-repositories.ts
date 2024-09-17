import { AppUserToRole } from './objects/app-user-to-role';
import { AppUserToRoleArray } from './objects/app-user-to-role-array';
import { AppUserToRoleRepository } from './repositories';

import { Role } from './objects/role';
import { RoleArray } from './objects/role-array';
import { RoleRepository } from './repositories';

import { AppUser } from './objects/app-user';
import { AppUserArray } from './objects/app-user-array';
import { AppUserRepository } from './repositories';

import { User } from './objects/user';
import { UserArray } from './objects/user-array';
import { UserRepository } from './repositories';

import { Auth0User } from './objects/auth0-user';
import { Auth0UserArray } from './objects/auth0-user-array';
import { Auth0UserRepository } from './repositories';

import { Supplier } from './objects/supplier';
import { SupplierArray } from './objects/supplier-array';
import { SupplierRepository } from './repositories';

import { Image } from './objects/image';
import { ImageArray } from './objects/image-array';
import { ImageRepository } from './repositories';

import { Industry } from './objects/industry';
import { IndustryArray } from './objects/industry-array';
import { IndustryRepository } from './repositories';

import { Contact } from './objects/contact';
import { ContactArray } from './objects/contact-array';
import { ContactRepository } from './repositories';

import { Staff } from './objects/staff';
import { StaffArray } from './objects/staff-array';
import { StaffRepository } from './repositories';

import { Project } from './objects/project';
import { ProjectArray } from './objects/project-array';
import { ProjectRepository } from './repositories';

import { Company } from './objects/company';
import { CompanyArray } from './objects/company-array';
import { CompanyRepository } from './repositories';

import { ADApplication } from './application';

export const initializeObjectRepositories = async (app: ADApplication) => {
    // Setup Object Handling Repositories
    // This is called before bootscripts/observers

    const appUserToRoleRepository = await app.get<AppUserToRoleRepository>(
        'repositories.AppUserToRoleRepository'
    );
    AppUserToRole.init(
        appUserToRoleRepository,
        AppUserToRole,
        AppUserToRoleArray
    );
    AppUserToRoleArray.setRepository(appUserToRoleRepository);
    AppUserToRoleArray.metadata = AppUserToRole.metadata;

    const roleRepository = await app.get<RoleRepository>(
        'repositories.RoleRepository'
    );
    Role.init(roleRepository, Role, RoleArray);
    RoleArray.setRepository(roleRepository);
    RoleArray.metadata = Role.metadata;

    const appUserRepository = await app.get<AppUserRepository>(
        'repositories.AppUserRepository'
    );
    AppUser.init(appUserRepository, AppUser, AppUserArray);
    AppUserArray.setRepository(appUserRepository);
    AppUserArray.metadata = AppUser.metadata;

    const userRepository = await app.get<UserRepository>(
        'repositories.UserRepository'
    );
    User.init(userRepository, User, UserArray);
    UserArray.setRepository(userRepository);
    UserArray.metadata = User.metadata;

    const auth0UserRepository = await app.get<Auth0UserRepository>(
        'repositories.Auth0UserRepository'
    );
    Auth0User.init(auth0UserRepository, Auth0User, Auth0UserArray);
    Auth0UserArray.setRepository(auth0UserRepository);
    Auth0UserArray.metadata = Auth0User.metadata;

    const supplierRepository = await app.get<SupplierRepository>(
        'repositories.SupplierRepository'
    );
    Supplier.init(supplierRepository, Supplier, SupplierArray);
    SupplierArray.setRepository(supplierRepository);
    SupplierArray.metadata = Supplier.metadata;

    const imageRepository = await app.get<ImageRepository>(
        'repositories.ImageRepository'
    );
    Image.init(imageRepository, Image, ImageArray);
    ImageArray.setRepository(imageRepository);
    ImageArray.metadata = Image.metadata;

    const industryRepository = await app.get<IndustryRepository>(
        'repositories.IndustryRepository'
    );
    Industry.init(industryRepository, Industry, IndustryArray);
    IndustryArray.setRepository(industryRepository);
    IndustryArray.metadata = Industry.metadata;

    const contactRepository = await app.get<ContactRepository>(
        'repositories.ContactRepository'
    );
    Contact.init(contactRepository, Contact, ContactArray);
    ContactArray.setRepository(contactRepository);
    ContactArray.metadata = Contact.metadata;

    const staffRepository = await app.get<StaffRepository>(
        'repositories.StaffRepository'
    );
    Staff.init(staffRepository, Staff, StaffArray);
    StaffArray.setRepository(staffRepository);
    StaffArray.metadata = Staff.metadata;

    const projectRepository = await app.get<ProjectRepository>(
        'repositories.ProjectRepository'
    );
    Project.init(projectRepository, Project, ProjectArray);
    ProjectArray.setRepository(projectRepository);
    ProjectArray.metadata = Project.metadata;

    const companyRepository = await app.get<CompanyRepository>(
        'repositories.CompanyRepository'
    );
    Company.init(companyRepository, Company, CompanyArray);
    CompanyArray.setRepository(companyRepository);
    CompanyArray.metadata = Company.metadata;

    app.objects = {
        AppUserToRole,
        AppUserToRoleArray,
        Role,
        RoleArray,
        AppUser,
        AppUserArray,
        User,
        UserArray,
        Auth0User,
        Auth0UserArray,
        Supplier,
        SupplierArray,
        Image,
        ImageArray,
        Industry,
        IndustryArray,
        Contact,
        ContactArray,
        Staff,
        StaffArray,
        Project,
        ProjectArray,
        Company,
        CompanyArray,
    };
};
