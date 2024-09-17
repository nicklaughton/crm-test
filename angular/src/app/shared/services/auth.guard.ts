// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

import { ApexAuthAccessDialogComponent } from '../../user-interfaces/apex-auth-access-dialog/apex-auth-access-dialog.component';

import * as Debug from 'debug';
const classDebug = Debug('Auth0Angular10Library:AuthGuard');

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private authService: AuthService,
		private router: Router,
		private dialog: MatDialog,
		private httpClient: HttpClient
	) {}

	logoutRedirect(url: string) {
		const debug = classDebug.extend('logoutRedirect');
		debug('url', url);
		localStorage.setItem('auth0NextUrl', url);
		this.authService.redirectToLoginPage();
	}

	checkAuthentication(state: RouterStateSnapshot): Promise<boolean> {
		return new Promise(async (resolve) => {
			if (await this.authService.isAuthenticated()) {
				resolve(true);
			} else {
				this.logoutRedirect(state.url);
				resolve(false);
			}
		});
	}

	async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		const debug = classDebug.extend('canActivate');
		debug('route', route);

		if (await this.checkAuthentication(state)) {
			if (route.data && route.data.teamNamesWithAccess)
				return this.hasValidTeamMembership(route.data.teamNamesWithAccess);
			else if (route.data && route.data.teamNamesWithoutAccess)
				return this.hasValidTeamMembership(route.data.teamNamesWithoutAccess, true);
			else return true;
		}
	}

	public async hasValidTeamMembership(
		teamNameOrNames: string | string[],
		isNotTeamMemberCheck?: boolean
	): Promise<boolean> {
		const debug = classDebug.extend('hasValidTeamMembership');

		const teamsToCheck = typeof teamNameOrNames == 'string' ? [teamNameOrNames] : teamNameOrNames;
		debug('teamsToCheck', teamsToCheck);

		let appUser = await this.authService.currentAppUser();
		debug('appUser', appUser);

		let isOnTeam = !!appUser.appUserToRoles.find((appUserToRole: any) =>
			teamsToCheck.includes(appUserToRole.role?.name)
		);
		debug('isOnTeam', isOnTeam);

		const isValid = isNotTeamMemberCheck ? !isOnTeam : isOnTeam;
		debug('isValid', isValid);

		if (!isValid) {
			const dialogRef = this.dialog.open(ApexAuthAccessDialogComponent, {
				autoFocus: false,
				maxWidth: '450px'
			});
			var instance = dialogRef.componentInstance;
			instance['teamNames'] = teamsToCheck;
			instance['isNotTeamMemberCheck'] = isNotTeamMemberCheck;
		}

		return isValid;
	}
}
