
'use strict';

/***********************************
 **** node module defined here *****
 ***********************************/
require('dotenv').config();
const EXPRESS = require("express");
const CONFIG = require('./config');
/**creating express server app for server */
const app = EXPRESS();
const { ExpressPeerServer } = require('peer');


/********************************
 ***** Server Configuration *****
 ********************************/
app.set('port', CONFIG.server.PORT);
app.use(EXPRESS.static(__dirname + '/'));
// configuration to setup socket.io on express server.
const server = require('http').Server(app);
// const io = require('socket.io')(server);
global.io = require('socket.io')(server);


/** Server is running here */
let startNodeserver = async () => {
  // express startup.
  await require(`./app/startup/${CONFIG.PLATFORM}/expressStartup`)(app);
  // start socket on server
  await require(`./app/socket/${CONFIG.PLATFORM}/socket`).connect(global.io);

  return new Promise((resolve, reject) => {
    server.listen(CONFIG.server.PORT, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};


startNodeserver()
  .then(() => {
    connectPeerServer(server,app);
    console.log('Node server running on ', CONFIG.server.URL);
  }).catch((err) => {
    console.log('Error in starting server', err);
    process.exit(1);
  });

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error);
});

/**
 * Start peer server with express app.
 */
let connectPeerServer = (server, app) => {
  const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/myapp'
  });
  app.use('/peerjs', peerServer);
};