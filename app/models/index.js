'use strict';
const CONFIG = require('../../config');
/********************************
 **** Managing all the models ***
 ********* independently ********
 ********************************/
module.exports = {
    userModel: require(`../models/helen/userModel`),
    roomModel: require(`../models/helen/roomModel`),
    versionModel: require(`../models/helen/versionModel`),
    activityModel: require(`../models/helen/activityModel`),
    lessonModel: require(`../models/helen/lessonModel`),
    courseModel: require(`../models/helen/courseModel`)
};