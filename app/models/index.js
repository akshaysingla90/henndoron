'use strict';
const CONFIG = require('../../config');
/********************************
 **** Managing all the models ***
 ********* independently ********
 ********************************/
module.exports = {
    userModel: require(`../models/${CONFIG.PLATFORM}/userModel`),
    roomModel:require(`../models/${CONFIG.PLATFORM}/roomModel`),
    testUserModel:require(`../models/${CONFIG.PLATFORM}/testUserModel`)
};