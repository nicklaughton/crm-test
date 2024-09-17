import { ApexDataArray } from './apex-data-array';
import { ApexDataOptions } from './apex-data-options';
import { Contact } from './contact';

export class ContactArray extends ApexDataArray {
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

        super(arg1, arg2, Contact, Contact._staticRepository, arg3);
    }
    public static metadata: any;
}
