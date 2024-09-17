// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { FormGroup } from '@angular/forms';
import { ApexDataOptions } from './apex-data-options';
import { Auth0UserArray } from './auth0-user-array';
import { Auth0UserFormGroup } from './auth0-user-form-group';

export class Auth0UserFormArray extends Auth0UserArray {
    controls: Array<FormGroup>;

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
            //if (arg1 && !(arg1 instanceof Array)) {
            arg1['isForms'] = true;
            arg1['classReference'] = Auth0UserFormGroup;
        } else if (!arg2)
            arg2 = { isForms: true, classReference: Auth0UserFormGroup };
        else {
            arg2['isForms'] = true;
            arg2['classReference'] = Auth0UserFormGroup;
        }

        super(arg1, arg2, arg3);
    }
}
