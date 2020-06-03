
'use strict';


/********************************
 ********* All routes ***********
 ********************************/
let v1Routes = [
    ...require('./userRoutes'),
    ...require('./teacherRoutes'),
]
module.exports = v1Routes;
