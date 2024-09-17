import { ADApplication } from '../../application';
import { APPLICATION_CONFIG } from '../../application.config';
import { initializeObjectRepositories } from '../../initialize-object-repositories';

let app;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

export const initializeTestApplication = async () => {
	app = new ADApplication(APPLICATION_CONFIG);

	app.bootOptions = {
		datasources: {
			dirs: ['__tests__'],
			extensions: ['.datasource.js'],
			nested: true
		},
		observers: {
			// avoid running observers as they may slow down test app initialization
			dirs: ['observers/none'],
			extensions: ['.observer.js'],
			nested: true
		}
	};

	await app.boot();

	await initializeObjectRepositories(app);

	return app;
};

export const getTestApplication = async (isFresh?: boolean) => {
	if (app && !isFresh) return app;
	else return await initializeTestApplication();
};
