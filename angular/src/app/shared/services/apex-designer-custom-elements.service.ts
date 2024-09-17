import { Injectable, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';

@Injectable()
export class ApexDesignerCustomElementsService {
    constructor(private injector: Injector) {}

    private _addCustomElement(selector: string, classRef: any) {
        let customElement = customElements.get(selector);
        if (!customElement) {
            const customElement = createCustomElement(classRef, {
                injector: this.injector,
            });
            customElements.define(selector, customElement);
        }
    }
}
