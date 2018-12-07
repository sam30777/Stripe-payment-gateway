






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

            console.log('user details->',user);
           
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
        let card_id = payload.card_id ;
        let sql = 'SELECT card_db_id , customer_stripe_id , card_stripe_id from user_card_details WHERE card_db_id = ? AND is_deleted = 0' ;
        let params = [card_id];
        let cardDetails = await mysql.executeQueryPromisified(sql,params);

        if(cardDetails && cardDetails.length > 0) {
            let book_id = payload.book_id ;
            let quantity = payload.quantity ;
            let promo_percent ; 
            if(payload.promo_percent ){
                promo_percent = payload.promo_percent ;
            }

            console.log('card details->',cardDetails) ;
            let transaction = await makeTransaction(user_id,cardDetails[0],book_id,quantity,promo_percent);
            return transaction ;
        } else {
            return responses.getResponseWithMessage(constant.errorMessage.no_card_found,constant.codes.not_found)
        }
    } catch(error){
        throw error ;
    }
}


async function makeTransaction(user_id ,cardDetails , book_id ,quantity,promo_percent){
    try {
        let conn = await mysql.returnConnectionFromPool();

        await mysql.beginTransactionPromisified(conn);
        console.log('after begin')
        let sql  = 'SELECT * FROM books WHERE book_id = ? for update' ;
        let params = [book_id] ;

        let books = await mysql.executeTransanctionQueryPromisified(conn,sql,params);
        console.log('books->',books);
        if(books[0].no_in_stock >= quantity) {
            let stockLeft = books[0].no_in_stock - quantity ;
            console.log('stock left',stockLeft);
            sql = 'UPDATE books SET no_in_stock = ?  WHERE book_id = ?' ;
            params = [stockLeft,book_id];

            let updatedBooks = await mysql.executeTransanctionQueryPromisified(conn,sql,params);
            console.log('updatedBooks->',updatedBooks);

            if(updatedBooks &&  updatedBooks.affectedRows) {

                 sql = 'SELECT stripe_account , currency FROM author_stripe_details WHERE author_id = ?' ;
                 params = [books[0].author_id] ;

                 let authorAccountDetails = await mysql.executeTransanctionQueryPromisified(conn,sql,params);
                 console.log('author details->',authorAccountDetails);

                
                 let amount = quantity * books[0].book_price ;
    
                 let promo_amount = 0 ; 
                 
                 if(promo_percent){
                     promo_amount =  (promo_percent / 100) * amount ;
                 }

                 amount = amount - promo_amount ;
            
                 let auhtorPriceForEackBook = (books[0].author_percentage / 100) * books[0].book_price ;
                 auhtorPriceForEackBook = Math.round(auhtorPriceForEackBook,2);
                 let auhtorPriceOverall = auhtorPriceForEackBook * quantity ;

                 console.log('author price->',auhtorPriceOverall)
                 console.log('amount->',amount);
        
                let totalAmount = amount - (0.29 * amount); // stripe tax

                 if(auhtorPriceOverall  < totalAmount ) {
                    auhtorPriceOverall = auhtorPriceOverall * 100 ;
                    amount = amount * 100 ;
                    if(amount < 50) amount = 50
                    let payment  = await createChargeStripe(conn,amount,auhtorPriceOverall,cardDetails.customer_stripe_id,authorAccountDetails[0].stripe_account,authorAccountDetails[0].currency)
                    if(payment.paid) {
                        sql = 'INSERT INTO order (book_id , amount , author_id , customer_id) VALUES(?,?,?,?)';
                        params = [book_id,amount,books[0].author_id,user_id]
                        let order = await mysql.executeTransanctionQueryPromisified(conn,sql,params);

                        if(order.insertId){
                            await mysql.commitPromisified(conn);
                            return responses.getResponseWithMessage(constant.successMessages.booking_successfull,constant.codes.success,{});
                        } else {
                            await mysql.rolBackPromisified(conn);
                            return responses.getResponseWithMessage(constant.errorMessage.transaction_failed,constant.codes.transaction_failed);
                        }
                       
                    } else {
                        await mysql.rolBackPromisified(conn);
                        return responses.getResponseWithMessage(constant.errorMessage.transaction_failed,constant.codes.transaction_failed);
                    }
                } else {
                    let newAuthorAmount = (auhtorPriceOverall - amount)  + (0.29 * amount) ;
                    let payment = await createChargeStripe(conn,amount,amount,cardDetails.customer_stripe_id,authorAccountDetails[0].stripe_account,authorAccountDetails[0].currency);

                    if(payment.paid) {
                        sql = 'INSERT INTO order (book_id , amount , author_id , customer_id) VALUES(?,?,?,?)';
                        params = [book_id,amount,books[0].author_id,user_id]
                        let order = await mysql.executeTransanctionQueryPromisified(conn,sql,params);

                        if(order.insertId){
                            await mysql.commitPromisified(conn);
                        } else {
                            await mysql.rolBackPromisified(conn);
                            return responses.getResponseWithMessage(constant.errorMessage.transaction_failed,constant.codes.transaction_failed);
                        }

                        try {
                            let transferedPayment = await createTransferStripe(newAuthorAmount,authorAccountDetails[0].stripe_account,authorAccountDetails[0].currency);
                            if(transferedPayment) {

                            } else {
                                await insertPendingAmounts(authorAccountDetails[0].stripe_account,author_stripe_account,amount,order.insertId,);
                            }
                        } catch (error){
                            return responses.getResponseWithMessage(constant.successMessages.booking_successfull,constant.codes.success,{});
                        }
                    }
                }
                

            } else {
                await mysql.rolBackPromisified(conn);
                return responses.getResponseWithMessage(constant.errorMessage.transaction_failed,constant.codes.transaction_failed);
            }
        }
        else {
            await mysql.rolBackPromisified(conn);
            console.log('after roll back')
            return responses.getResponseWithMessage(constant.errorMessage.out_of_stock,constant.codes.out_of_stock,{});
            
        }


    } catch (error){
        throw error 
    }
}



