
const { SOCKET_EVENTS } = require('../../utils/constants');
let _ = require(`lodash`);


let socketConnection = {};
socketConnection.connect = function (io, p2p) {
    // io.use(SERVICES.authService.socketAuthentication);
    io.on(SOCKET_EVENTS.CONNECTION, async (socket) => {
        console.log('connection established', socket.id);
        socket.use((packet, next) => {
            console.log("Socket hit:=>", packet);
            next();
        });

        socket.on(SOCKET_EVENTS.PEER_MSG, function (data) {
            console.log('Message from peer: %s', data);
            socket.broadcast.emit(SOCKET_EVENTS.PEER_MSG, data);
        });

        socket.on(SOCKET_EVENTS.READY, function(data) {
            console.log('Ready event on server ', data);
        });

        socket.on(SOCKET_EVENTS.GO_PRIVATE, function (data) {
            console.log("Go private triggered  ", data)
            socket.broadcast.emit(SOCKET_EVENTS.GO_PRIVATE, data);
        });

        socket.on(SOCKET_EVENTS.START_STREAM, function (data) {
            console.log('Stream started')
            socket.broadcast.emit(SOCKET_EVENTS.START_STREAM, data)
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
        socket.on(SOCKET_EVENTS.REMOVE_CARD_FROM_QUEUE,(data) => {
            console.log('removeCardFromQueue');
            socket.broadcast.emit(SOCKET_EVENTS.REMOVE_CARD_FROM_QUEUE, data)
        });

        socket.on(SOCKET_EVENTS.DISABLE_STUDENT_INTERATION,(data) => {
            console.log('disableStudentInteraction');
            socket.broadcast.emit(SOCKET_EVENTS.DISABLE_STUDENT_INTERATION, data)
        });

        socket.on(SOCKET_EVENTS.ADD_CARD_TO_QUEUE,(data) => {
            console.log('addCardToQueue');
            socket.broadcast.emit(SOCKET_EVENTS.ADD_CARD_TO_QUEUE, data)
        });

        socket.on(SOCKET_EVENTS.DISABLE_INTERACTION,(data) => {
            console.log('disableInteraction');
            socket.broadcast.emit(SOCKET_EVENTS.DISABLE_INTERACTION, data)
        });

        socket.on(SOCKET_EVENTS.RECEIVE_GRADES,(data) => {
            console.log('receiveGrades');
            socket.broadcast.emit(SOCKET_EVENTS.RECEIVE_GRADES, data)
        });

        socket.on(SOCKET_EVENTS.FLASH_CARDS_NEXT_ITEM,(data) => {
            console.log('flashCardsNextItem');
            socket.broadcast.emit(SOCKET_EVENTS.FLASH_CARDS_NEXT_ITEM, data)
        });
        
        socket.on(SOCKET_EVENTS.PLAYER_CHRACTER_CONVERSATION,(data) => {
            console.log('playCharacterConversation');
            socket.broadcast.emit(SOCKET_EVENTS.PLAYER_CHRACTER_CONVERSATION, data)
        });
        
        socket.on(SOCKET_EVENTS.SHOW_FLASH_CARD,(data) => {
            console.log('showFlashCard');
            socket.broadcast.emit(SOCKET_EVENTS.SHOW_FLASH_CARD, data)
        });
        
        socket.on(SOCKET_EVENTS.LAUNCH_ACTIVITY,(data) => {
            console.log('launchActivity');
            socket.broadcast.emit(SOCKET_EVENTS.LAUNCH_ACTIVITY, data)
        });
    });
};

module.exports = socketConnection;