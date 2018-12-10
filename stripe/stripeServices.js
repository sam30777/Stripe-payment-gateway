const mysql = require('./../database/mysql');
const constant = require('./../common/constant');
const stripe = require("stripe")(constant.stripe.stripe_secret_key);
const responses = require('./../common/responses');


const addCardAndCustomer = async function (user_id, payload) {
    try {
        let sql = 'SELECT email , user_id  , stripe_account_number from users WHERE user_id = ?';
        let params = [user_id];

        let userDetails = await mysql.executeQueryPromisified(sql, params);

        console.log('user details->', userDetails);

        if (userDetails && userDetails.length > 0) {

            let user = userDetails[0];
            let cardDetails;

            console.log('user details->', user);

            if (user.stripe_account_number == null) {
                let customer = await addCustomerToStripePromisified(payload.stripe_token, userDetails[0]);

                sql = 'UPDATE users SET stripe_account_number = ? WHERE user_id = ?'
                params = [customer.id, user_id];

                let updatedUser = await mysql.executeQueryPromisified(sql, params);

                if (!updatedUser.affectedRows) {
                    return responses.getResponseWithMessage(constant.errorMessage.uable_to_add_customer, constant.codes.uable_to_add_customer);
                }

                cardDetails = customer.sources.data[0];
                sql = 'INSERT INTO  user_card_details (card_stripe_id,last_four_digits,customer_stripe_id,user_id) VALUES(?,?,?,?)  '
                params = [cardDetails.id, cardDetails.last4, customer.id, user_id]

            } else {
                cardDetails = await addCardToExistingCustomer(user.stripe_account_number, payload.stripe_token);
                if (cardDetails) {
                    sql = 'INSERT INTO  user_card_details (card_stripe_id,last_four_digits,customer_stripe_id,user_id) VALUES(?,?,?,?)  '
                    params = [cardDetails.id, cardDetails.last4, user.stripe_account_number, user_id];
                } else {
                    return responses.getResponseWithMessage(constant.errorMessage.uable_to_add_card, constant.codes.uable_to_add_card);
                }
            }

            let insertedCardDetails = await mysql.executeQueryPromisified(sql, params);
            console.log('inserted card details->', insertedCardDetails);
            if (insertedCardDetails.insertId) {
                return responses.getResponseWithMessage(constant.successMessages.card_added_successfully, constant.codes.success);
            } else {
                return responses.getResponseWithMessage(constant.errorMessage.uable_to_add_card, constant.codes.uable_to_add_card);
            }

        } else {
            return responses.getResponseWithMessage(constant.errorMessage.user_does_not_exits, constant.codes.user_does_not_exits);
        }


    } catch (error) {
        throw error;
    }
}



const editCardDetails = async function (payload) {
    try {

        let card_id = payload.card_id;

        let sql = 'SELECT * from user_card_details WHERE card_db_id = ? '
        let params = [card_id];

        let existingCards = await mysql.executeQueryPromisified(sql, params);

        if (!existingCards || existingCards.length <= 0) {
            return responses.getResponseWithMessage(constant.errorMessage.card_not_found, constant.codes.not_found);
        }

        delete payload.card_id

        let editedCardDetails = await editExistingCardStripe(existingCards[0], payload);
        if (!editedCardDetails) {
            return responses.getResponseWithMessage(constant.errorMessage.unable_to_edit_card, constant.codes.not_found);
        }

        return responses.getResponseWithMessage(constant.successMessages.card_details_updated, constant.codes.success, {});

    } catch (error) {
        throw error;
    }
}