// function makeTransaction(cardDetails , book_id ,quantity,promo_percent) {
//     return new Promise((resolve,reject)=>{
//         let sql ;
//         let params ;

//         connection.getConnection((error,conn)=>{
//             if(error){
//                 return reject(error);
//             }

//             conn.beginTransaction(function(err) {
//                 if (err) { return reject(error) }
    
//                 sql = 'SELECT * FROM books WHERE book_id = ? for update' ;
//                 params = [book_id];
                
//                 conn.query(sql,params,(err,bookDetails)=>{
//                     if(err){
//                         return conn.rollback(function() {
//                              return reject(err);
//                           });
//                     }


//                       sql = 'UPDATE books no_in_stock WHERE book_id = ?' ;
//                       params = [book_id];
//                           conn.query(sql,params,(error,updated)=>{
//                                       if(error) {
//                                             return conn.rollback(function() {
//                                                  return reject(error);
//                                               });
//                                         }
//                                         if(!updated.affectedRows){
//                                             return conn.rollback(function() {
//                                                 return reject(responses.getResponseWithMessage(constant.errorMessage.payment_failed,constant.codes.payment_failed));
//                                               });
//                                         }
//                                         return resolve(responses.getResponseWithMessage(constant.successMessages.booking_successfull,constant.codes.success));
//                                     })

//                     console.log("book details->",bookDetails);
    
                   
    
//                     if(book.no_in_stock < quantity) {
//                         return conn.rollback(function() {
//                             return resolve(responses.getResponseWithMessage(constant.errorMessage.out_of_stock,constant.codes.out_of_stock));
//                           });
//                     }
                   
//                     sql = 'SELECT stripe_account , currency FROM author_stripe_details WHERE author_id = ?' ;
//                     params = [book.author_id] ;
    
//                     conn.query(sql,params,(error,authorAccountDetails)=>{
//                         if(error) {
//                             return conn.rollback(function() {
//                                 return reject(error) 
//                               });
//                         }



//                         console.log('author account ->',authorAccountDetails);

//                         let amount = quantity * book.book_price ;
    
//                         let promo_amount = 0 ; 
                        
//                         if(promo_percent){
//                             promo_amount =  (promo_percent / 100) * amount ;
//                         }
                        
