import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpContext,
    HttpParams,
} from '@angular/common/http';
export type HttpOptions = {
    body?: any;
    headers?: HttpHeaders | { [header: string]: string | string[] };
    context?: HttpContext;
    observe?: any;
    params?:
        | HttpParams
        | {
              [param: string]:
                  | string
                  | number
                  | boolean
                  | ReadonlyArray<string | number | boolean>;
          };
    reportProgress?: boolean;
    responseType?: any;
    withCredentials?: boolean;
};

@Injectable()
export class ApexAppService {
    constructor(private httpClient: HttpClient) {}

    removeUndefinedProperties(params: any): any {
        for (let param in params || {}) {
            if (params[param] === undefined) delete params[param];
        }
        return params;
    }

    async auth0ClientConfiguration(_httpOptions?: HttpOptions): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient
                .get(
                    `/api/auth0ClientConfiguration`,
                    Object.assign(
                        { params: this.removeUndefinedProperties({}) },
                        _httpOptions
                    ) as HttpOptions
                )
                .subscribe(
                    (res: any) => {
                        resolve(res);
                    },
                    (err) => {
                        reject(err);
                    }
                );
        });
    }
}
