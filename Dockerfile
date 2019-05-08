FROM node:11.12
RUN apt-get update && apt-get install -y vim kafkacat

COPY package.json /usr/src/app/

WORKDIR /usr/src/app/

RUN npm install

COPY kafka.js /usr/src/app/
CMD ["npx","ts-node","kafka.ts"]