const deleteCard = async function (payload) {
    try {
        let card_id = payload.card_id;
        let sql = 'SELECT * from user_card_details WHERE card_db_id = ? AND is_deleted = ? '
        let params = [card_id, 0];

        let existingCards = await mysql.executeQueryPromisified(sql, params);

        if (!existingCards || existingCards.length <= 0) {
            return responses.getResponseWithMessage(constant.errorMessage.card_not_found, constant.codes.not_found);
        }

        let deletedCard = await deleteCardStripe(existingCards[0]);

        if (deletedCard.deleted) {

            sql = 'UPDATE user_card_details SET is_deleted = 1 WHERE card_db_id = ?'
            params[card_id]

            let updatedCardDetails = await mysql.executeQueryPromisified(sql, params);

            if (updatedCardDetails && updatedCardDetails.affectedRows) {
                return responses.getResponseWithMessage(constant.successMessages.card_deleted, constant.codes.success);
            } else {
                return responses.getResponseWithMessage(constant.errorMessage.unable_to_delete_card, constant.codes.unable_to_delete_card, {})
            }
        } else {
            return responses.getResponseWithMessage(constant.errorMessage.unable_to_delete_card, constant.codes.unable_to_delete_card, {})
        }


    } catch (error) {
        throw error;
    }
}

const addAccount = async function (author_id, payload) {
    try {

        let sql = 'SELECT * FROM authors WHERE author_id = ?';
        let params = [author_id];

        let existingUser = await mysql.executeQueryPromisified(sql, params);
        console.log('existing user->', existingUser);
        if (existingUser && existingUser.length > 0) {
            console.log('payload dtaa->', payload);
            let firstName = payload.first_name;
            let lastName = payload.last_name;
            let dobDay = payload.dob_day;
            let dobMonth = payload.dob_month;
            let dobYear = payload.dob_year;
            let bankAccountCurrency = payload.bank_account_currency;
            let bankAccountNumber = payload.bank_account_number;
            let routingNumber = payload.routing_number;
            let bankAccountType = payload.bank_account_type;
            let ip = payload.ip;
            let businessName = payload.business_name;
            let businessTaxId = payload.business_tax_id;
            let ssn = payload.ssn;
            let stripeAccount;
            let accountDetails;

            stripeAccount = {
                object: constant.stripeObject,
                country: 'US',
                currency: bankAccountCurrency,
                account_number: bankAccountNumber
            };

            if (routingNumber) {
                stripeAccount.routing_number = routingNumber;
            }
            getCardInfo

            let legalEntity = {
                first_name: firstName,
                last_name: lastName,
                type: bankAccountType,
                dob: {
                    day: dobDay,
                    month: dobMonth,
                    year: dobYear
                }
            };

            if (ssn) {
                legalEntity.ssn_last_4 = ssn.slice(ssn.toString().length - 4, ssn.toString().length);
            }
            if (businessName) {
                legalEntity.business_name = businessName;
            }
            if (businessTaxId) {
                legalEntity.business_tax_id = businessTaxId;
            }

            let finalStripeObject = {
                type: 'standard',
                email: existingUser[0].email,
                // tos_acceptance  : {
                //   date          : Math.floor(Date.now() / 1000),
                //   ip            : '133.23.58.47'
                // },
                metadata: {
                    author_id: author_id
                },
                debit_negative_balances: true,
                legal_entity: legalEntity,
                external_account: stripeAccount
            }
            accountDetails = await createAccountStripe(finalStripeObject);

            if (accountDetails) {
                let sql = 'INSERT INTO author_stripe_details (stripe_account,author_id,currency) VALUES(?,?,?)';
                let params = [accountDetails.id, author_id, bankAccountCurrency];
                let insertedAccountDetails = await mysql.executeQueryPromisified(sql, params);
                if (insertedAccountDetails.insertId) {
                    return responses.getResponseWithMessage(constant.successMessages.account_details_added, constant.codes.success)
                }
            } else {
                return responses.getResponseWithMessage(constant.errorMessage.unable_to_add_account, constant.codes.unable_to_add_account)
            }

        } else {
            return responses.getResponseWithMessage(constant.errorMessage.author_doesnot_exists, constant.codes.author_doesnot_exists)
        }




    } catch (error) {
        throw error;
    }
}
//Api for creating order of books 
const buyBook = async function (user_id, payload) {
    try {
        let card_id = payload.card_id;
        let sql = 'SELECT card_db_id , customer_stripe_id , card_stripe_id from user_card_details WHERE card_db_id = ? AND is_deleted = 0';
        let params = [card_id];
        let cardDetails = await mysql.executeQueryPromisified(sql, params);

        if (cardDetails && cardDetails.length > 0) {
            let book_id = payload.book_id;
            let quantity = payload.quantity;
            let promo_percent;
            if (payload.promo_percent) {
                promo_percent = payload.promo_percent;
            }

            console.log('card details->', cardDetails);

            // creating order using mysql transaction
            let transaction = await makeTransaction(user_id, cardDetails[0], book_id, quantity, promo_percent);
            return transaction;
        } else {
            return responses.getResponseWithMessage(constant.errorMessage.no_card_found, constant.codes.not_found)
        }
    } catch (error) {
        throw error;
    }
}

