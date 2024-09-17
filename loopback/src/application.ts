// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { REST_COMPONENT_BINDING, RestExplorerComponent } from './explorer/rest-explorer.component';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication, createControllerFactoryForClass } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import path from 'path';
import { MySequence } from './sequence';
import { HealthComponent, HealthBindings } from '@loopback/health';
import { ApexExplorerController } from './explorer/apex-explorer.controller';
import configureApplicationRoutes from './configure-application-routes';

export { ApplicationConfig };

export class ADApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
	models: object = {};
	objects: any = {};
	dataSources: any = {};

	constructor(options: ApplicationConfig = {}) {
		super(options);

		// Set up the custom sequence
		this.sequence(MySequence);

		// Replace the base Href
		// Typically process.env.ingressPath should start and end in "/" (ex: /path/)
		const replaceInFile = require('replace-in-file');
		const replaceOptions = {
			files: [/*'../angular/src/index.html' ,*/ './client/index.html'],
			from: /<base href="[^"]*"/g,
			to: `<base href="${process.env.ingressPath || '/'}"`
		};

		try {
			const results = replaceInFile.sync(replaceOptions);
			console.log('Replacement results:', results);
		} catch (error) {
			console.error('Error occurred:', error);
		}

		// Set up the client pages
		if (process.env.ingressPath) {
			this.static(process.env.ingressPath, path.join(__dirname, '../client'), {
				redirect: false,
				maxAge: '1d',
				setHeaders: function (res, path) {
					if (path.endsWith('index.html')) {
						res.setHeader('Cache-Control', 'public, max-age=0');
					}
				}
			});
		}

		this.static('/', path.join(__dirname, '../client'), {
			redirect: false,
			maxAge: '1d',
			setHeaders: function (res, path) {
				if (path.endsWith('index.html')) {
					res.setHeader('Cache-Control', 'public, max-age=0');
				}
			}
		});

		configureApplicationRoutes(this);

		if (process.env.disableLoopbackExplorer !== 'true') {
			// Customize @loopback/rest-explorer configuration here
			this.configure(REST_COMPONENT_BINDING).to({
				path: '/explorer'
			});
			this.component(RestExplorerComponent);

			this.route(
				'get',
				'/explorer/',
				{
					'x-visibility': 'undocumented',
					responses: {}
				},
				ApexExplorerController,
				createControllerFactoryForClass(ApexExplorerController),
				'index'
			);

			const configureRoute = (path: string, method: string) => {
				this.route(
					'get',
					path,
					{
						'x-visibility': 'undocumented',
						responses: {}
					},
					ApexExplorerController,
					createControllerFactoryForClass(ApexExplorerController),
					method
				);
			};

			configureRoute('/explorer/', 'index');
			configureRoute('/explorer', 'indexRedirect');
		}

		this.configure(HealthBindings.COMPONENT).to({
			healthPath: '/healthz',
			livePath: '/livez',
			readyPath: '/readyz'
		});

		this.component(HealthComponent);

		this.projectRoot = __dirname;
		// Customize @loopback/boot Booter Conventions here
		this.bootOptions = {
			controllers: {
				// Customize ControllerBooter Conventions here
				dirs: ['controllers'],
				extensions: ['.controller.js'],
				nested: true
			}
		};
	}
}
