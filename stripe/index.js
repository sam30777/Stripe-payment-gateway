
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
    } catch(error){
        console.log('error while creating customer->',error)
    }
})