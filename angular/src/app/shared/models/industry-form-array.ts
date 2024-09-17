import { FormGroup } from '@angular/forms';
import { ApexDataOptions } from './apex-data-options';
import { IndustryArray } from './industry-array';
import { IndustryFormGroup } from './industry-form-group';

export class IndustryFormArray extends IndustryArray {
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
            arg1['classReference'] = IndustryFormGroup;
        } else if (!arg2)
            arg2 = { isForms: true, classReference: IndustryFormGroup };
        else {
            arg2['isForms'] = true;
            arg2['classReference'] = IndustryFormGroup;
        }

        super(arg1, arg2, arg3);
    }
}
