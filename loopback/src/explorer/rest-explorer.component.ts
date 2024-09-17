// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { BindingAddress, BindingKey } from '@loopback/core';

export type RestExplorerConfig = {
	/**
	 * URL path where to expose the explorer UI. Default: '/explorer'
	 */
	path?: string;

	/**
	 * By default, the explorer will add an additional copy of the OpenAPI spec
	 * in v3/JSON format at a fixed url relative to the explorer itself. This
	 * simplifies making the explorer work in environments where there may be
	 * e.g. non-trivial URL rewriting done by a reverse proxy, at the expense
	 * of adding an additional endpoint to the application. You may shut off
	 * this behavior by setting this flag `false`, in which case the explorer
	 * will try to locate an OpenAPI endpoint from the RestServer that is
	 * already in the correct form.
	 *
	 * Note that, if you are behind such a reverse proxy, you still _must_
	 * explicitly set an `openApiSpecOptions.servers` entry with an absolute path
	 * (it does not need to include the protocol, host, and port) that reflects
	 * the externally visible path, as that information is not systematically
	 * forwarded to the application behind the proxy.
	 */
	useSelfHostedSpec?: false;

	// Relative URL of the theme CSS file
	swaggerThemeFile?: string;

	/* Absolute path to a .html.ejs template to optionally override
  templates/index.html.ejs
  */
	indexTemplatePath?: string;

	// Index page title
	indexTitle?: string;
};
/**
 * Binding keys used by this component.
 */
/**
 * Binding key for RestExplorerComponent
 */
export const REST_COMPONENT_BINDING = BindingKey.create<RestExplorerComponent>('components.RestExplorerComponent');
/**
 * Binding key for configuration of RestExplorerComponent.
 *
 * We recommend `ctx.configure(RestExplorerBindings.COMPONENT)` to be used
 * instead of `ctx.bind(RestExplorerBindings.CONFIG)`.
 */
export const REST_CONFIG_BINDING: BindingAddress<RestExplorerConfig> =
	BindingKey.buildKeyForConfig<RestExplorerConfig>(REST_COMPONENT_BINDING);

import { Component, config, ContextTags, CoreBindings, inject, injectable } from '@loopback/core';
import { createControllerFactoryForClass, RestApplication } from '@loopback/rest';
//import { ExplorerController } from './rest-explorer.controller';
import { ApexExplorerController } from './apex-explorer.controller';

const swaggerUI = require('swagger-ui-dist');

/**
 * A component providing a self-hosted API Explorer.
 */
@injectable({ tags: { [ContextTags.KEY]: REST_COMPONENT_BINDING.key } })
export class RestExplorerComponent implements Component {
	constructor(
		@inject(CoreBindings.APPLICATION_INSTANCE)
		private application: RestApplication,
		@config()
		restExplorerConfig: RestExplorerConfig = {}
	) {
		const explorerPath = restExplorerConfig.path ?? '/explorer';

		this.registerControllerRoute('get', explorerPath, 'indexRedirect');
		this.registerControllerRoute('get', explorerPath + '/', 'index');
		if (restExplorerConfig.useSelfHostedSpec !== false) {
			this.registerControllerRoute('get', explorerPath + '/openapi.json', 'spec');
		}

		application.static(explorerPath, swaggerUI.getAbsoluteFSPath());

		// Disable redirect to externally hosted API explorer
		application.restServer.config.apiExplorer = { disabled: true };
	}

	private registerControllerRoute(verb: string, path: string, methodName: string) {
		this.application.route(
			verb,
			path,
			{
				'x-visibility': 'undocumented',
				responses: {}
			},
			ApexExplorerController,
			createControllerFactoryForClass(ApexExplorerController),
			methodName
		);
	}
}
