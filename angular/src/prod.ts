// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

enableProdMode();

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.error(err));
