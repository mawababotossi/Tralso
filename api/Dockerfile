FROM node:alpine

RUN mkdir -p /srv/api

WORKDIR /srv/api

COPY package.json .

RUN npm install -d

COPY . .

VOLUME ["/srv/api"]

# start app
CMD ["npm", "run", "start:dev"]
