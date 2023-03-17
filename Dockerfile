FROM node:lts-alpine as builder

ENV NODE_ENV=production

ARG ENV_VARS
ENV ENV_VARS=$ENV_VARS
RUN echo $ENV_VARS

# Create app directory

WORKDIR /usr/src/app

# Install app dependencies
COPY . .

RUN ls
RUN yarn && yarn build

## this is stage two , where the app actually runs
FROM node:18-alpine as runner

# Create app directory

ENV NODE_ENV=production
ARG ENV_VARS
ENV ENV_VARS=$ENV_VARS
RUN echo $ENV_VARS

WORKDIR /usr/src/app

# Install app dependencies
COPY --from=builder /usr/src/app/package*.json /usr/src/app/yarn.lock /usr/src/app/.env /usr/src/app/dist ./

RUN yarn install --production

EXPOSE 3001

CMD [ "node", "server.js" ]
