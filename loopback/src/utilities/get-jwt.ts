// Copyright 2023 Apex Process Consultants. This code is covered by the terms in the Apex Designer Library License file included with this project.

import got from 'got';

let debug = require('debug')('Auth0Loopback4:getJwt');
debug.log = console.log.bind(console);
debug('loaded');

export async function getJwt(options?: any): Promise<string> {
    // "process.env.auth0Jwt is a hack for a "global" variable

    if (
        !process.env.auth0Jwt ||
        new Date().getTime > JSON.parse(process.env.auth0Jwt).expires_at
    ) {
        debug(
            'process.env.auth0MachineToMachineClientSecret',
            process.env.auth0MachineToMachineClientSecret
        );
        if (!process.env.auth0MachineToMachineClientSecret) {
            throw 'auth0MachineToMachineClientSecret environment variable is required';
        }

        let authConfig: any;
        if (process.env.auth0Config) {
            authConfig = JSON.parse(process.env.auth0Config);
        } else {
            authConfig = require('../../auth0Config.json');
        }

        let url = `https://${authConfig.domain}/oauth/token`;
        debug('url', url);
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        debug('headers', headers);

        let formData = {
            grant_type: 'client_credentials',
            client_id: authConfig.machineToMachineClientId,
            client_secret: process.env.auth0MachineToMachineClientSecret,
            audience: authConfig.audience,
        };
        debug('formData', formData);

        debug('url', url);
        let response = await got.post(url, {
            form: formData,
        });

        process.env.auth0Jwt = response.body;
        debug('process.env.auth0Jwt', process.env.auth0Jwt);
    }
    return process.env.auth0Jwt
        ? JSON.parse(process.env.auth0Jwt).access_token
        : undefined;
}
