
'use strict';


/********************************
 ********* All routes ***********
 ********************************/
let v1Routes = [
    ...require('./userRoutes'),
    ...require('./adminRoutes'),
    ...require('./teacherRoutes'),
    // ...require('./lessonRoutes'),
]
module.exports = v1Routes;
