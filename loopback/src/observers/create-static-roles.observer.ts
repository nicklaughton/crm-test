import {
	lifeCycleObserver,
	LifeCycleObserver,
	inject,
	CoreBindings,
	Application
} from '@loopback/core';
import { RoleRepository } from '../repositories';
import {repository} from "@loopback/repository";
import { ADApplication } from '../application';

@lifeCycleObserver('initialized')
export class CreateStaticRolesObserver implements LifeCycleObserver {
	constructor(@repository(RoleRepository)
        protected roleRepository: RoleRepository,
		@inject(CoreBindings.APPLICATION_INSTANCE) private app: ADApplication) {}

	/**
	 * This method will be invoked when the application starts
	 */
	async start(): Promise<void> {
		// Add your logic for start
		const staticRoles = [
			"Administrator"
		];

		if (staticRoles.length > 0) {
			const results = await this.roleRepository.find({where:{name: {inq:staticRoles}}});

			const existing = results.map((a) => a.name);

			const promises:Promise<object>[] = [];

			staticRoles.forEach((role) => {
				if (!existing.includes(role))
					promises.push(this.roleRepository.create({name: role, created:new Date()}));
			});

			await Promise.all(promises);
		}
		this.app.emit('Roles Up To Date');
	}
}