async function makeTransaction(user_id, cardDetails, book_id, quantity, promo_percent) {
    try {
        let conn = await mysql.returnConnectionFromPool();

        await mysql.beginTransactionPromisified(conn);

        let sql = 'SELECT * FROM books WHERE book_id = ? for update';
        let params = [book_id];

        let books = await mysql.executeTransanctionQueryPromisified(conn, sql, params);
        console.log('books->', books);

        if (books[0].no_in_stock >= quantity) {

            let stockLeft = books[0].no_in_stock - quantity;
            console.log('stock left', stockLeft);

            sql = 'UPDATE books SET no_in_stock = ?  WHERE book_id = ?';
            params = [stockLeft, book_id];

            let updatedBooks = await mysql.executeTransanctionQueryPromisified(conn, sql, params);
            console.log('updatedBooks->', updatedBooks);

            if (updatedBooks && updatedBooks.affectedRows) {

                sql = 'INSERT INTO order (book_id , amount , author_id , customer_id) VALUES(?,?,?,?)';
                params = [book_id, amount, books[0].author_id, user_id]

                let order = await mysql.executeTransanctionQueryPromisified(conn, sql, params);

                if (order.insertId) { 

                    sql = 'SELECT stripe_account , currency FROM author_stripe_details WHERE author_id = ?';
                    params = [books[0].author_id];

                    let authorAccountDetails = await mysql.executeTransanctionQueryPromisified(conn, sql, params);
                    console.log('author details->', authorAccountDetails);

                    let amount = quantity * books[0].book_price;
                    let promo_amount = 0 ;
                    if (promo_percent) {
                        promo_amount = (promo_percent / 100) * amount;
                    }
                    amount = amount - promo_amount;
                    let auhtorPriceForEackBook = (books[0].author_percentage / 100) * books[0].book_price;
                    let auhtorPriceOverall = auhtorPriceForEackBook * quantity;

                    console.log('author price->', auhtorPriceOverall)
                    console.log('amount->', amount);

                    let totalAmount = amount - (0.29 * amount); // stripe tax

                    // simple transaction when destination amount is less than amount

                    if (auhtorPriceOverall <= totalAmount) {
                        auhtorPriceOverall = auhtorPriceOverall * 100;
                        amount = amount * 100;
                        if (amount < 50) amount = 50
                        let payment = await createChargeStripe(conn, amount, auhtorPriceOverall, cardDetails.customer_stripe_id, authorAccountDetails[0].stripe_account, authorAccountDetails[0].currency)
                        if (payment.paid) {
                            await   mysql.commitPromisified(conn);
                            return  responses.getResponseWithMessage(constant.successMessages.booking_successfull, constant.codes.success, {});
                        } else {
                            await mysql.rolBackPromisified(conn);
                            return responses.getResponseWithMessage(constant.errorMessage.transaction_failed, constant.codes.transaction_failed);
                        }
                    }  else {
                        // when destination amount is greater thant actual amount 

                        // making payment of the actual amount and transfering that amount to destination

                        let newAuthorAmount = ((auhtorPriceOverall - amount) + (amount * 0.29)) ;
                        let autherAm        = amount - (amount * 0.29) ;

                        newAuthorAmount     = Math.round(newAuthorAmount,2) * 100 ;
                        autherAm            = Math.round(autherAm,2) * 100 ;

                        let payment = await createChargeStripe(conn, amount, autherAm , cardDetails.customer_stripe_id, authorAccountDetails[0].stripe_account, authorAccountDetails[0].currency);

                        //creating order when payment done
                        if (payment.paid) {

                            await mysql.commitPromisified(conn);

                            try {
                                let transferedPayment = await createTransferStripe(newAuthorAmount, authorAccountDetails[0].stripe_account, authorAccountDetails[0].currency);
                                if (transferedPayment) {
                                    return responses.getResponseWithMessage(constant.successMessages.booking_successfull, constant.codes.success, {});
                                } else {
                                    await insertPendingAmounts(authorAccountDetails[0].stripe_account, author_stripe_account, amount, order.insertId, );
                                    return responses.getResponseWithMessage(constant.successMessages.booking_successfull, constant.codes.success, {});
                                }
                            } catch (error) {
                                await insertPendingAmounts(authorAccountDetails[0].stripe_account, author_stripe_account, amount, order.insertId, );
                                return responses.getResponseWithMessage(constant.successMessages.booking_successfull, constant.codes.success, {});
                            }
                        } else {
                            await mysql.rolBackPromisified(conn);
                            return responses.getResponseWithMessage(constant.errorMessage.transaction_failed, constant.codes.transaction_failed);
                        }
                    }

                } else {
                    await mysql.rolBackPromisified(conn);
                    return responses.getResponseWithMessage(constant.errorMessage.transaction_failed, constant.codes.transaction_failed);
                }

            } else {
                await mysql.rolBackPromisified(conn);
                return responses.getResponseWithMessage(constant.errorMessage.transaction_failed, constant.codes.transaction_failed);
            }
        } else {
            await mysql.rolBackPromisified(conn);
          
            return responses.getResponseWithMessage(constant.errorMessage.out_of_stock, constant.codes.out_of_stock, {});

        }

    } catch (error) {
        throw error
    }
}


