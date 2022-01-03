FROM node:alpine
WORKDIR /home/node/app
COPY --chown=node:node . .
RUN npm install
USER node
ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]