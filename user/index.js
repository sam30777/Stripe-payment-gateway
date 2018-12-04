
const userValidator = require('./validator');
const user          = require('./user');
const responses     = require('./../common/responses');
const constant      = require('./../common/constant');

app.post('/user/register',userValidator.registerUser,async (req,res)=>{
    try {  
        let payloadData = req.body ;
        let data = await  user.registerUser(payloadData);
        
        res.send(JSON.stringify(data));

    } catch (error) {
        console.log('error while register->',error);
         res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
})

app.post('/user/login',userValidator.login, async (req,res,)=>{
    try {
        let payload = req.body ;

        let data = await user.login(payload) ;

    } catch(error) {
        console.log('error while register->',error);
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
})





