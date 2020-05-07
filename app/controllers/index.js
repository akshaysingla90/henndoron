'use strict';
const CONFIG = require('../../config');
/********************************
 **** Managing all the controllers ***
 ********* independently ********
 ********************************/
module.exports = {
    userController: require(`./${CONFIG.PLATFORM}/userController`)
};