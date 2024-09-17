// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { BaseEntity } from '../models/base-entity';
import { Constructor } from '@loopback/context';

export type BaseMixinTarget<T extends BaseEntity> = Constructor<{
	// Enumerate only public members to avoid the following compiler error:
	//   Property '(name)' of exported class expression
	//   may not be private or protected.ts(4094)
	[P in keyof T]: T[P];
}>;
