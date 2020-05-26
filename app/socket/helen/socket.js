
const { SOCKET_EVENTS, LESSON_STATUS, USER_ROLE, SOCKET_EVENTS_TYPES } = require('../../utils/constants');
let _ = require(`lodash`);
let { roomService, authService, userService } = require(`../../services`);

let socketConnection = {};
socketConnection.connect = function (io, p2p) {
    io.use(authService.socketAuthentication);
    io.on(SOCKET_EVENTS.CONNECTION, async (socket) => {
        console.log('connection established', socket.id);
        //get ongoing room of the user.
        let onGoingRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
        // let onGoingRoom = await roomService.getRoomWithUsersInfo({ 'users.userId': socket.id });
        if (onGoingRoom) {
            console.log("On going room Id", onGoingRoom._id)
            let updatedRoom = await roomService.updateRoom({ _id: onGoingRoom._id, 'users.userId': socket.id }, { 'users.$.isOnline': true }, { new: true, lean: true });
            onGoingRoom = (await roomService.getRoomWithUsersInfo({ _id: updatedRoom._id }))[0];
            socket.join(onGoingRoom._id.toString());
            console.log("RoomData", onGoingRoom.roomData)
            if (onGoingRoom.createdBy.toString() == socket.id) {
                io.in(onGoingRoom._id.toString()).emit(SOCKET_EVENTS.SYNC_DATA, { data: { roomId: onGoingRoom._id, roomData: onGoingRoom.roomData || {} } });
            } else {
                socket.to(onGoingRoom._id.toString()).emit(SOCKET_EVENTS.SYNC_DATA, { data: { roomId: onGoingRoom._id, roomData: onGoingRoom.roomData || {} } });
            }
            socket.emit(SOCKET_EVENTS.RECONNECTED_SERVER, { data: { reconnect: true, roomId: onGoingRoom._id } });
            // _.remove(onGoingRoom.users, { userId: onGoingRoom.createdBy });
            let onlineUsers = onlineUsersFromAllUsers(onGoingRoom.users);
            // io.to(onGoingRoom.createdBy.toString()).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: onlineUsers }, roomId: onGoingRoom._id });
            io.in(onGoingRoom._id).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: onlineUsers }, roomId: onGoingRoom._id });
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
            let room = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
            if (room) {
                socket.leave(room._id.toString());
                let dataToUpdate = {};
                if (room.currentTurnUserId && room.currentTurnUserId == socket.id) {
                    dataToUpdate = { currentTurnUserId: '' };
                    io.in(room._id.toString()).emit(SOCKET_EVENTS.STUDENT_TURN, { data: { users: [] } });
                }
                let updatedRoom = await roomService.updateRoom({ _id: room._id, 'users.userId': socket.id }, { 'users.$.isOnline': false, ...dataToUpdate }, { lean: true, new: true });
                let latestRoomInfo = (await roomService.getRoomWithUsersInfo({ _id: room._id }))[0];
                let onlineUsers = onlineUsersFromAllUsers(latestRoomInfo.users);
                // io.to(latestRoomInfo.createdBy.toString()).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: onlineUsers, roomId: room._id } });
                io.in(latestRoomInfo._id.toString()).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: onlineUsers, roomId: room._id } });

            }
        });

        /**
         * events for student-teacher. 
         */
        socket.on(SOCKET_EVENTS.REMOVE_CARD_FROM_QUEUE, async (data) => {
            console.log('removeCardFromQueue');
            //get user room.
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.REMOVE_CARD_FROM_QUEUE, data);

            // socket.broadcast.emit(SOCKET_EVENTS.REMOVE_CARD_FROM_QUEUE, data)
        });

        socket.on(SOCKET_EVENTS.DISABLE_STUDENT_INTERATION, async (data) => {
            console.log('disableStudentInteraction');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.DISABLE_STUDENT_INTERATION, data);
            // socket.broadcast.emit(SOCKET_EVENTS.DISABLE_STUDENT_INTERATION, data)
        });

        socket.on(SOCKET_EVENTS.ADD_CARD_TO_QUEUE, async (data) => {
            console.log('addCardToQueue');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.ADD_CARD_TO_QUEUE, data);
            // socket.broadcast.emit(SOCKET_EVENTS.ADD_CARD_TO_QUEUE, data)
        });

        socket.on(SOCKET_EVENTS.DISABLE_INTERACTION, async (data) => {
            console.log('disableInteraction');
            console.log('addCardToQueue');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.DISABLE_INTERACTION, data);
            // socket.broadcast.emit(SOCKET_EVENTS.DISABLE_INTERACTION, data)
        });

        socket.on(SOCKET_EVENTS.RECEIVE_GRADES, async (data) => {
            console.log('receiveGrades');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.RECEIVE_GRADES, data);
            // socket.broadcast.emit(SOCKET_EVENTS.RECEIVE_GRADES, data)
        });

        socket.on(SOCKET_EVENTS.FLASH_CARDS_NEXT_ITEM, async (data) => {
            console.log('flashCardsNextItem');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.FLASH_CARDS_NEXT_ITEM, data);
            // socket.broadcast.emit(SOCKET_EVENTS.FLASH_CARDS_NEXT_ITEM, data)
        });

        socket.on(SOCKET_EVENTS.PLAYER_CHRACTER_CONVERSATION, async (data) => {
            console.log('playCharacterConversation');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.PLAYER_CHRACTER_CONVERSATION, data);
            // socket.broadcast.emit(SOCKET_EVENTS.PLAYER_CHRACTER_CONVERSATION, data)
        });

        socket.on(SOCKET_EVENTS.SHOW_FLASH_CARD, async (data) => {
            console.log('showFlashCard');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.SHOW_FLASH_CARD, data);
            // socket.broadcast.emit(SOCKET_EVENTS.SHOW_FLASH_CARD, data)
        });

        socket.on(SOCKET_EVENTS.LAUNCH_ACTIVITY, async (data) => {
            console.log('launchActivity');
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.LAUNCH_ACTIVITY, data);

            // socket.broadcast.emit(SOCKET_EVENTS.LAUNCH_ACTIVITY, data);
        });

        socket.on(SOCKET_EVENTS.CREATE_ROOM, async (data) => {        //{capacity:}
            await leaveAllPreviousRooms(socket, io);
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
            await leaveAllPreviousRooms(socket, io);
            let roomInfo = await roomService.getRoom({ _id: data.roomId, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true });
            if (!roomInfo) {
                socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { data: { msg: 'Invalid room id.' } });
                return;
            }
            if (roomInfo.users.length === (roomInfo.capacity + 1)) {
                socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { data: { msg: 'room is full.' } });
                return;
            }
            //update the room.
            //check is user already in room then change the status of the user.
            let updatedRoom = await roomService.updateRoom({ _id: data.roomId, 'users.userId': socket.id }, { 'users.$.isOnline': true }, { lean: true, new: true });
            if (!updatedRoom) {
                updatedRoom = await roomService.updateRoom({ _id: data.roomId, 'users.userId': { $ne: socket.id } }, { $push: { users: { userId: socket.id } } }, { lean: true, new: true });
            }
            let roomInfoWithUserInfo = await roomService.getRoomWithUsersInfo({ _id: data.roomId });
            roomInfoWithUserInfo = roomInfoWithUserInfo[0] || {};
            let allUsers = [...roomInfoWithUserInfo.users];
            let onlineUsers = onlineUsersFromAllUsers(allUsers);
            socket.join(data.roomId);
            socket.emit(SOCKET_EVENTS.JOIN_ROOM, { data: { numberOfUsers: onlineUsers.length, roomData: roomInfoWithUserInfo.roomData || {}, roomId: data.roomId } });
            // io.to(roomInfoWithUserInfo.createdBy.toString()).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: onlineUsers, roomId: data.roomId } });
            io.in(data.roomId).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: onlineUsers, roomId: data.roomId } });

        });

        socket.on(SOCKET_EVENTS.EXIT_ROOM, async (data) => {         //{roomId:}
            let updatedRoom = await roomService.updateRoom({ _id: data.roomId }, { $pull: { users: { userId: socket.id } } }, { lean: true, new: true });
            socket.leave(data.roomId);
            _.remove(updatedRoom.users, { userId: updatedRoom.createdBy });
            // io.to(updatedRoom.createdBy.toString()).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: updatedRoom.users, roomId: data.roomId } });
            io.in(data.roomId).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: updatedRoom.users, roomId: data.roomId } });
        });

        socket.on(SOCKET_EVENTS.SYNC_DATA, async (data) => {
            console.log('sync data');
            // let userRoom = await roomService.getRoom({ users: { $elemMatch: { userId: socket.id, isOnline: true } } }, {}, { lean: true, sort: { createdAt: -1 } });
            let userRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
            if (userRoom)
                socket.to(userRoom._id.toString()).emit(SOCKET_EVENTS.SYNC_DATA, data);
            // socket.broadcast.emit(SOCKET_EVENTS.SHOW_FLASH_CARD, data)
        });

        socket.on(SOCKET_EVENTS.SWITCH_TURN_BY_TEACHER, async (data) => {                 //{roomId:,users:[{userName:""},  ]}
            //get userInfo
            let userInfo = await userService.getUser({ userName: (data.users[0] || {}).userName || '' }, {});
            //update user turn in database.
            await roomService.updateRoom({ _id: data.roomId }, { $set: { currentTurnUserId: (userInfo || {})._id || '' } });
            io.in(data.roomId).emit(SOCKET_EVENTS.STUDENT_TURN, { data: { ...data } })
        });

        socket.on(SOCKET_EVENTS.SWITCH_TURN_BY_STUDENT, async (data) => {           //{roomId:""}
            let roomInfoWithUserInfo = await roomService.getRoomWithUsersInfo({ _id: data.roomId });
            let roomInfo = roomInfoWithUserInfo[0] || {};
            // let roomInfo = await roomService.getRoom({ _id: data.roomId }, {}, { lean: true });
            _.remove(roomInfo.users, { userId: roomInfo.createdBy });
            // let studentPos = roomInfo.users.map(function (e) {
            //     return e.userId.toString() == socket.id;
            // }).indexOf(socket.id);
            let allUsers = [...roomInfo.users];
            let onlineUsers = onlineUsersFromAllUsers(allUsers);
            let studentPos = _.findIndex(onlineUsers, { userId: socket.id });
            let nextPlayerIndex = ((studentPos + 1) % onlineUsers.length);
            // update the turn in the database
            await roomService.updateRoom({ _id: data.roomId }, { $set: { currentTurnUserId: onlineUsers[nextPlayerIndex].userId.toString() } });
            // let nextPlayerInfo = await testUserModel.findOne({ _id: roomInfo.users[nextPlayerUserId].userId }, {}, { lean: true });
            io.in(data.roomId).emit(SOCKET_EVENTS.STUDENT_TURN, { data: { roomId: data.roomId, users: [{ userName: onlineUsers[nextPlayerIndex].userName }] } });
        })

        socket.on(SOCKET_EVENTS.UPDATE_ROOM_DATA, async (data) => {                 //{roomId:,roomData:{}}
            await roomService.updateRoom({ _id: data.roomId }, { roomData: data.roomData });
        });

        socket.on(SOCKET_EVENTS.COMPLETE_LEASSON, async (data) => {             //{roomId:" "}
            let updatedRoom = await roomService.updateRoom({ createdBy: socket.id, _id: data.roomId }, { lessonStatus: LESSON_STATUS.COMPLETE }, { new: true, lean: true });    //TODO:add in constans
            if (updatedRoom) {
                io.in(data.roomId).emit(SOCKET_EVENTS.COMPLETE_LEASSON, { data: data });
                for (let index = 0; index < updatedRoom.users.length; index++) {
                    let socketInstanse = io.sockets.connected[updatedRoom.users[index].userId.toString()];
                    if (socketInstanse) {
                        socketInstanse.leave(data.roomId.toString());
                    }
                }
            }
        });

        socket.on(SOCKET_EVENTS.LIST_OF_ROOMS, async (data) => {    //{role: 1/2}
            let criteria = { lessonStatus: LESSON_STATUS.ON_GOING };
            if (data.role === USER_ROLE.TEACHER) {
                criteria = { createdBy: socket.id, ...criteria };
            };
            let list = await roomService.getAllRooms(criteria, { _id: 1 }, { sort: { createdAt: -1 } });
            socket.emit(SOCKET_EVENTS.LIST_OF_ROOMS, { data: list })

        });



        /**
         * Single socket event to manage all the socket events.
         * 
         */
        let dataForSingleEvent = {
            eventName: 'eventName',
            eventType: 1,
            data: {

            }
        };


        //   REMOVE_CARD_FROM_QUEUE: 1,
        //   DISABLE_STUDENT_INTERATION: 2,
        //   ADD_CARD_TO_QUEUE: 3,
        //   DISABLE_INTERACTION: 4,
        //   RECEIVE_GRADES: 5,
        //   FLASH_CARDS_NEXT_ITEM: 6,
        //   PLAYER_CHRACTER_CONVERSATION: 7,
        //   SHOW_FLASH_CARD: 8,
        //   LAUNCH_ACTIVITY: 9,


        //   CREATE_ROOM: 10,
        //   JOIN_ROOM: 11,
        //   ROOM_DATA: 12,
        //   EXIT_ROOM: 13,
        //   SOCKET_ERROR: 14,
        //   STUDENT_STATUS: 15,


        //   SYNC_DATA: 16,


        //   RECONNECTED_SERVER: 17,
        //   SWITCH_TURN_BY_TEACHER: 18,
        //   SWITCH_TURN_BY_STUDENT: 19,
        //   STUDENT_TURN: 20,
        //   UPDATE_ROOM_DATA: 21,
        //   COMPLETE_LEASSON: 22,
        //   LIST_OF_ROOMS: 23

        socket.on('SingleEvent', async (data) => {
            if (data.eventType) {
                if (data.eventType === SOCKET_EVENTS_TYPES.CREATE_ROOM) {
                    await createRoom(socket, data);
                } else if (data.eventType === SOCKET_EVENTS_TYPES.JOIN_ROOM) {
                    await joinRoom(socket, data, io);
                } else if (data.eventType === SOCKET_EVENTS_TYPES.ROOM_DATA) {
                    let roomId = ((data || {}).data || {}).roomId,
                        roomData = ((data || {}).data || {}).roomData;
                    await roomService.updateRoom({ _id: roomId }, { roomData });
                } else if (data.eventType === SOCKET_EVENTS_TYPES.EXIT_ROOM) {
                    await exitRoom(socket, data, io);
                }
                else {
                    let userRoom = await roomService.getRoom({ 'users.userId': socket.id, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true, sort: { createdAt: -1 } });
                    if (userRoom) {
                        socket.to(userRoom._id.toString()).emit('SingleEvent', data);
                    }
                }
            }else{
                // TODO socket error of invalid payload. 
            }
        });


    });
};

