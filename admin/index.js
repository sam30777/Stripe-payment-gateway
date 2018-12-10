const adminValidator  = require('./ad');
const adminController = require('./adminController');
const token           = require('./../common/jwt');
app.post('/admin/register', adminValidator.registerUser,adminController.registerUser)
app.post('/admin/login', adminValidator.login,adminController.login)

app.get('admin/getPendingAmountList',token.verifyAdminAccessToken,adminController.listPendingAmounts);


