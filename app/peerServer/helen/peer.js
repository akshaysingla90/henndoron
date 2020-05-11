const { ExpressPeerServer } = require('peer');

let peerConnection = {};

/**
 * Create peer server using existing express server.
 */
peerConnection.connect = function (server, app) {
    const peerServer = ExpressPeerServer(server, {
        debug: true,
        path: '/myapp'
    });
    app.use('/peerjs', peerServer);
    peerServer.on('connection', (client) => {
        console.log('Client connected', client.id);
    });

    peerServer.on('disconnect',(client) => {
        console.log('Disconnected client is ', client.id);
    });
};

module.exports = peerConnection;