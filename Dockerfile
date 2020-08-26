FROM node:12.18.3

WORKDIR /usr/src/smartbrainAPI

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]