const SERVICES = require(`../../services`);
const {  userController  } = require(`../../controllers`);
let { userModel } = require(`../../models`);
const HELPERS = require("../../helpers");
const { SOCKET_EVENTS, MESSAGES, ERROR_TYPES } = require('../../utils/constants');
let _ = require(`lodash`);


let socketConnection = {};
socketConnection.connect = function (io) {
    // io.use(SERVICES.authService.socketAuthentication);
    io.on('connection', async (socket) => {
        socket.use((packet, next) => {
            console.log("Socket hit:=>", packet);
            next();
        });
        console.log('connection established', socket.id);
        /**
         * socket disconnect event.
         */
        socket.on(SOCKET_EVENTS.DISCONNECT, async (data) => {
            console.log('Disconnected socket id is ', data.userId);
            await SERVICES.socketService.removeUserSocketId(data.userId);
        });

        socket.on('testing', (data) => {
            console.log('Testing is ', data);
        });

    });
};

module.exports = socketConnection;