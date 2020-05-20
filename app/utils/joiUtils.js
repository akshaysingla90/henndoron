const Joi = require('@hapi/joi');
const mongoose = require('mongoose');


const joiUtils = {};

/**
 * Extension for Joi.
 */
joiUtils.Joi = Joi.extend((Joi) => ({
    type: 'string',
    base: Joi.string(),
    messages: {
        'string.objectId': 'must be a valid id',
        'string.emailMessage': 'must be a valid email'
    },
    rules: {
        objectId: {
            validate(value, helpers, args, options) {
                if (mongoose.Types.ObjectId.isValid(value)) {
                    return mongoose.Types.ObjectId(value);
                }
                return helpers.error('string.objectId');
            }
        },
        isValidEmail: {
            validate(value, helpers, args, options) {
                let filter = /^([\w]+)(.[\w]+)*@([\w]+)(.[a-z]{2,3}){1,2}$/;
                if (filter.test(value.toLowerCase())) {
                    return value.toLowerCase();
                }
                return helpers.error('string.emailMessage');
            }
        }
    }
}));

module.exports = joiUtils;