
const user          = require('./userServices');
const responses     = require('./../common/responses');
const constant      = require('./../common/constant');

const adminServices = require('./adminServices');

const registerUser =  async (req,res)=>{
    try {  
        let payloadData = req.body ;
        let data = await  adminServices.registerUser(payloadData);
        
        res.send(JSON.stringify(data));

    } catch (error) {
        console.log('error while register->',error);
         res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const  login =  async (req,res,)=>{
    try {
        let payload = req.body ;

        let data = await adminServices.login(payload) ;

        res.send(JSON.stringify(data));

    } catch(error) {
        console.log('error while register->',error);
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const listPendingAmounts = async(req,res) =>{
    try {
    
        let data = await adminServices.listPendingAmounts() ;

        res.send(JSON.stringify(data));

    } catch(error) {
        console.log('error while register->',error);
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const bulkPayPendingAmounts = async (req,res) => {
    try {
    
        let data = await adminServices.listPendingAmounts() ;

        res.send(JSON.stringify(data));

    } catch(error) {
        console.log('error while register->',error);
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}




module.exports = {
    registerUser , 
    login ,
    listPendingAmounts
}