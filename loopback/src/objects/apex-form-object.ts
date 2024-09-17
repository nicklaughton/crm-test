// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataOptions } from './apex-data-options';
import { Transaction, Options, IsolationLevel } from '@loopback/repository';

export abstract class ApexFormObject {
	constructor(
		object?: any,
		_options?: ApexDataOptions | undefined,
		classReference?: any,
		repo?: any,
		context?: any
	) {}

	static _staticRepository: any;

	static get definition(): any {
		return this._staticRepository.entityClass.definition;
	}

	static async beginTransaction(context?: any, transactionOptions?: IsolationLevel | Options): Promise<Transaction> {
		const tx = await this._staticRepository.beginTransaction(transactionOptions || IsolationLevel.READ_COMMITTED);
		if (context) context.transaction = tx;
		return tx;
	}

	static async completeTransaction(options?: any): Promise<void> {
		if (!options.transaction) return;

		try {
			await options.transaction.commit();
		} catch (err) {
			try {
				await options.transaction.rollback();
			} catch (err) {}
			throw err;
		}
	}
}
