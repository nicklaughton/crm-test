// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { ApexDataArray } from './apex-data-array';
import { ApexDataOptions } from './apex-data-options';
import { AppUser } from './app-user';

export class AppUserArray extends ApexDataArray {
    constructor();
    constructor(options: ApexDataOptions);
    constructor(objects: Array<any>);
    constructor(objects: Array<any>, options: ApexDataOptions | undefined);
    constructor(
        objects: Array<any>,
        options: ApexDataOptions | undefined,
        context: any
    );
    constructor(arg1?: any, arg2?: any, arg3?: any) {
        if (
            arg1 &&
            arg1.http &&
            (arg1.save !== undefined || arg1.read !== undefined)
        ) {
            let temp = arg2;
            arg2 = arg1;
            arg2.readAutomatically =
                arg2.readAutomatically || arg2.read == 'Automatically';
            arg2.saveAutomatically =
                arg2.saveAutomatically || arg2.save == 'Automatically';
            arg1 = temp;
        }

        super(arg1, arg2, AppUser, AppUser._staticRepository, arg3);
    }
    public static metadata: any;
}
