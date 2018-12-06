






const mysql        = require('./../database/mysql');

const constant      = require('./../common/constant');

const stripe        = require("stripe")(constant.stripe.stripe_secret_key);

const responses     = require('./../common/responses');


const  addCardAndCustomer = async function(user_id,payload) {
    try {   
        let sql = 'SELECT email , user_id  , stripe_account_number from users WHERE user_id = ?';
        let params = [user_id];

        let userDetails = await mysql.executeQueryPromisified(sql,params);

        console.log('user details->',userDetails);

         if(userDetails && userDetails.length > 0){

            let user = userDetails[0];
            let cardDetails ;
           
            if(user.stripe_account_number == null) {
                let customer = await addCustomerToStripePromisified( payload.stripe_token,userDetails[0]);

                sql = 'UPDATE users SET stripe_account_number = ? WHERE user_id = ?'
                params  = [customer.id,user_id];

                let updatedUser = await mysql.executeQueryPromisified(sql,params);
                
                if(!updatedUser.affectedRows) {
                    return    responses.getResponseWithMessage(constant.errorMessage.uable_to_add_customer,constant.codes.uable_to_add_customer);
                }

              cardDetails =   customer.sources.data[0];
              sql = 'INSERT INTO  user_card_details (card_stripe_id,last_four_digits,customer_stripe_id,user_id) VALUES(?,?,?,?)  '
              params = [cardDetails.id , cardDetails.last4 , customer.id , user_id ]
              
        } else {
            cardDetails = await addCardToExistingCustomer(user.stripe_account_number,payload.stripe_token);
            if(cardDetails) {
                sql = 'INSERT INTO  user_card_details (card_stripe_id,last_four_digits,customer_stripe_id,user_id) VALUES(?,?,?,?)  '
                params = [  cardDetails.id, cardDetails.last4 , user.stripe_account_number , user_id];
            } else {
                return   responses.getResponseWithMessage(constant.errorMessage.uable_to_add_card,constant.codes.uable_to_add_card);
            }
        } 

        let insertedCardDetails = await mysql.executeQueryPromisified(sql,params);
              console.log('inserted card details->',insertedCardDetails);
              if(insertedCardDetails.insertId) {
              return   responses.getResponseWithMessage(constant.successMessages.card_added_successfully,constant.codes.success);
              } else { 
                return   responses.getResponseWithMessage(constant.errorMessage.uable_to_add_card,constant.codes.uable_to_add_card);
              }

     }   else {
        return   responses.getResponseWithMessage(constant.errorMessage.user_does_not_exits,constant.codes.user_does_not_exits);
      }


    } catch(error){
        throw error ;
    }
}



const editCardDetails = async function(payload) {
    try {
       
        let card_id  = payload.card_id ;
        
        let sql ='SELECT * from user_card_details WHERE card_db_id = ? '
        let params = [card_id];

        let existingCards = await mysql.executeQueryPromisified(sql,params);

        if(!existingCards || existingCards.length <= 0){
           return  responses.getResponseWithMessage(constant.errorMessage.card_not_found,constant.codes.not_found);
        }  

        delete payload.card_id 

        let editedCardDetails = await editExistingCardStripe(existingCards[0],payload);
        if(!editedCardDetails) {
            return  responses.getResponseWithMessage(constant.errorMessage.unable_to_edit_card,constant.codes.not_found);
        }

         return  responses.getResponseWithMessage(constant.successMessages.card_details_updated,constant.codes.success,{});

    } catch(error){
       throw error ;
    }
}


const deleteCard = async function(payload){
    try {
        let card_id = payload.card_id ;
        let sql ='SELECT * from user_card_details WHERE card_db_id = ? AND is_deleted = ? '
        let params = [card_id,0];

        let existingCards = await mysql.executeQueryPromisified(sql,params);

        if(!existingCards || existingCards.length <= 0){
           return  responses.getResponseWithMessage(constant.errorMessage.card_not_found,constant.codes.not_found);
        }  

        let deletedCard = await deleteCardStripe(existingCards[0]);

        if(deletedCard.deleted){

            sql = 'UPDATE user_card_details SET is_deleted = 1 WHERE card_db_id = ?'
            params[card_id]

            let updatedCardDetails = await mysql.executeQueryPromisified(sql,params);

            if(updatedCardDetails && updatedCardDetails.affectedRows){
                return  responses.getResponseWithMessage(constant.successMessages.card_deleted,constant.codes.success);
            }
            else {
                return responses.getResponseWithMessage(constant.errorMessage.unable_to_delete_card,constant.codes.unable_to_delete_card,{})
            }    
        }else {
            return responses.getResponseWithMessage(constant.errorMessage.unable_to_delete_card,constant.codes.unable_to_delete_card,{})
        }

 
    } catch (error){
        throw error ;
    }
}

