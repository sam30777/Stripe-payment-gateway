
const Joi = require('joi');
const responses = require('../common/responses');
const constant = require('../common/constant');

const addCardAndCustomer = function (req,res,next) {
    console.log("user name==>",req.body);

    const schema = Joi.object().keys({
        stripe_token : Joi.string().required() ,
        access_token : Joi.string().required()
         })

    let validate = Joi.validate(req.body, schema);
    console.log('validate->',validate)
    if(validate.error){
        responses.sendError(res,constant.errorMessage.parameter_missing,constant.codes.parameter_missing);
    }
    else {
        next()
    }
}

const  editCardDetails = function(req,res,next) {
    console.log("body editCardDetails->",req.body);
    const schema = Joi.object().keys({
        card_id         : Joi.number().required() ,
        address_city    : Joi.string().optional() ,
        address_country : Joi.string().optional() ,
        address_line1   : Joi.string().optional() ,
        address_line2   : Joi.string().optional() ,
        address_state   : Joi.string().optional() ,
        address_zip     : Joi.string().optional() ,
        exp_month       : Joi.number().optional() ,
        exp_year        : Joi.number().optional() ,
        name            : Joi.string().optional()
         })


    let validate = Joi.validate(req.body, schema);
    console.log('validate->',validate)
    if(validate.error){
        responses.sendError(res,constant.errorMessage.parameter_missing,constant.codes.parameter_missing);
    }
    else {
        next()
    }
}

const deleteCard = function(req,res,next){
    const schema = Joi.object().keys({
        card_id: Joi.number().required()
    })

    let validate = Joi.validate(req.body, schema);
    console.log('validate->',validate)
    if(validate.error){
        responses.sendError(res,constant.errorMessage.parameter_missing,constant.codes.parameter_missing);
    }
    else {
        next()
    }
}

const buyBook = function(req,res,next){
    const schema = Joi.object().keys({
        card_id: Joi.number().required() ,
        book_id : Joi.number().required() ,
        quantity : Joi.number().required() ,
        promo_percent    : Joi.number().optional().max(100)

    })

    let validate = Joi.validate(req.body, schema);
    console.log('validate->',validate)
    if(validate.error){
        responses.sendError(res,constant.errorMessage.parameter_missing,constant.codes.parameter_missing);
    }
    else {
        next()
    }
}



const addAccount = function(req,res,next){
   
    const schema = Joi.object().keys({
        first_name : Joi.string().required() ,
        last_name : Joi.string().required() ,
        dob_day   : Joi.number().required(),
        dob_month : Joi.number().required() ,
        dob_year : Joi.number().required() ,
        bank_account_currency : Joi.string().required() ,
        bank_account_number : Joi.string().required() ,
        routing_number : Joi.string().optional() ,
        bank_account_type : Joi.string().required() ,
        ip : Joi.string().optional() ,
        business_name : Joi.string().optional() ,
        business_tax_id : Joi.string().optional() ,
        ssn : Joi.number().optional()


    })

    let validate = Joi.validate(req.body, schema);
    console.log('validate->',validate)
    if(validate.error){
        responses.sendError(res,constant.errorMessage.parameter_missing,constant.codes.parameter_missing);
    }
    else {
        next()
    }
}

module.exports = {
    addCardAndCustomer ,
    editCardDetails ,
    deleteCard ,
    addAccount ,
    buyBook
}