
const userValidator = require('./validator');
const user          = require('./user');
const responses     = require('./../common/responses')
app.post('/user/register',userValidator.registerUser,async (req,res)=>{
    try {  
        console.log("req==>",req.body);
        let payloadData = req.body ;
        let registeredUser = await  user.registerUser(payloadData);
        
        log('Registered user ==>',registeredUser);

        responses.sendSuccess(res,registeredUser);

    } catch (error) {
        log.error('Error occured while register',error);
        responses.sendError(res);
    }
})




