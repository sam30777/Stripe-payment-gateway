
const responses     = require('./../common/responses');
const constant      = require('./../common/constant');
const token         = require('./../common/jwt')
const stripeValidator = require('./validator');

const stripe        = require('./stripe');


app.post('/user/addCardAndCustomer',stripeValidator.addCardAndCustomer,token.verifyAccessToken,async (req,res,next)=>{
    try {
         let user_id = req.user_id ;
        let payload = req.body ;
        let data = await stripe.addCardAndCustomer(user_id,payload);
        res.send(JSON.stringify(data));

    } catch(error){
        console.log('error while creating customer->',error)
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
})







app.post('/user/editCardDetails',stripeValidator.editCardDetails,token.verifyAccessToken,async (req,res)=>{
    try {
        let payload = req.body ;
        let data = await stripe.editCardDetails(payload);
         res.send(JSON.stringify(data));

    } catch(error){
        console.log('error while editing card->',error)
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));

    }
})

app.post('/user/deleteCard',stripeValidator.deleteCard , token.verifyAccessToken , async (req,res)=>{
    try {
        let payload = req.body ;
        let data    = await stripe.deleteCard(payload);
        res.send(JSON.stringify(data));

    } catch(error){
        console.log('error while deleting card->',error)
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
})

app.post('/author/addAccount',stripeValidator.addAccount,token.verfiyAuthorAccessToken,async (req,res)=>{
    try {
        let payload = req.body ;
        let author_id = req.author_id ;
        let data    = await stripe.addAccount(author_id,payload);
        res.send(JSON.stringify(data));

    } catch(error){
        console.log('error while adding account->',error)
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
})

app.post('/user/buyBook',stripeValidator.buyBook , token.verifyAccessToken , async (req,res)=>{
    try {
        let payload = req.body ;
        let user_id = req.user_id ;
        let data    = await stripe.addAccount(author_id,payload);
        res.send(JSON.stringify(data));

    } catch(error){
        console.log('error while adding account->',error)
        res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
})