'use strict';

let overrides = {};
let services = {};
if (process.env.VCAP_SERVICES) {
	services = JSON.parse(process.env.VCAP_SERVICES);
}

function processService(labelName, serviceName, datasourceName, database) {
	if (!services) {
		return;
	}
	let credentials;
	if (labelName && services[labelName]) {
		for (let serviceDef of services[labelName]) {
			if (serviceDef.name == serviceName) {
				credentials = serviceDef.credentials;
				break;
			}
		}
	}
	else {
		for (let label in services) {
			let serviceGroup = services[label];
			for (let serviceDef of serviceGroup) {
				if (serviceDef.name == serviceName) {
					credentials = serviceDef.credentials;
					break;
				}
			}
		}
	}
	if (credentials) {
		if (database) {
			process.env.LB_LAZYCONNECT_DATASOURCES = true;
			credentials.database = database;
			if (credentials && credentials.uri && credentials.uri.startsWith('postgres://')) {
				credentials.uri = credentials.uri.replace(/([^/\?]+)(?=\?|$)/, database);
			}
		}
		credentials.name = datasourceName;
		credentials.url = credentials.uri;
		overrides[datasourceName] = credentials;
	}
}

module.exports = overrides;