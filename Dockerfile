FROM node:20-alpine
WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

RUN npm i -g yarn && yarn

COPY . .

EXPOSE 7000
ENTRYPOINT ["yarn", "start"]