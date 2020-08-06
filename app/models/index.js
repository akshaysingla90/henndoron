'use strict';
const CONFIG = require('../../config');
/********************************
 **** Managing all the models ***
 ********* independently ********
 ********************************/
module.exports = {
    userModel: require(`../models/${CONFIG.PLATFORM}/userModel`),
    roomModel: require(`../models/${CONFIG.PLATFORM}/roomModel`),
    versionModel: require(`../models/${CONFIG.PLATFORM}/versionModel`),
    activityModel: require(`../models/${CONFIG.PLATFORM}/activityModel`)
};