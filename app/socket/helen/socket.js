
const { SOCKET_EVENTS } = require('../../utils/constants');
let _ = require(`lodash`);
let { roomService, authService } = require(`../../services`);
let { testUserModel } = require(`../../models`);

let socketConnection = {};
socketConnection.connect = function (io, p2p) {
    io.use(authService.socketAuthentication);
    io.on(SOCKET_EVENTS.CONNECTION, async (socket) => {
        console.log('connection established', socket.id);
        //get ongoing room of the user.
        let onGoingRoom = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
        if (onGoingRoom) {
            socket.join(onGoingRoom._id.toString());
            if (onGoingRoom.createdBy.toString() == socket.id) {
                io.in(onGoingRoom._id).emit(SOCKET_EVENTS.SYNC_DATA, { data: { roomId: onGoingRoom._id, roomData: onGoingRoom.roomData || {} } });
            } else {
                socket.to(onGoingRoom._id.toString()).emit(SOCKET_EVENTS.SYNC_DATA, { data: { roomId: onGoingRoom._id, roomData: onGoingRoom.roomData || {} } });
            }
            socket.emit(SOCKET_EVENTS.RECONNECTED_SERVER, { data: { reconnect: true } });
            _.remove(onGoingRoom.users, { userId: onGoingRoom.createdBy })
            io.to(onGoingRoom.createdBy.toString()).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: onGoingRoom.users } });
        }
        socket.use((packet, next) => {
            console.log("Socket hit:=>", packet);
            next();
        });

        socket.on(SOCKET_EVENTS.PEER_MSG, function (data) {
            console.log('Message from peer: %s', data);
            socket.broadcast.emit(SOCKET_EVENTS.PEER_MSG, data);
        });

        socket.on(SOCKET_EVENTS.READY, function (data) {
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
        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            console.log('Disconnected socket id is ', socket.id);
            // let room = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
            // if (room) {
            //     socket.leave(room._id.toString());
            //     let updatedRoom = await roomService.updateRoom({ _id: room._id }, { $pull: { users: { userId: socket.id } } }, { lean: true, new: true });
            //     if (socket.id != updatedRoom.createdBy.toString())
            //         io.to(updatedRoom.createdBy.toString()).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { studentId: socket.id, status: STUDENT_STATUS.LEAVE } });
            // }
            //remove from all the rooms.
        });

        /**
         * events for student-teacher. 
         */
        socket.on(SOCKET_EVENTS.REMOVE_CARD_FROM_QUEUE, async (data) => {
            console.log('removeCardFromQueue');
            //get user room.
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.REMOVE_CARD_FROM_QUEUE, data);

            // socket.broadcast.emit(SOCKET_EVENTS.REMOVE_CARD_FROM_QUEUE, data)
        });

        socket.on(SOCKET_EVENTS.DISABLE_STUDENT_INTERATION, async (data) => {
            console.log('disableStudentInteraction');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.DISABLE_STUDENT_INTERATION, data);
            // socket.broadcast.emit(SOCKET_EVENTS.DISABLE_STUDENT_INTERATION, data)
        });

        socket.on(SOCKET_EVENTS.ADD_CARD_TO_QUEUE, async (data) => {
            console.log('addCardToQueue');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.ADD_CARD_TO_QUEUE, data);
            // socket.broadcast.emit(SOCKET_EVENTS.ADD_CARD_TO_QUEUE, data)
        });

        socket.on(SOCKET_EVENTS.DISABLE_INTERACTION, async (data) => {
            console.log('disableInteraction');
            console.log('addCardToQueue');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.DISABLE_INTERACTION, data);
            // socket.broadcast.emit(SOCKET_EVENTS.DISABLE_INTERACTION, data)
        });

        socket.on(SOCKET_EVENTS.RECEIVE_GRADES, async (data) => {
            console.log('receiveGrades');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.RECEIVE_GRADES, data);
            // socket.broadcast.emit(SOCKET_EVENTS.RECEIVE_GRADES, data)
        });

        socket.on(SOCKET_EVENTS.FLASH_CARDS_NEXT_ITEM, async (data) => {
            console.log('flashCardsNextItem');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.FLASH_CARDS_NEXT_ITEM, data);
            // socket.broadcast.emit(SOCKET_EVENTS.FLASH_CARDS_NEXT_ITEM, data)
        });

        socket.on(SOCKET_EVENTS.PLAYER_CHRACTER_CONVERSATION, async (data) => {
            console.log('playCharacterConversation');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.PLAYER_CHRACTER_CONVERSATION, data);
            // socket.broadcast.emit(SOCKET_EVENTS.PLAYER_CHRACTER_CONVERSATION, data)
        });

        socket.on(SOCKET_EVENTS.SHOW_FLASH_CARD, async (data) => {
            console.log('showFlashCard');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.SHOW_FLASH_CARD, data);
            // socket.broadcast.emit(SOCKET_EVENTS.SHOW_FLASH_CARD, data)
        });

        socket.on(SOCKET_EVENTS.LAUNCH_ACTIVITY, async (data) => {
            console.log('launchActivity');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.LAUNCH_ACTIVITY, data);

            // socket.broadcast.emit(SOCKET_EVENTS.LAUNCH_ACTIVITY, data);
        });

        socket.on(SOCKET_EVENTS.CREATE_ROOM, async (data) => {        //{capacity:}
            let roomNumber = await roomService.getRoom({}, {}, { sort: { createdAt: -1 } });
            //create room.
            let dataToSave = {
                createdBy: socket.id,
                users: [{ userId: socket.id }],
                createdBy: socket.id,
                capacity: data.capacity,
                _id: '1'
            };
            if (roomNumber) {
                dataToSave['_id'] = parseInt(roomNumber._id) + 1;
                dataToSave._id.toString();
            }
            let roomInfo = await roomService.createRoom(dataToSave);
            console.log('roomInfo', roomInfo._id.toString());
            socket.join(roomInfo._id.toString());
            socket.emit(SOCKET_EVENTS.CREATE_ROOM, { data: { roomId: roomInfo._id } });
        });

        socket.on(SOCKET_EVENTS.JOIN_ROOM, async (data) => {     //{roomId:}
            let roomInfo = await roomService.getRoom({ _id: data.roomId }, {}, { lean: true });
            // let roomInfo = await roomService.getRoomWithUsersInfo({ _id: data.roomId });
            if (roomInfo.users.length === (roomInfo.capacity + 1)) {
                socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { data: { msg: 'room is full.' } });
                return;
            }
            await roomService.updateRoom({ _id: data.roomId, 'users.userId': { $ne: socket.id } }, { $addToSet: { users: { userId: socket.id } } }, { lean: true, new: true });
            let roomInfoWithUserInfo = await roomService.getRoomWithUsersInfo({ _id: data.roomId });
            roomInfoWithUserInfo = roomInfoWithUserInfo[0] || {};
            for (let i = 0; i < roomInfoWithUserInfo.userName.length; i++) {
                roomInfoWithUserInfo.userName[i].userName = roomInfoWithUserInfo.userName[i]['name'];
                delete roomInfoWithUserInfo.userName[i].name;
                delete roomInfoWithUserInfo.userName[i]._id;
            }

            socket.join(data.roomId);
            socket.emit(SOCKET_EVENTS.JOIN_ROOM, { data: { numberOfUsers: roomInfoWithUserInfo.users.length, roomData: roomInfoWithUserInfo.roomData || {}, roomId: data.roomId } });
            // _.remove(updatedRoom.users, { userId: roomInfoWithUserInfo.createdBy })
            io.to(roomInfoWithUserInfo.createdBy.toString()).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: roomInfoWithUserInfo.userName } });
        });

        socket.on(SOCKET_EVENTS.EXIT_ROOM, async (data) => {         //{roomId:}
            let updatedRoom = await roomService.updateRoom({ _id: data.roomId }, { $pull: { users: { userId: socket.id } } }, { lean: true, new: true });
            socket.leave(data.roomId);
            _.remove(updatedRoom.users, { userId: updatedRoom.createdBy });
            io.to(updatedRoom.createdBy.toString()).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: updatedRoom.users } });
        });

        socket.on(SOCKET_EVENTS.SYNC_DATA, async (data) => {
            console.log('sync data');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.SYNC_DATA, data);
            // socket.broadcast.emit(SOCKET_EVENTS.SHOW_FLASH_CARD, data)
        });

        socket.on(SOCKET_EVENTS.SWITCH_TURN_BY_TEACHER, async (data) => {                 //{roomId:,users:[{userName:""},  ]}
            io.in(data.roomId).emit(SOCKET_EVENTS.STUDENT_TURN, { data: { ...data } })
        });

        socket.on(SOCKET_EVENTS.SWITCH_TURN_BY_STUDENT, async (data) => {           //{roomId:""}
            let roomInfo = await roomService.getRoom({ _id: data.roomId }, {}, { lean: true });
            _.remove(roomInfo.users, { userId: roomInfo.createdBy });
            // let studentPos = roomInfo.users.map(function (e) {
            //     return e.userId.toString() == socket.id;
            // }).indexOf(socket.id);
            let studentPos = _.findIndex(roomInfo.users, { userId: socket.id });
            console.log(studentPos, "-------")
            let nextPlayerUserId = ((studentPos + 1) % roomInfo.users.length);
            console.log("nextPlayerUserId", nextPlayerUserId)
            let nextPlayerInfo = await testUserModel.findOne({ _id: roomInfo.users[nextPlayerUserId].userId }, {}, { lean: true });
            io.in(data.roomId).emit(SOCKET_EVENTS.STUDENT_TURN, { roomId: data.roomId, users: [{ userName: nextPlayerInfo.name }] });
        })

        socket.on(SOCKET_EVENTS.UPDATE_ROOM_DATA, async (data) => {                 //{roomId:,roomData:{}}
            await roomService.updateRoom({ _id: data.roomId }, { roomId: data.roomData });
        });
    });
};

module.exports = socketConnection;