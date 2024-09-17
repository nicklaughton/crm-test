import { ApplicationConfig, ADApplication } from './application';
import { CoreBindings } from '@loopback/core';
import { RestBindings } from '@loopback/rest';
import { APPLICATION_CONFIG } from './application.config';
import { registerAuthenticationStrategy } from '@loopback/authentication';
import { DefaultAuthenticationStrategy } from './authorizers/default-auth.strategy';

import { initializeObjectRepositories } from './initialize-object-repositories';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
    const app = new ADApplication(options);

    // sets observer ordering such that @lifeCycleObserver('initialized') are called after @lifeCycleObserver()
    app.bind(CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS).to({
        orderedGroups: ['initialized'],
    });

    await app.boot();

    await initializeObjectRepositories(app);

    await app.start();

    /* Add default authentication if no auth strategy is provided */
    let extensions = app.findByTag('extensionFor');
    let hasAuthStrategy = false;
    if (extensions) {
        hasAuthStrategy = !!extensions.find(
            (ext) =>
                ext &&
                ext.key &&
                ext.key.startsWith('authentication.strategies')
        );
    }

    if (!hasAuthStrategy) {
        registerAuthenticationStrategy(app, DefaultAuthenticationStrategy);
    }

    if (process.env.skipAuth === 'true')
        console.log(
            'WARNING: Authentication is disabled via the skipAuth environment variable.'
        );

    const url = app.restServer.url;
    console.log(`LoopBack server listening at ${url}`);
    console.log(`View the explorer at ${url}/api/explorer`);

    return app;
}

if (require.main === module) {
    // Run the application
    main(APPLICATION_CONFIG).catch((err) => {
        console.error('Cannot start the application.', err);
        process.exit(1);
    });
}
