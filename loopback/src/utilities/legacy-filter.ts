// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { AnyObject } from '@loopback/repository/src/common-types';
import { getFilterSchemaFor } from '@loopback/rest';
import { Fields, Inclusion } from '@loopback/filter';
import { Where } from '@loopback/repository';
import { FilterSchemaOptions, Model } from '@loopback/repository-json-schema';

export function getLegacyFilterSchemaFor(M: typeof Model, options?: FilterSchemaOptions) {
	let schema: object = getFilterSchemaFor(M, options);
	schema['properties']['order'] = {
		oneOf: [
			{
				type: 'array',
				items: {
					type: 'string'
				}
			},
			{ type: 'string' }
		]
	};
	/*schema['properties']['fields'] = {
		oneOf: [
			{
				type: 'array',
				items: {
					type: 'string'
				}
			},
			schema['properties']['fields']
		]
	};*/
	schema['properties']['include'] = {
		anyOf: [
			{
				type: 'array',
				items: {
					type: 'string'
				}
			},
			{ type: 'string' },
			{ type: 'object' },
			{ type: 'array', items: { type: 'object' } }
			//schema['properties']['include']
		]
	};
	return schema;
}

export interface LegacyFilter<MT extends object = AnyObject> {
	/**
	 * The matching criteria
	 */
	where?: Where<MT>;
	/**
	 * To include/exclude fields
	 */
	fields?: Fields<MT> | string[];
	/**
	 * Sorting order for matched entities. Each item should be formatted as
	 * `fieldName ASC` or `fieldName DESC`.
	 * For example: `['f1 ASC', 'f2 DESC', 'f3 ASC']`.
	 *
	 * We might want to use `Order` in the future. Keep it as `string[]` for now
	 * for compatibility with LoopBack 3.x.
	 */
	order?: string | string[];
	/**
	 * Maximum number of entities
	 */
	limit?: number;
	/**
	 * Skip N number of entities
	 */
	skip?: number;
	/**
	 * Offset N number of entities. An alias for `skip`
	 */
	offset?: number;
	/**
	 * To include related objects
	 */
	include?: Inclusion[] | string | Inclusion | object | object[] | string[];
}

export type LegacyFilterExcludingWhere<MT extends object = AnyObject> = Omit<LegacyFilter<MT>, 'where'>;