let onlineUsersFromAllUsers = (allUsers) => {
    return _.filter(allUsers, {
        isOnline: true
    });
};

let leaveAllPreviousRooms = async (socket, io) => {
    let ongoingRooms = io.sockets.adapter.sids[socket.id];
    for (let room in ongoingRooms) {
        let roomInfo = await roomService.getRoom({ _id: room.toString() }, {}, { lean: true });
        socket.leave(room.toString());
        if (roomInfo) {
            let dataToUpdate = {};
            if (roomInfo.currentTurnUserId && roomInfo.currentTurnUserId == socket.id) {
                dataToUpdate = { currentTurnUserId: '' };
                io.in(roomInfo._id.toString()).emit(SOCKET_EVENTS.STUDENT_TURN, { data: { users: [] } });
            }
            let updatedRoom = await roomService.updateRoom({ _id: roomInfo._id, 'users.userId': socket.id }, { 'users.$.isOnline': false, ...dataToUpdate }, { lean: true, new: true });
            let latestRoomInfo = (await roomService.getRoomWithUsersInfo({ _id: roomInfo._id }))[0];
            let onlineUsers = onlineUsersFromAllUsers(latestRoomInfo.users);
            io.in(latestRoomInfo._id.toString()).emit(SOCKET_EVENTS.STUDENT_STATUS, { data: { users: onlineUsers, roomId: roomInfo._id } });
        }
    }
};

