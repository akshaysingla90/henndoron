'use strict';

const { Joi } = require('../../../utils/joiUtils');
const { USER_ROLE } = require(`../../../utils/constants`);
//load controllers
const { saveRewardPoints } = require(`../../../controllers/helen/userController`);

let routes = [
    {
        method: 'POST',
        path: '/v1/teacher/rewardPoints',
        joiSchemaForSwagger: {
            headers: Joi.object({
                'authorization': Joi.string().required().description('User\'s JWT token.')
            }).unknown(),
            body: {
                studentUserName: Joi.string().required().description('Student user name.'),
                rewards: Joi.number().optional().description('Reward Points.'),
                roomId: Joi.string().required().description('Room Id.'),
                // activity: Joi.string().required().description('Activity name.')
            },
            group: 'Teacher',
            description: 'Route to reward student.',
            model: 'Reward_Points'
        },
        // auth: [USER_ROLE.STUDENT, USER_ROLE.TEACHER],
        handler: saveRewardPoints
    }
];

module.exports = routes;




