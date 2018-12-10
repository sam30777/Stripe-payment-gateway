const responses      = require('./../common/responses');
const constant       = require('./../common/constant');
const stripeServices = require('./stripeServices');




const addCardAndCustomer =   async (req,res)=>{
    try {
         let user_id = req.user_id ;
        let payload = req.body ;
        let data = await stripeServices.addCardAndCustomer(user_id,payload);
        res.send(JSON.stringify(data));

    } catch(error){
        console.log('error while creating customer->',error)
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const editCardDetails   =  async (req,res)=>{
    try {
        let payload = req.body ;
        let data = await stripeServices.editCardDetails(payload);
         res.send(JSON.stringify(data));

    } catch(error){
        console.log('error while editing card->',error)
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));

    }
}

const deleteCard = async (req,res)=>{
    try {
        let payload = req.body ;
        let data    = await stripeServices.deleteCard(payload);
        res.send(JSON.stringify(data));

    } catch(error){
        console.log('error while deleting card->',error)
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const addAccount = async (req,res)=>{
    try {
        let payload = req.body ;
        let author_id = req.author_id ;
        let data    = await stripeServices.addAccount(author_id,payload);
        res.send(JSON.stringify(data));

    } catch(error){
        console.log('error while adding account->',error)
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const buyBook = async (req,res)=>{
    try {
        let payload = req.body ;
        let user_id = req.user_id ;
        let data    = await stripeServices.buyBook(user_id,payload);
        console.log('out side->',data)
        res.send(JSON.stringify(data));

    } catch(error){
        console.log('error while adding account->',error)
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const deleteAccount = async (req,res) => {
    try {
        
        let author_id = req.author_id ;
        let data = await stripeServices.deleteAccount(author_id);
        return data ; 
    } catch(error){
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const getCardInfo = async (req,res) => {
    try {
        let user_id = req.user_id ;
        let data = await stripeServices.getCardInfo(user_id);
        return data ; 
    } catch(error){
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const getAccountInfo = async (req,res) => {
    try {
        
        let author_id = req.author_id ;
        let data = await stripeServices.getAccountInfo(author_id);
        return data ; 
    } catch(error){
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}




module.exports = {
    buyBook ,
    addAccount ,
    deleteCard ,
    editCardDetails ,
    addCardAndCustomer ,
    getAccountInfo ,
    deleteAccount ,
    getCardInfo
}