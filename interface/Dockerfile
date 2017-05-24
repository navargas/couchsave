FROM node:latest

RUN npm install forever -g
ADD app /application
WORKDIR /application
RUN npm install
CMD forever app.js
