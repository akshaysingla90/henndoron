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

//function to get room info with userInfo.
roomService.getRoomWithUsersInfo = async (criteria) => {
    let query = [
        { $match: { ...criteria } },
        {
            $lookup: {
                from: 'testusers',
                localField: 'users.userId',
                foreignField: '_id',
                as: 'userName'
            }
        }
    ];
    return roomModel.aggregate(query);
};

module.exports = roomService;