const deleteAccount = async (author_id) => {
    try {
        let sql = ' SELECT stripe_account  FROM author_stripe_details WHERE author_id = ?'
        let params = [author_id];

        let stripeAccount = await mysql.executeQueryPromisified(sql, params);

        if (stripeAccount && stripeAccount.length > 0) {
            let deletedAccount = await deleteAccountStripe(stripeAccount[0].stripe_account);
            if (deletedAccount.deleted) {
                sql = 'DELETE FROM author_stripe_details WHERE author_id = ?'
                params = [author_id];
                return responses.getResponseWithMessage(constant.successMessages.account_deleted, constant.codes.success);

            } else {
                return responses.getResponseWithMessage(constant.errorMessage.account_could_not_be_deleted, constant.codes.account_deletion_failed);
            }
        } else {
            return responses.getResponseWithMessage(constant.errorMessage.author_doesnot_exists, constant.codes.author_doesnot_exists);
        }

    } catch (error) {
        throw error;
    }

}


const deleteAccountStripe = async (stripe_account) => {
    return new Promise((resolve, reject) => {
        stripe.accounts.del(stripe_account, (err, resp) => {
            if (err) {
                return (reject(err));
            }
            return resolve(resp);
        })
    })
}

const getAccountInfo = async (author_id) => {
    try {
        let sql = ' SELECT stripe_account  FROM author_stripe_details WHERE author_id = ?'
        let params = [author_id];

        let stripeAccount = await mysql.executeQueryPromisified(sql, params);

        if (stripeAccount && stripeAccount.length > 0) {
            let accountInfo = await getStripeAccountInfo(stripeAccount[0].stripe_account);
            if (accountInfo) {
                let responseObj = {};

                if (accountInfo.business_logo) responseObj.business_logo = accountInfo.business_logo;
                if (accountInfo.business_name) responseObj.business_name = accountInfo.business_name;
                if (accountInfo.country) responseObj.country = accountInfo.country;
                if (accountInfo.display_name) responseObj.display_name = accountInfo.display_name;
                if (accountInfo.email) responseObj.email = accountInfo.email;

                return responses.getResponseWithMessage(constant.successMessages.success, constant.codes.success, responseObj);

            } else {
                return responses.getResponseWithMessage(constant.errorMessage.author_doesnot_exists, constant.codes.author_doesnot_exists);
            }
        } else {
            return responses.getResponseWithMessage(constant.errorMessage.author_doesnot_exists, constant.codes.author_doesnot_exists);
        }

    } catch (error) {
        throw error;
    }
}

