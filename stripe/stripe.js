






const mysql         = require('./../database/mysql');

const constant      = require('./../common/constant');

const stripe        = require("stripe")(constant.stripe.stripe_secret_key);



const  addCardAndCustomer = async function(user_id,payload) {
    try {

        let cardDetails = await addcardToStripe(payload);

        console.log('card details->',cardDetails);


        // let sql = 'SELECT email,user_id from users WHERE user_id = ?';
        // let params = [user_id];

        // let userDetails = await mysql.executeQueryPromisified(sql,params);

        // console.log('user details->',userDetails);

        // if(userDetails && userDetails.length > 0){
        //     let customer = await addCustomerToStripe(userDetails[0]);
        //     console.log('customer is this->',customer);

        //     let sql = 'UPDATE users SET stripe_account_number =?  '

        // }

       

    } catch(error){
        throw error ;
    }
}


function addcardToStripe(payload){
    return new Promise((resolve,reject)=>{
        let number = payload.number ;
        let exp_month = payload.exp_month ;
        let exp_year = payload.exp_year ;
        let cvc = payload.cvc ;

        stripe.tokens.create({
            card: {
              number: number,
              exp_month: exp_month,
              exp_year: exp_year,
              cvc: cvc
            }
          }, function(err, token) {
               if(err){
                   console.log("number->",err);
                   reject(err)
               }
               resolve(token);
          });
    })
}

function addCustomerToStripePromisified(userDetails){
    return new Promise((resolve,reject)=>{
        stripe.customers.create({
            description: 'Customer is only for buying book',
            email :   userDetails.email ,
          }, function(err, customer) {
            console.log('error result->',err,customer);
            if(err){
                return reject(err);
            }
            return resolve(customer);
          });
    })
}

module.exports = {
    addCardAndCustomer
}