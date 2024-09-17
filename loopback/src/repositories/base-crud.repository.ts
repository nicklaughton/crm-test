// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Application } from '@loopback/core';
import {
	BelongsToDefinition,
	Getter,
	BelongsToAccessor,
	createBelongsToAccessor,
	EntityCrudRepository,
	Entity,
	createHasManyRepositoryFactory,
	HasManyRepositoryFactory,
	createHasOneRepositoryFactory,
	HasOneRepositoryFactory,
	HasManyDefinition,
	HasOneDefinition,
	Model,
	PropertyType,
	isTypeResolver,
	juggler,
	DefaultCrudRepository,
	AnyObject,
	Inclusion,
	Options,
	IsolationLevel,
	Transaction
} from '@loopback/repository';

import { BaseCrudConfig } from './base-crud.config';

function isModelClass(propertyType: PropertyType | undefined): propertyType is typeof Model {
	return (
		!isTypeResolver(propertyType) &&
		typeof propertyType === 'function' &&
		typeof (propertyType as typeof Model).definition === 'object' &&
		propertyType.toString().startsWith('class ')
	);
}
export class BaseCrudRepository<T extends Entity, ID, Relations extends object = {}> extends DefaultCrudRepository<
	T,
	ID,
	Relations
> {
	/**
	 * Constructor of DefaultCrudRepository
	 * @param entityClass - LoopBack 4 entity class
	 * @param dataSource - Legacy juggler data source
	 */
	constructor(
		// entityClass should have type "typeof T", but that's not supported by TSC
		app: Application,
		public entityClass: typeof Entity & { prototype: T },
		public dataSource: juggler.DataSource
	) {
		super(entityClass, dataSource);
		this.app = app;
	}

	app: Application;

	protected mixinOperationHooks(modelClass: typeof juggler.PersistedModel): any {
		//console.log('called the one on base crud',modelClass)
		return modelClass;
	}

	public definePersistedModelWrapper(entityClass: typeof Model): typeof juggler.PersistedModel {
		return super.definePersistedModel(entityClass);
	}
	/*
	  definePersistedModel(
		entityClass: typeof Model,
	  ): any {
		return super.definePersistedModel(entityClass);
	  }*/

	// The accessors are normally protected, so they are extended here to be public
	// such that they can be used in mixins

	public createBelongsToAccessorFor<Target extends Entity, TargetId>(
		relationName: string,
		targetRepoGetter: Getter<EntityCrudRepository<Target, TargetId | undefined>>
	): BelongsToAccessor<Target, ID | undefined> {
		const meta = this.entityClass.definition.relations[relationName];
		return createBelongsToAccessor<Target, TargetId, T, ID | undefined>(
			meta as BelongsToDefinition,
			targetRepoGetter,
			this
		);
	}

	public createHasManyRepositoryFactoryFor<Target extends Entity, TargetID, ForeignKeyType>(
		relationName: string,
		targetRepoGetter: Getter<EntityCrudRepository<Target, TargetID>>
	): HasManyRepositoryFactory<Target, ForeignKeyType | undefined> {
		const meta = this.entityClass.definition.relations[relationName];
		return createHasManyRepositoryFactory<Target, TargetID, ForeignKeyType | undefined>(
			meta as HasManyDefinition,
			targetRepoGetter
		);
	}

	public createHasOneRepositoryFactoryFor<Target extends Entity, TargetID, ForeignKeyType>(
		relationName: string,
		targetRepoGetter: Getter<EntityCrudRepository<Target, TargetID>>
	): HasOneRepositoryFactory<Target, ForeignKeyType | undefined> {
		const meta = this.entityClass.definition.relations[relationName];
		return createHasOneRepositoryFactory<Target, TargetID, ForeignKeyType | undefined>(
			meta as HasOneDefinition,
			targetRepoGetter
		);
	}

	protected async includeRelatedModels(
		entities: T[],
		include?: any, //Inclusion[],
		options?: Options
	): Promise<(T & Relations)[]> {
		const result = entities as (T & Relations)[];
		if (!include) return result;

		// allow for {"include": "relation"} from Loopback 3
		if (typeof include == 'string') {
			include = [{ relation: include }];
		} else if (typeof include == 'object' && !include.filter) include = [include];

		// update the filter to allow for include: ["relation","relation2"] from Loopback 3
		const invalidInclusions = include.filter((inclusionFilter) => {
			//console.log('inclusion filter', inclusionFilter);
			if (typeof inclusionFilter == 'object' && !inclusionFilter.relation) {
				for (let relationName in inclusionFilter) return !this.inclusionResolvers.has(relationName);
			} else
				return !this.inclusionResolvers.has(
					typeof inclusionFilter == 'string' ? inclusionFilter : inclusionFilter.relation
				);
		});
		if (invalidInclusions.length) {
			const msg =
				'Invalid "filter.include" entries: ' +
				invalidInclusions.map((inclusionFilter) => JSON.stringify(inclusionFilter)).join('; ');
			const err = new Error(msg);
			Object.assign(err, {
				code: 'INVALID_INCLUSION_FILTER'
			});
			throw err;
		}

		const resolveTasks = include.map(async (inclusionFilter) => {
			let relationName = typeof inclusionFilter == 'string' ? inclusionFilter : inclusionFilter.relation;

			// add support for "include": {"relation1": "relation2"} from Loopback 3
			if (!relationName && typeof inclusionFilter == 'object')
				for (let relName in inclusionFilter) relationName = relName;

			const resolver = this.inclusionResolvers.get(relationName)!;
			const targets = await resolver(entities, inclusionFilter, options);

			result.forEach((entity, ix) => {
				const src = entity as AnyObject;
				src[relationName] = targets[ix];
				if (BaseCrudConfig.initializeIncludeObjects && resolver.name === 'fetchIncludedModels' && !targets[ix])
					src[relationName] = {};
				if (BaseCrudConfig.initializeIncludeArrays && resolver.name === 'fetchHasManyModels' && !targets[ix])
					src[relationName] = [];
			});
		});

		await Promise.all(resolveTasks);

		return result;
	}

	async beginTransaction(options?: IsolationLevel | Options) {
		const dsOptions: juggler.IsolationLevel | Options = options ?? {};
		return (await this.dataSource.beginTransaction(dsOptions)) as Transaction;
	}
}
