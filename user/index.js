
const userValidator  = require('./validator');
const userController = require('./userController');

app.post('/user/register',userValidator.registerUser,userController.registerUser)
app.post('/user/login',userValidator.login,userController.login)








