'use strict';
const { userModel } = require(`../../models`);

let userService = {};

/**
 * function to fetch user from the system based on criteria.
 */
userService.getUser = async (criteria, projection) => {
  return await userModel.findOne(criteria, projection).lean();
};

/**
 * function to create new user if not exists in databaase for the given criteria 
 * and update if it exists in the database. 
 */
userService.createAndUpdateUser = async (criteria = {}, dataToUpdate = {}) => {
  return await userModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, upsert: true }).lean();
};

module.exports = userService;