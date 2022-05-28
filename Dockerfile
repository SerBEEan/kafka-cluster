FROM node:16

WORKDIR /usr/src/app
COPY . .

RUN npm i
CMD [ "ping", "127.0.0.1" ]