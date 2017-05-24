FROM node:latest

RUN update-ca-certificates
RUN npm install forever -g
ADD application /application
WORKDIR /application
RUN npm install
EXPOSE 9010
CMD forever app.js
