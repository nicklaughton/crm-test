import { FormGroup } from '@angular/forms';
import { ApexDataOptions } from './apex-data-options';
import { ProjectArray } from './project-array';
import { ProjectFormGroup } from './project-form-group';

export class ProjectFormArray extends ProjectArray {
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
            arg1['classReference'] = ProjectFormGroup;
        } else if (!arg2)
            arg2 = { isForms: true, classReference: ProjectFormGroup };
        else {
            arg2['isForms'] = true;
            arg2['classReference'] = ProjectFormGroup;
        }

        super(arg1, arg2, arg3);
    }
}
