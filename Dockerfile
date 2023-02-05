FROM node:lts-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

ARG ENV_VARS
ENV ENV_VARS=$ENV_VARS
RUN echo $ENV_VARS

# RUN npm install --production --silent && mv node_modules ../
RUN yarn install --pure-lockfile
RUN yarn build

# Copy all file from current dir to /app in container
COPY . .

EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
