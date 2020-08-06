
'use strict';


/********************************
 ********* All routes ***********
 ********************************/
let v1Routes = [
    ...require('./userRoutes'),
    ...require('./adminRoutes'),
    ...require('./teacherRoutes'),
]
module.exports = v1Routes;
