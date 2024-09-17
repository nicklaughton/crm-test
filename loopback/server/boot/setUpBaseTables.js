'use strict';

module.exports = function (app) {

    let models = app.models;

    let baseModelNames = [
        'User',
        'AccessToken',
        'ACL',
        'RoleMapping',
        'Role'
    ];

    for (let modelName of baseModelNames) {
        models[modelName].dataSource.once('connected', function () {
            if (models[modelName].dataSource.autoupdate) {
                models[modelName].dataSource.autoupdate(modelName, function (err) {
                    if (err) console.error(err);
                });
            }
        });
    }
};