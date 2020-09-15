
const CONFIG = require('../../config');
/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
module.exports = {
    userService: require(`./helen/userService`),
    swaggerService: require(`./helen/swaggerService`),
    authService: require(`./helen/authService`),
    activityService: require(`./helen/activityService`),
    sessionService: require(`./helen/sessionService`),
    socketService: require(`./helen/socketService`),
    fileUploadService: require(`./helen/fileUploadService`),
    roomService: require(`./helen/roomService`)
};