// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

let openApiSpec;

if (process.env.appUrl) {
	openApiSpec = {
		servers: [
			{
				url: process.env.appUrl
			}
		]
	};
} else {
	openApiSpec = { setServersFromRequest: true };
}

export const APPLICATION_CONFIG = {
	rest: {
		port: +(process.env.PORT ?? 3000),
		host: process.env.HOST,
		// The `gracePeriodForClose` provides a graceful close for http/https
		// servers with keep-alive clients. The default value is `Infinity`
		// (don't force-close). If you want to immediately destroy all sockets
		// upon stop, set its value to `0`.
		// See https://www.npmjs.com/package/stoppable
		gracePeriodForClose: 5000, // 5 seconds
		basePath: process.env.ingressPath || '',
		openApiSpec
	}
};
