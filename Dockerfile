FROM node:12.14.1-alpine AS builder

WORKDIR /opt/finance-portal-ui

RUN apk add --no-cache -t build-dependencies git make gcc g++ python libtool autoconf automake \
    && cd $(npm root -g)/npm \
    && npm config set unsafe-perm true \
    && npm install -g node-gyp

COPY package.json package-lock.json* /opt/finance-portal-ui/
RUN npm ci

COPY ./public/ /opt/finance-portal-ui/public
COPY ./src/ /opt/finance-portal-ui/src

RUN npm run build

FROM nginx:alpine

ARG BUILD_DATE
ARG VCS_URL
ARG VCS_REF
ARG VERSION

# See http://label-schema.org/rc1/ for label schema info
LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.name="finance-portal-ui"
LABEL org.label-schema.build-date=$BUILD_DATE
LABEL org.label-schema.vcs-url=$VCS_URL
LABEL org.label-schema.vcs-ref=$VCS_REF
LABEL org.label-schema.url="https://mojaloop.io/"
LABEL org.label-schema.version=$VERSION
# The base image sets a maintainer label that we override here (it cannot be removed)
LABEL maintainer=$VCS_URL

COPY --from=builder /opt/finance-portal-ui/build /usr/share/nginx/html
CMD nginx -g 'daemon off;'