const addAccount = async function(author_id,payload){
    try {

        let sql = 'SELECT * FROM authors WHERE author_id = ?' ;
        let params = [author_id] ;
        
        let existingUser = await mysql.executeQueryPromisified(sql,params);
        console.log('existing user->',existingUser);
        if(existingUser && existingUser.length > 0) {
            console.log('payload dtaa->',payload);
     let firstName                    = payload.first_name;
    let lastName                     = payload.last_name;
    let dobDay                       = payload.dob_day;
    let dobMonth                     = payload.dob_month;
    let dobYear                      = payload.dob_year;
    let bankAccountCurrency          = payload.bank_account_currency;
    let bankAccountNumber            = payload.bank_account_number;
    let routingNumber                = payload.routing_number;
    let bankAccountType              = payload.bank_account_type;
    let ip                           = payload.ip;
    let businessName                 = payload.business_name;
    let businessTaxId                = payload.business_tax_id;
    let ssn                          = payload.ssn;
    let stripeAccount;
    let accountDetails;

     stripeAccount = {
        object          : constant.stripeObject,
        country         : 'US',
        currency        : bankAccountCurrency,
        account_number  : bankAccountNumber
      };

      if(routingNumber){
        stripeAccount.routing_number = routingNumber ;
      }

      let legalEntity = {
        first_name   : firstName,
        last_name    : lastName,
        type         : bankAccountType,
        dob : {
          day     : dobDay,
          month   : dobMonth,
          year    : dobYear
        }
      };

      if(ssn){
        legalEntity.ssn_last_4  = ssn.slice(ssn.toString().length-4 ,ssn.toString().length);
      }
      if(businessName){
        legalEntity.business_name   = businessName;
      }
      if(businessTaxId){
        legalEntity.business_tax_id = businessTaxId;
      }

      let finalStripeObject = {
        type            : 'standard' ,
        email           : existingUser[0].email ,
        // tos_acceptance  : {
        //   date          : Math.floor(Date.now() / 1000),
        //   ip            : '133.23.58.47'
        // },
        metadata : {
          author_id   : author_id
        },
        debit_negative_balances : true,
        legal_entity      : legalEntity,
        external_account  : stripeAccount
      }
       accountDetails =  await  createAccountStripe(finalStripeObject);

     if(accountDetails){
        let sql = 'INSERT INTO author_stripe_details (stripe_account,author_id,currency) VALUES(?,?,?)';
        let params = [accountDetails.id,author_id,bankAccountCurrency];
        let insertedAccountDetails = await mysql.executeQueryPromisified(sql,params) ;
        if(insertedAccountDetails.insertId){
            return responses.getResponseWithMessage(constant.successMessages.account_details_added,constant.codes.success)
        }
     }else{
        return responses.getResponseWithMessage(constant.errorMessage.unable_to_add_account,constant.codes.unable_to_add_account)
     }
     
        } else {
            return responses.getResponseWithMessage(constant.errorMessage.author_doesnot_exists,constant.codes.author_doesnot_exists)
        }

    
    
    
    } catch(error){
        throw error ;
    }
}

const buyBook = async function(user_id,payload){
    try {
        let sql = 'SELECT card_id , customer_stripe_id , card_stripe_id from user_card_details WHERE user_id = ?' ;
        let params = [user_id];
        let cardDetails = await mysql.executeQueryPromisified(sql,params);

        if(cardDetails && cardDetails.length > 0) {

            let book_id = payload.book_id ;
            let quantity = payload.quantity ;
            let transaction = await makeTransaction(cardDetails,book_id,quantity);
            // sql = 'SELECT books.* , author_stripe_details.* FROM books INNER JOIN author_stripe_details ON books.author_id = author_stripe_details.author_id WHERE book_id = book_id' ;
            // sql = 'SELECT * FROM books WHERE book_id = ?'
            // params[book_id];

            // let bookDetails = await mysql.executeQueryPromisified(sql,params);

            // if(bookDetails && bookDetails.length > 0){
            //     sql  = 'SELECT * from author_stripe_details WHERE auhor_id = ?' ;
            //     params[bookDetails[0].author_id];

            //     let authorDetails = await mysql.executeQueryPromisified(sql,params);
            //    
            // } else {
            //     return responses.getResponseWithMessage(constant.errorMessage.no_book_found,constant.codes.not_found)
            // }
        } else {
            return responses.getResponseWithMessage(constant.errorMessage.no_card_found,constant.codes.not_found)
        }
    } catch(error){
        throw error ;
    }
}


