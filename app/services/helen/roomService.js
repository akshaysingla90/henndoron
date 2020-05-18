'use strict';
const CONFIG = require('../../../config')
const roomModel = require(`../../models/${CONFIG.PLATFORM}/roomModel`);

let roomService = {};

/**
 * function to create room.
 */
roomService.createRoom = async (dataToInsert) => {
    return await roomModel(dataToInsert).save();
};

//Function to update the room.
roomService.updateRoom = async (criteria, dataToUpdate, options) => {
    return await roomModel.findOneAndUpdate(criteria, dataToUpdate, options);
};

//Function to get room.
roomService.getRoom = async (criteria, projection, options) => {
    return await roomModel.findOne(criteria, projection, options);
};

module.exports = roomService;