FROM node:alpine
WORKDIR /home/node/app
COPY . .
USER node
RUN npm install
CMD npm run start