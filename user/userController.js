
const user          = require('./userServices');
const responses     = require('./../common/responses');
const constant      = require('./../common/constant');



const registerUser =  async (req,res)=>{
    try {  
        let payloadData = req.body ;
        let data = await  user.registerUser(payloadData);
        
        res.send(JSON.stringify(data));

    } catch (error) {
        console.log('error while register->',error);
         res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const  login =  async (req,res,)=>{
    try {
        let payload = req.body ;

        let data = await user.login(payload) ;

        res.send(JSON.stringify(data));

    } catch(error) {
        console.log('error while register->',error);
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

module.exports = {
    registerUser , 
    login
}