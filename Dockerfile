FROM node:26-alpine AS build
WORKDIR /usr/app

# the npm version bundled with the image is often outdated
RUN npm install -g npm@latest
COPY ./frontend/package*.json ./
RUN npm ci
COPY ./frontend/ ./
RUN npm run build

FROM nginx:stable-alpine
COPY ./nginx/angular.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/app/dist/adonis-importer/browser /usr/share/nginx/html/
