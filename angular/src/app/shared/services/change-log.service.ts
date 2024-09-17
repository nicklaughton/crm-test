import {Injectable} from "@angular/core";

@Injectable()
export class ChangeLogService {

	constructor() {
	}

	logs: any[] = [];

	listVersions(): any[] {
		const versions = [];
		const versionsByName = {};

		for (let log of this.logs || []) {
			if (!versionsByName[log.projectVersion]) {
				versionsByName[log.projectVersion] = {
					name: log.projectVersion,
					changes: []
				};
				versions.unshift(versionsByName[log.projectVersion]);
			}
			versionsByName[log.projectVersion].date = log.lastModified || log.created;
			versionsByName[log.projectVersion].changes.push(log.title);
		}
		return versions;
	}


}