const getCardInfo = async (user_id, payload) => {
    try {
        let card_id = payload.card_id;
        let sql = 'SELECT card_db_id , customer_stripe_id , card_stripe_id from user_card_details WHERE card_db_id = ? AND is_deleted = 0 '
        let params = [card_id];

        let cardInfo = await mysql.executeQueryPromisified(sql, params);

        if (cardInfo && cardInfo.length > 0) {
            let cardInfoFromStripe = await getCardInfoStripe(cardInfo[0].customer_stripe_id, cardInfo[0].card_stripe_id);
            if (cardInfoFromStripe) {
                let responseObj = {};
                if (cardInfoFromStripe.address_city) responseObj.address_city = cardInfoFromStripe.address_city;
                if (cardInfoFromStripe.address_country) responseObj.address_country = cardInfoFromStripe.address_country;
                if (cardInfoFromStripe.address_line1) responseObj.address_line1 = cardInfoFromStripe.address_line1;
                if (cardInfoFromStripe.country) responseObj.country = cardInfoFromStripe.country
                if (cardInfoFromStripe.brand) responseObj.brand = cardInfoFromStripe.brand
                if (cardInfoFromStripe.exp_year) responseObj.exp_year = cardInfoFromStripe.exp_year
                if (cardInfoFromStripe.exp_month) responseObj.exp_month = cardInfoFromStripe.exp_month
                if (cardInfoFromStripe.last4) responseObj.last4 = cardInfoFromStripe.last4
                if (cardInfoFromStripe.name) responseObj.name = cardInfoFromStripe.name

                return responses.getResponseWithMessage(constant.successMessages.success, constant.codes.success, responseObj);
            } else {
                return responses.getResponseWithMessage(constant.errorMessage.card_not_found, constant.codes.card_not_found);
            }
        } else {
            return responses.getResponseWithMessage(constant.errorMessage.card_not_found, constant.codes.card_not_found);
        }

    } catch (err) {
        throw err
    }

}

const bulkPayPendingAmounts = async ((pending_ids) => {
    try {
        let sql = 'SELECT  pending_id , currency , author_stripe_account , amount , order_id FROM pending_amounts WHERE pending_id IN (?)';
        let params = [pending_ids];

        let pending_amounts = await mysql.executeQueryPromisified(sql, params);

        if (pending_amounts && pending_amounts.length > 0) {
            let promiseArray = []
            for (let i = 0; i <= pending_amounts.length; i++) {
                promiseArray.push(createTransferStripe(pending_amounts[i].amount, pending_amounts[i].author_stripe_account, pending_amounts[i].currency));
            }

            await Promise.all(promiseArray);
            return getResponseWithMessage(constant.success.success, constant.codes.success, {});
        } else {
            return getResponseWithMessage(constant.errorMessage.no_pending_amount_found, constant.codes.no_pending_amount_found);
        }


    } catch (error) {
        throw error;
    }
})


function getStripeAccountInfo(stripe_account) {
    return new Promise((resolve, reject) => {
        stripe.accounts.retrieve(
            stripe_account,
            function (err, account) {
                if (err) {
                    return reject(err);
                }

                return resolve(account);

            }
        );
    })
}

