import { FormGroup } from '@angular/forms';
import { ApexDataOptions } from './apex-data-options';
import { CompanyArray } from './company-array';
import { CompanyFormGroup } from './company-form-group';

export class CompanyFormArray extends CompanyArray {
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
            arg1['classReference'] = CompanyFormGroup;
        } else if (!arg2)
            arg2 = { isForms: true, classReference: CompanyFormGroup };
        else {
            arg2['isForms'] = true;
            arg2['classReference'] = CompanyFormGroup;
        }

        super(arg1, arg2, arg3);
    }
}
