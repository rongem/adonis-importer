FROM node:lts AS build
WORKDIR /usr/app

COPY ./frontend/package*.json ./
RUN npm update -g
RUN npm install
COPY ./frontend/ ./
RUN npm run build

FROM nginx
WORKDIR /usr/app
COPY --from=build /usr/app/dist/adonis-importer/browser /usr/share/nginx/html/
#COPY ./nginx/angular.conf /etc/nginx/conf.d/default.conf
