'use strict';
const CONFIG = require('../../config');
/********************************
 **** Managing all the helpers ***
 ********* independently ********
 ********************************/
module.exports = {
    responseHelper: require(`./${CONFIG.PLATFORM}/common/resHelper`) 
};