let createRoom = async (socket, data) => {
    await leaveAllPreviousRooms(socket, io);
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
    data.data.roomId = roomInfo._id;
    socket.emit('SingleEvent', data);
};

let joinRoom = async (socket, data, io) => {
    await leaveAllPreviousRooms(socket, io);
    let roomId = ((data || {}).data || {}).roomId;
    let roomInfo = await roomService.getRoom({ _id: roomId, lessonStatus: LESSON_STATUS.ON_GOING }, {}, { lean: true });
    if (!roomInfo) {
        socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { data: { msg: 'Invalid room id.' } });
        return;
    }
    if (roomInfo.users.length === (roomInfo.capacity + 1)) {
        socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { data: { msg: 'room is full.' } });
        return;
    }
    //update the room.
    //check is user already in room then change the status of the user.
    let updatedRoom = await roomService.updateRoom({ _id: roomId, 'users.userId': socket.id }, { 'users.$.isOnline': true }, { lean: true, new: true });
    if (!updatedRoom) {
        updatedRoom = await roomService.updateRoom({ _id: roomId, 'users.userId': { $ne: socket.id } }, { $push: { users: { userId: socket.id } } }, { lean: true, new: true });
    }
    let roomInfoWithUserInfo = await roomService.getRoomWithUsersInfo({ _id: roomId });
    roomInfoWithUserInfo = roomInfoWithUserInfo[0] || {};
    let allUsers = [...roomInfoWithUserInfo.users];
    let onlineUsers = onlineUsersFromAllUsers(allUsers);
    socket.join(roomId);
    data.data = { numberOfUsers: onlineUsers.length, roomData: roomInfoWithUserInfo.roomData || {}, roomId };
    socket.emit('SingleEvent', data);

    data.data = { users: onlineUsers, roomId };
    data.eventType = SOCKET_EVENTS_TYPES.STUDENT_STATUS;
    io.in(roomId).emit('SingleEvent', data);
};

/**
 * function when a student exit from room. 
 * @param {*} socket 
 * @param {*} data 
 * @param {*} io 
 */
let exitRoom = async (socket, data, io) => {
    let roomId = ((data || {}).data || {}).roomId;
    let updatedRoom = await roomService.updateRoom({ _id: roomId }, { $pull: { users: { userId: socket.id } } }, { lean: true, new: true });
    socket.leave(data.roomId);
    _.remove(updatedRoom.users, { userId: updatedRoom.createdBy });
    data.eventType = SOCKET_EVENTS_TYPES.STUDENT_STATUS;
    data.data = { users: updatedRoom.users, roomId };
    io.in(data.roomId).emit('SingleEvent', data);
};

module.exports = socketConnection;