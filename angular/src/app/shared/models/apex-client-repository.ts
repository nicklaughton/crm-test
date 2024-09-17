// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { HttpClient } from '@angular/common/http';

const debug = require('debug')('ApexClientRepository');
debug.log = console.log.bind(console);

const dateRegex = new RegExp(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/);

export class ApexClientRepository {
	constructor(httpClient: HttpClient, apiUrl: string) {
		this.apiUrl = apiUrl;
		this.httpClient = httpClient;
	}

	httpClient: HttpClient;
	apiUrl: string;

	async save(data: Object, context?: any): Promise<Object> {
		if (data['id']) {
			await this.update(data, context);
			return this.findById(data['id'], {});
		} else return this.create(data, context);
	}

	async create(data: Object, context?: any): Promise<Object> {
		let url = this.apiUrl;

		/*if (filter) {
			url = url + '?filter=' + encodeURIComponent(JSON.stringify(filter));
		}*/
		if (data) {
			for (let nam in data) {
				if (data[nam] === null) delete data[nam];
			}
		}

		return new Promise((resolve, reject) => {
			this.httpClient.post(url, data).subscribe(
				(res) => {
					this.parseResult(res);
					resolve(res);
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	async createWithChildren(data: Object, context?: any): Promise<Object> {
		return this.create(data, context);
	}

	async createAll(data: Object[], context?: any): Promise<Object[]> {
		let url = this.apiUrl;

		return new Promise((resolve, reject) => {
			this.httpClient.post(url, data).subscribe(
				(res: Object[]) => {
					this.parseResult(res);
					resolve(res);
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	async find(filter?: Object, context?: any): Promise<Object[]> {
		let url = this.apiUrl;

		if (filter) {
			url = url + '?filter=' + encodeURIComponent(JSON.stringify(filter));
		}

		return new Promise((resolve, reject) => {
			this.httpClient.get(url).subscribe(
				(res: Object[]) => {
					this.parseResult(res);
					resolve(res);
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	async findById(id: number, filter?: Object, context?: any): Promise<Object> {
		let url = this.apiUrl + '/' + encodeURIComponent(id);

		if (filter) {
			url = url + '?filter=' + encodeURIComponent(JSON.stringify(filter));
		}

		return new Promise((resolve, reject) => {
			this.httpClient.get(url).subscribe(
				(res: Object[]) => {
					this.parseResult(res);
					resolve(res);
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	async findOne(filter?: any, context?: any): Promise<Object> {
		let url = this.apiUrl;

		if (!filter) {
			filter = { limit: 1 };
		} else {
			filter.limit = 1;
		}
		url = url + '?filter=' + encodeURIComponent(JSON.stringify(filter));

		return new Promise((resolve, reject) => {
			this.httpClient.get(url).subscribe(
				(res: Object[]) => {
					let result = res && res.length > 0 ? res[0] : null;
					this.parseResult(result);
					resolve(result);
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	async updateById(id: number, data: Object, context?: any): Promise<void> {
		let url = this.apiUrl + '/' + encodeURIComponent(id);

		data['id'] = id;

		return new Promise((resolve, reject) => {
			this.httpClient.patch(url, data).subscribe(
				(res) => {
					resolve();
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	async replaceById(id: number, data: Object, context?: any): Promise<void> {
		return this.replaceById(id, data, context);
	}

	async update(data: Object, context?: any): Promise<void> {
		return this.updateById(data['id'], data, context);
	}

	async updateAll(data: Object, where?: Object, context?: any): Promise<number> {
		let url = this.apiUrl;

		if (where) {
			url = url + '?where=' + encodeURIComponent(JSON.stringify(where));
		}

		return new Promise((resolve, reject) => {
			this.httpClient.patch(url, data).subscribe(
				(res: number) => {
					resolve(res);
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	async exists(id: number, context?: any): Promise<boolean> {
		let url = this.apiUrl + '/' + encodeURIComponent(id);

		return new Promise((resolve, reject) => {
			this.httpClient.get(url).subscribe(
				(res: Object) => {
					resolve(res ? true : false);
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	async count(where?: any, context?: any): Promise<number> {
		let url = this.apiUrl;
		if (!where) where = {};

		url = url + '/count?where=' + encodeURIComponent(JSON.stringify(where));

		return new Promise((resolve, reject) => {
			this.httpClient.get(url).subscribe(
				(res: any) => {
					debug('res', res);
					resolve(res ? res.count : 0);
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	async delete(data: Object, context?: any): Promise<void> {
		let url = this.apiUrl + '/' + encodeURIComponent(data['id']);

		return new Promise((resolve, reject) => {
			if (!data['id']) reject('No id specified');
			this.httpClient.delete(url, data).subscribe(
				(res) => {
					resolve();
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	async deleteById(id: number, context?: any): Promise<void> {
		let url = this.apiUrl + '/' + encodeURIComponent(id);

		return new Promise((resolve, reject) => {
			this.httpClient.delete(url).subscribe(
				(res) => {
					resolve();
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	async deleteAll(where?: Object, context?: any): Promise<number> {
		let url = this.apiUrl;

		if (where) {
			url = url + '?where=' + encodeURIComponent(JSON.stringify(where));
		}

		return new Promise((resolve, reject) => {
			this.httpClient.delete(url).subscribe(
				(res: number) => {
					resolve(res);
				},
				(err) => {
					reject(err);
				}
			);
		});
	}
	parseResult(obj) {
		if (!obj || typeof obj != 'object') return;

		if (obj instanceof Array) {
			obj.forEach((item) => this.parseResult(item));
		} else {
			for (let attr in obj) {
				let val = obj[attr];
				if (typeof val == 'string' && dateRegex.test(val)) obj[attr] = new Date(val);
				else this.parseResult(obj[attr]);
			}
		}
	}
}
