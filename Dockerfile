FROM node:lts AS build
WORKDIR /usr/app

COPY ./ng-frontend/package*.json ./
#RUN npm update -g # only if image was too old
RUN npm install
COPY ./ng-frontend/ ./
RUN npm run build

FROM nginx
WORKDIR /usr/app
COPY --from=build /usr/app/dist/browser /usr/share/nginx/html/
COPY ./nginx-angular.conf /etc/nginx/conf.d/default.conf
