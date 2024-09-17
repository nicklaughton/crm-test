################################################################
# Angular Build
################################################################

FROM node:18-slim AS ngbuilder
ARG MAX_OLD_SPACE_SIZE=4096
ARG NPM_TOKEN
ENV NODE_OPTIONS=--max-old-space-size=${MAX_OLD_SPACE_SIZE}

WORKDIR /usr/src/app/angular
COPY ./angular/package*.json ./
RUN npm install --legacy-peer-deps
COPY ./angular .
RUN npm run buildProd

################################################################
# Loopback Build
################################################################

FROM node:18-slim AS lbbuilder
ARG MAX_OLD_SPACE_SIZE=4096
ARG NPM_TOKEN
ENV NODE_OPTIONS=--max-old-space-size=${MAX_OLD_SPACE_SIZE}

WORKDIR /usr/src/app/loopback
COPY ./loopback/package*.json ./
RUN npm install --legacy-peer-deps
COPY ./loopback .
RUN npm run build ## && rm -rf src

################################################################
# App Image Build
################################################################
FROM node:18-slim

## Install basic tools
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    apt-transport-https \
    build-essential \	
    ca-certificates \
    curl \
    wget \
    dnsutils \
    jq \
    netcat-openbsd \
    gnupg \
    lsb-release \
	lsof \
    procps \
    less \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* 

## Create app directory
WORKDIR /usr/src/app/loopback

## Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./loopback/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps
# If you are building your code for production
# RUN npm ci --omit=dev

# Copy the loopback build to this image
COPY --from=lbbuilder /usr/src/app/loopback/ .
# Copy the angular build to this image
COPY --from=ngbuilder /usr/src/app/loopback/client ./client

EXPOSE 3000
CMD [ "npm", "start" ]