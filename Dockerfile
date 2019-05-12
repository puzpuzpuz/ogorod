FROM node:10

WORKDIR /ogorod
COPY . /ogorod

RUN npm ci

CMD npm start
