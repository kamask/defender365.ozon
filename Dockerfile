FROM node:alpine
WORKDIR /home/node/app
COPY . .
USER node
RUN npm i
CMD npm run start