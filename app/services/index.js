
const CONFIG = require('../../config');
/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
module.exports = {
    userService: require(`./${CONFIG.PLATFORM}/userService`),
    swaggerService: require(`./${CONFIG.PLATFORM}/swaggerService`),
    authService: require(`./${CONFIG.PLATFORM}/authService`),
    sessionService: require(`./${CONFIG.PLATFORM}/sessionService`),
    socketService: require(`./${CONFIG.PLATFORM}/socketService`),
    fileUploadService: require(`./${CONFIG.PLATFORM}/fileUploadService`),
    roomService: require(`./${CONFIG.PLATFORM}/roomService`)
};