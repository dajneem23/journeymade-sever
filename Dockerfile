FROM node:18-alpine as builder

ENV NODE_ENV=production

# ARG ENV_VARS
# ENV ENV_VARS=$ENV_VARS
# RUN echo $ENV_VARS

ARG NODE_AUTH_TOKEN
ENV NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN

# Create app directory

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock .npmrc ./

RUN ls
RUN yarn install --prod --frozen-lockfile

COPY . .

RUN yarn build

# remove development dependencies
RUN yarn autoclean --force

RUN rm -f .npmrc

## this is stage two , where the app actually runs
FROM node:18-alpine as runner

# Create app directory

ENV NODE_ENV=production
# ARG ENV_VARS
# ENV ENV_VARS=$ENV_VARS
# RUN echo $ENV_VARS

WORKDIR /usr/src/app

# Install app dependencies
COPY --from=builder /usr/src/app/package*.json /usr/src/app/yarn.lock /usr/src/app/.env /usr/src/app/dist ./
COPY --from=builder /usr/src/app/node_modules ./node_modules

# RUN yarn install --production

EXPOSE 3000

CMD [ "node", "--max-old-space-size=8192", "server.js" ]