function getCardInfoStripe(customer_stripe_id, card_stripe_id) {
    return new Promise((resolve, reject) => {
        stripe.customers.retrieveCard(
            customer_stripe_id,
            card_stripe_id,
            function (err, card) {
                if (err) {
                    return reject(err);
                }
                return resolve(card);
            }
        );
    })
}

function insertPendingAmounts(author_stripe_account, amount, order_id, currency) {
    return new Promise((resolve, reject) => {
        sql = 'INSER INTO pending_amounts (author_stripe_account,amount,order_id,currency) VALUES(?,?,?,?)';
        params = [author_stripe_account, amount, order_id, currency];
        connection.query(sql, params, (error, result) => {
            if (error) {
                return reject(error);
            }
            return resolve(result);
        })
    })
}

function createTransferStripe(amount, stripe_account, currency) {
    return new Promise((resolve, reject) => {
        stripe.transfers.create({
            amount: amount,
            currency: currency,
            destination: stripe_account
        }, function (err, transfer) {
            if (err) {
                return reject(err);
            }
            return resolve(transfer);
        });
    })
}







function createChargeStripe(conn, amount, auhtorPriceOverall, customer_stripe_id, stripe_account, currency) {
    return new Promise((resolve, reject) => {
        let stripeObj = {
            amount: amount,
            currency: currency,
            customer: customer_stripe_id
        };

        if(stripe_account){
            let destination = {
                amount: Math.round(auhtorPriceOverall),
                account: stripe_account
            }
            stripeObj.destination = destination ;
        }

        stripe.charges.create(stripeObj, function (err, charge) {
            console.log('err charge->', err, charge)
            if (err) {
                return conn.rollback(function () {
                    return reject(err);
                });
            }
            if (charge) {
                return resolve(charge)
            }
        });
    })
}



function createAccountStripe(finalStripeObject) {
    return new Promise((resolve, reject) => {
        stripe.accounts.create(
            finalStripeObject,
            function (err, account) {
                if (err) return reject(err);
                else resolve(account);
            });
    })
}

function deleteCardStripe(existingCard) {
    return new Promise((resolve, reject) => {
        stripe.customers.deleteCard(
            existingCard.customer_stripe_id,
            existingCard.card_stripe_id,
            function (err, confirmation) {
                console.log('deleted card->', err, confirmation);
                if (err) {
                    return reject(err);
                } else {
                    return resolve(confirmation);
                }
            }
        );
    })
}


function editExistingCardStripe(existingCard, editObject) {
    return new Promise((resolve, reject) => {
        stripe.customers.updateCard(
            existingCard.customer_stripe_id,
            existingCard.card_stripe_id,
            editObject,
            function (err, card) {
                console.log('edited card->', err, card);
                if (err) {
                    return reject(err);
                } else {
                    return resolve(card);
                }
            }
        );
    })
}




function addCardToExistingCustomer(customerAccount, source) {
    return new Promise((resolve, reject) => {
        stripe.customers.createSource(
            customerAccount, {
                source: source
            },
            function (err, card) {
                console.log('adding card->', err, card);
                if (err) {
                    return reject(err);
                } else {
                    return resolve(card);
                }
            }
        );
    })
}




function addCustomerToStripePromisified(stripe_token, userDetails) {
    return new Promise((resolve, reject) => {
        stripe.customers.create({
            description: 'Customer is only for buying book',
            source: stripe_token,
            email: userDetails.email,
        }, function (err, customer) {
            console.log('error result->', err, customer);
            if (err) {
                return reject(err);
            }
            return resolve(customer);
        });
    })
}


module.exports = {
    addCardAndCustomer,
    editCardDetails,
    deleteCard,
    addAccount,
    buyBook,
    deleteAccount,
    getAccountInfo,
    bulkPayPendingAmounts
}