FROM node:12
COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 5000
CMD node server.js