function makeTransaction(cardDetails , book_id ,quantity) {
    return new Promise((resolve,reject)=>{
        let sql ;
        let params ;
        connection.beginTransaction(function(err) {
            if (err) { throw err; }

            sql = 'SELECT * FROM books WHERE book_id = ? for update' ;
            params = [book_id];

            connection.query(sql,params,(err,bookDetails)=>{
                if(err){
                    return connection.rollback(function() {
                        throw err;
                      });
                }

                let book = bookDetails[0];

                





                if(book.no_in_stock < quantity) {
                    return connection.rollback(function() {
                        throw responses.getResponseWithMessage(constant.errorMessage.out_of_stock,constant.codes.out_of_stock);
                      });
                }
                let amount = quantity * book.book_price ;
                let auhtorPriceForEackBook = book.author_percentage / 100 * book.book_price ;
                auhtorPriceForEackBook = Math.round(auhtorPriceForEackBook,2);
                let auhtorPriceOverall = auhtorPriceForEackBook * quantity ;
                if(auhtorPriceOverall  < amount) {
                    auhtorPriceOverall = auhtorPriceOverall * 100 ;
                    amount = amount * 100 ;
                    stripe.charges.create({
                        amount: amount,
                        currency: "usd",
                        source: "tok_amex", // obtained with Stripe.js
                        description: "Charge for jenny.rosen@example.com"
                      }, function(err, charge) {
                        // asynchronously called
                      });
        
        
                }

            
            })


            

            connection.query('INSERT INTO posts SET title=?', title, function (error, results, fields) {
              if (error) {
                return connection.rollback(function() {
                  throw error;
                });
              }
           
              var log = 'Post ' + results.insertId + ' added';
           
              connection.query('INSERT INTO log SET data=?', log, function (error, results, fields) {
                if (error) {
                  return connection.rollback(function() {
                    throw error;
                  });
                }
                connection.commit(function(err) {
                  if (err) {
                    return connection.rollback(function() {
                      throw err;
                    });
                  }
                  console.log('success!');
                });
              });
            });
          });
    })
}



function createAccountStripe(finalStripeObject) {
    return new Promise((resolve,reject)=>{
        stripe.accounts.create(
            finalStripeObject
            , function(err, account) {
                if(err) return reject(err);
                else resolve(account);
          });
    })
}

function deleteCardStripe(existingCard){ 
    return new Promise((resolve,reject)=>{
        stripe.customers.deleteCard(
            existingCard.customer_stripe_id ,
            existingCard.card_stripe_id ,
            function(err, confirmation) {
                console.log('deleted card->',err,confirmation);
                if(err) {
                    return reject(err);
                } else  {
                    return resolve(confirmation);
                }
            }
          );
    })
}


function editExistingCardStripe(existingCard,editObject) {
    return new Promise((resolve,reject)=>{
        stripe.customers.updateCard(
            existingCard.customer_stripe_id,
            existingCard.card_stripe_id ,
            editObject ,
            function(err, card) {
                console.log('edited card->',err,card);
            if(err) {
                return reject(err);
            } else  {
                return resolve(card);
            }
            }
          );
    })
}




function addCardToExistingCustomer(customerAccount,source){
    return new Promise((resolve,reject)=>{
        stripe.customers.createSource(
         customerAccount ,
        { source: source },
        function(err, card) {
            console.log('adding card->',err,card);
            if(err) {
                return reject(err);
            } else  {
                return resolve(card);
            }
         }
        );
    })
}




function addCustomerToStripePromisified(stripe_token,userDetails){
    return new Promise((resolve,reject)=>{
        stripe.customers.create({
            description: 'Customer is only for buying book',
            source : stripe_token ,
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
    addCardAndCustomer ,
    editCardDetails ,
    deleteCard ,
    addAccount
}

