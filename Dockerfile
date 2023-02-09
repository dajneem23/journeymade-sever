FROM node:lts-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package.json tsconfig.json .env ./

ARG ENV_VARS
ENV ENV_VARS=$ENV_VARS
RUN echo $ENV_VARS

# RUN npm install --production --silent && mv node_modules ../
RUN yarn --pure-lockfile

# Copy all file from current dir to /app in container
COPY . .

EXPOSE 3001

CMD ["yarn", "start"]
