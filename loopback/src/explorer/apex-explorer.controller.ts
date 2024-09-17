// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { inject } from '@loopback/core';
import { RequestContext, RestBindings, RestServer } from '@loopback/rest';

import { indexHtml } from './explorer.html';

export class ApexExplorerController {
	constructor(
		@inject(RestBindings.Http.CONTEXT)
		private requestContext: RequestContext,
		@inject(RestBindings.SERVER) private restServer: RestServer
	) {}

	index() {
		this.requestContext.response.status(200).contentType('text/html').send(indexHtml);
	}

	// convert any /explorer urls to /explorer/ so index.html url references are correct
	indexRedirect() {
		const { request, response } = this.requestContext;
		let url = request.originalUrl || request.url;
		// be safe against path-modifying reverse proxies by generating the redirect
		// as a _relative_ URL
		const lastModifier = Math.max(url.lastIndexOf('#'), url.lastIndexOf('?'));
		if (lastModifier >= 0) {
			url = './explorer/' + url.substring(lastModifier, url.length);
		} else url = './explorer/';
		response.redirect(301, url);
	}

	spec() {
		return this.restServer.getApiSpec(this.requestContext);
	}
}
