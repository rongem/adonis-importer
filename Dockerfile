FROM node:lts AS build
WORKDIR /usr/app

COPY ./frontend/package*.json ./
COPY ./frontend/.npmrc ./
RUN npm update -g
RUN npm install
COPY ./frontend/ ./
RUN npm run build

FROM nginx
WORKDIR /usr/app
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*
COPY --from=build /usr/app/dist/adonis-importer/browser /usr/share/nginx/html/
#COPY ./nginx/angular.conf /etc/nginx/conf.d/default.conf
