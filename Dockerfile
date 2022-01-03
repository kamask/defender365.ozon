FROM node:alpine
WORKDIR /home/node/app
COPY --chown=node:node . .
USER node
RUN npm i
CMD ["npm", "start"]