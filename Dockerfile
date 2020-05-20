FROM node:12.16.3
COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 3000
CMD node server.js