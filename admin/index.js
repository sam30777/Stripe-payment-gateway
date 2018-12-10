const adminValidator  = require('./ad');
const adminController = require('./adminController');

app.post('/admin/register', adminValidator.registerUser,adminController.registerUser)
app.post('/admin/login', adminValidator.login,adminController.login)








