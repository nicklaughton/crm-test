import {Injectable} from '@angular/core';

@Injectable()
export class ApexDesignerProcessesService {

	private _processes: any[] = [];
	private _processesByName: any = {};
	private _processesById: any = {};
	private _processesByIdentifier: any = {};

	constructor() {
		

		for (let process of this._processes) {
		    this._processesByName[process.name] = process;
		    this._processesById[process.id] = process;
			this._processesByIdentifier[process.identifier] = process;
		}
	}

	fromName(name: string): any {
		return this._processesByName[name];
	}

	fromId(id: number): any {
		return this._processesById[id];
	}

	fromIdentifier(id: string): any {
		return this._processesByIdentifier[id];
	}

	list(): any[] {
		return this._processes;
	}

}
