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

//Function to update the room.
roomService.updateMany = async (criteria, dataToUpdate, options) => {
    return await roomModel.updateMany(criteria, dataToUpdate, options);
};

//Function to get room.
roomService.getRoom = async (criteria, projection, options) => {
    return await roomModel.findOne(criteria, projection, options);
};

//function to get room info with userInfo.
roomService.getRoomWithUsersInfo = async (criteria) => {
    let query = [
        { $match: { ...criteria } },
        { $unwind: '$users' },
        {
            $lookup: {
                from: 'users',
                localField: 'users.userId',
                foreignField: '_id',
                as: 'users.userInfo'
            }
        },
        {
            $unwind: '$users.userInfo'
        },
        {
            $addFields: {
                'users.userName': '$users.userInfo.userName',
                'users.rewards':'$users.userInfo.rewards'
            }
        },
        {
            $project: { 'users.userInfo': 0 }
        },
        {
            $group: {
                _id: '$_id',
                root: { $mergeObjects: '$$ROOT' },
                users: { $push: '$users' }
            }
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ['$root', '$$ROOT']
                }
            }
        },
        {
            $project: {
                root: 0
            }
        },
        {
            $sort: { createdAt: -1 }
        }

    ];
    return roomModel.aggregate(query);
};

//Function to get all rooms.
roomService.getAllRooms = async (criteria, projection, options) => {
    return await roomModel.find(criteria, projection, options);
};

module.exports = roomService;