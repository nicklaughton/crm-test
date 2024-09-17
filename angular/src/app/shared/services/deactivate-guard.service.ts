// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { ActivatedRouteSnapshot } from '@angular/router';

type DeactivationCallback = () => Promise<boolean>;

@Injectable({
	providedIn: 'root'
})
export class DeactivateGuardService implements CanDeactivate<any> {
	private deactivationCallbacks: Record<string, DeactivationCallback> = {};

	public registerDeactivationCallback(key: string, callback: DeactivationCallback) {
		this.deactivationCallbacks[key] = callback;
	}

	public removeDeactivationCallback(key: string) {
		this.deactivationCallbacks[key] = null;
		delete this.deactivationCallbacks[key];
	}

	public async canDeactivate(_component: Object, _route: ActivatedRouteSnapshot): Promise<boolean> {
		for (let key in this.deactivationCallbacks) {
			const result = await this.deactivationCallbacks[key]();
			if (result == false) return false;
		}

		return true;
	}
}
