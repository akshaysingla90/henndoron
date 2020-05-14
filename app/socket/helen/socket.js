const SERVICES = require(`../../services`);
const { userController } = require(`../../controllers`);
let { userModel } = require(`../../models`);
const HELPERS = require("../../helpers");
const { SOCKET_EVENTS, MESSAGES, ERROR_TYPES } = require('../../utils/constants');
let _ = require(`lodash`);


let socketConnection = {};
socketConnection.connect = function (io, p2p) {
    // io.use(SERVICES.authService.socketAuthentication);
    io.on('connection', async (socket) => {
        console.log('connection established', socket.id);
        socket.use((packet, next) => {
            console.log("Socket hit:=>", packet);
            next();
        });

        socket.on('peer-msg', function (data) {
            console.log('Message from peer: %s', data);
            socket.broadcast.emit('peer-msg', data);
        });

        socket.on('ready', function(data) {
            console.log('Ready event on server ', data);
        });

        socket.on('go-private', function (data) {
            console.log("Go private triggered  ", data)
            socket.broadcast.emit('go-private', data);
        });

        socket.on('start-stream', function (data) {
            console.log('Stream started')
            socket.broadcast.emit('start-stream', data)
        })

        /**
         * socket disconnect event.
         */
        socket.on(SOCKET_EVENTS.DISCONNECT, () => {
            console.log('Disconnected socket id is ', socket.id);
        });

        /**
         * events for student-teacher. 
         */
        socket.on('removeCardFromQueue',(data) => {
            console.log('removeCardFromQueue');
            socket.broadcast.emit('removeCardFromQueue', data)
        });

        socket.on('disableStudentInteraction',(data) => {
            console.log('disableStudentInteraction');
            socket.broadcast.emit('disableStudentInteraction', data)
        });

        socket.on('addCardToQueue',(data) => {
            console.log('addCardToQueue');
            socket.broadcast.emit('addCardToQueue', data)
        });

        socket.on('disableInteraction',(data) => {
            console.log('disableInteraction');
            socket.broadcast.emit('disableInteraction', data)
        });

        socket.on('receiveGrades',(data) => {
            console.log('receiveGrades');
            socket.broadcast.emit('receiveGrades', data)
        });

    });
};

module.exports = socketConnection;