import {
	/* inject, Application, CoreBindings, */
	lifeCycleObserver,
	LifeCycleObserver,
	inject,
	CoreBindings
} from '@loopback/core';
import { RoleRepository, AppUserRepository, AppUserToRoleRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { AppUserModel } from '../models';

@lifeCycleObserver('initialized')
export class CreateAdminEmailsObserver implements LifeCycleObserver {
	constructor(
		@repository(RoleRepository)
		protected roleRepository: RoleRepository,
		@repository(AppUserToRoleRepository)
		protected appUserToRoleRepository: AppUserToRoleRepository,
		@repository(AppUserRepository)
		protected appUserRepository: AppUserRepository
	) {}

	/**
	 * This method will be invoked when the application starts
	 */
	async start(): Promise<void> {
		// Add your logic for start
		const emailsCSV = process.env.adminEmails;

		if (!emailsCSV)
			return console.log(
				'The emailsCSV environment variable is not set.  It should contain a comma-separated list of email addresses that will be admins'
			);

		let adminRole = await this.roleRepository.findOne({ where: { name: 'Administrator' } });
		if (!adminRole) adminRole = await this.roleRepository.create({ name: 'Administrator', created: new Date() });

		const adminEmails = emailsCSV
			.split(',')
			.map((email) => email.trim())
			.filter((email) => !!email);

		let appUsers: AppUserModel[] = await this.appUserRepository.find({ where: { email: { inq: adminEmails } } });

		const existing = appUsers.map((a) => a.email);

		const promises: Promise<AppUserModel>[] = [];

		adminEmails.forEach((email) => {
			if (!existing.includes(email)) promises.push(this.appUserRepository.create({ email: email }));
		});

		appUsers = appUsers.concat(await Promise.all(promises));

		for (const appUser of appUsers) {
			const desiredAppUserToRole = {
				appUserId: appUser.id,
				roleId: adminRole.id
			};
			const appUserToRole = await this.appUserToRoleRepository.findOne({ where: desiredAppUserToRole });
			if (!appUserToRole) await this.appUserToRoleRepository.create(desiredAppUserToRole);
		}
	}
}
