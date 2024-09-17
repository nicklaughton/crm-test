// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import {
    Entity,
    model,
    Model,
    property,
    belongsTo,
    hasMany,
    hasOne,
} from '@loopback/repository';
import { Constructor, MixinTarget } from '@loopback/core';
import { BaseEntity } from '../models/base-entity';
import { BaseMixinTarget } from './base-mixin-target';

export function ExportImportModelMixin<T extends MixinTarget<BaseEntity>>(
    superClass: T
) {
    class MixedModel extends superClass {
        /* Commenting out relationships due to the timing of the relationship decorators
mixin relationships will be added directly to the models via generate



*/
    }
    return MixedModel;
}
