'use strict';

let staticRoles = [
];

module.exports = function (app) {

	app.on('Schema Up To Date', function () {
		console.log('createStaticRoles.js schema up to date');

		for (let staticRole of staticRoles) {

			let desiredRole = {name: staticRole};

			app.models.Role.findOne({where: desiredRole}, function (err, existingRole) {

				if (err) {
					return console.error('createStaticRoles.js problem finding role', err);
				}

				if (!existingRole) {

					console.log('createStaticRoles.js creating Role ' + staticRole);

					app.models.Role.create(desiredRole, function (err, role) {

						if (err) return console.error('createStaticRoles.js problem creating role', err);

						console.log('createStaticRoles.js role created', role);

					});
				}
			});
		}

	});

};