//                         let auhtorPriceForEackBook = (book.author_percentage / 100) * book.book_price ;
//                         auhtorPriceForEackBook = Math.round(auhtorPriceForEackBook,2);
//                         let auhtorPriceOverall = auhtorPriceForEackBook * quantity ;
//                         let adminAmount = amount - auhtorPriceOverall ;
//                         adminAmount = adminAmount - promo_amount ;
//                         let totalAmount = adminAmount + auhtorPriceOverall ;
//                         console.log('totalAmount->',totalAmount);
//                         console.log('auhtorPriceOverall->',auhtorPriceOverall);
    
//                         if(auhtorPriceOverall  < totalAmount) {
//                             auhtorPriceOverall = auhtorPriceOverall * 100 ;
//                             amount = amount * 100 ;
//                             stripe.charges.create({
//                                 amount     :   amount,
//                                 currency   :   authorAccountDetails[0].currency  ,
//                                 customer     :   cardDetails.customer_stripe_id , // obtained with Stripe.js
//                                 destination : {
//                                     amount : Math.round(auhtorPriceOverall),
//                                     account : authorAccountDetails[0].stripe_account 
//                                     }  
//                               }, function(err, charge) {
//                                 if(err){
//                                     return conn.rollback(function() {
//                                         return reject(err);
//                                       });
//                                 }
//                                 if(charge) {
                                    
//                                 }
//                               });
            
//                         } else {
//                             let newAmmount = auhtorPriceOverall - totalAmount ;
                            
//                             stripe.charges.create({
//                                 amount      :   amount,
//                                 currency    :   authorAccountDetails[0].currency  ,
//                                 source      :   cardDetails.card_stripe_id , // obtained with Stripe.js
//                                 destination : {
//                                     amount : Math.round(amount),
//                                     account : authorAccountDetails[0].stripe_account 
//                                     } 
//                               }, function(err, charge) {
//                                 if(err){
//                                     return connection.rollback(function() {
//                                         return reject(err);
//                                       });
//                                 }
//                                 if(charge) {
//                                     sql = 'UPDATE books no_in_stock WHERE book_id = ?' ;
//                                     params = [book_id];
    
//                                     conn.query(sql,params,(error,updated)=>{
//                                         if(error) {
//                                             return conn.rollback(function() {
//                                                  return reject(error);
//                                               });
//                                         }
//                                         if(!updated.affectedRows){
//                                             return conn.rollback(function() {
//                                                 return reject(responses.getResponseWithMessage(constant.errorMessage.payment_failed,constant.codes.payment_failed));
//                                               });
//                                         }
//                                         return resolve(responses.getResponseWithMessage(constant.successMessages.booking_successfull,constant.codes.success));
//                                     })
//                                 }
//                               });
    
//                         }
//                     })
                
//                 })
//               });
//         })
//         })

        
// }

function insertPendingAmounts(author_stripe_account,amount,order_id) {
    return new Promise((resolve,reject)=>{
        sql = 'INSER INTO pending_amounts (author_stripe_account,amount,order_id) VALUES(?,?,?,?)' ;
        params = [author_stripe_account,amount,order_id];
        connection.query(sql,params,(error,result)=>{
            if(error){
                return reject(error);
            }
            return resolve(result);
        })
    })
}

function createTransferStripe(amount,stripe_account,currency) {
    return new Promise((resolve,reject)=>{
        stripe.transfers.create({
            amount: amount,
            currency: currency ,
            destination: stripe_account 
          }, function(err, transfer) {
               if(err){
                   return reject(err);
               }
               return resolve(transfer);
          });
    })
}

function createChargeStripe(conn,amount,auhtorPriceOverall,customer_stripe_id,stripe_account,currency) {
    return new Promise((resolve,reject)=>{

        stripe.charges.create({
            amount     :   amount,
            currency   :   currency  ,
            customer   :   customer_stripe_id , 
               destination : {  amount : Math.round(auhtorPriceOverall),
                account : stripe_account 
                }  
          }, function(err, charge) {
              console.log('err charge->',err,charge)
            if(err){
                return conn.rollback(function() {
                    return reject(err);
                  });
            }
            if(charge) {
                return resolve(charge)
            }
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
    addAccount ,
    buyBook
}

