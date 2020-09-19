const { updateActivityTemplate } = require('./app/controllers/helen/adminController');

(
  async () => {
    let result = await updateActivityTemplate();
    console.log(result.msg);
  }
)();