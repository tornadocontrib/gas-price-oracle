FROM node:20-alpine
WORKDIR /app

COPY . .

RUN yarn && yarn build

ENTRYPOINT ["yarn", "start"]