
const Joi = require('joi');


const responses = require('./../common/responses');
const constant  = require('./../common/constant');


const registerAuthor = function (req,res,next){
    console.log("user name==>",req.body);
    const schema = Joi.object().keys({
        user_name: Joi.string().alphanum().min(4).max(30).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
        date_of_birth     : Joi.date().required(),
        email: Joi.string().required()   
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

const login =  function (req,res,next) {
    const schema = Joi.object().keys({
        user_name: Joi.string().alphanum().min(4).max(30).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
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

const addBook = function(req,res,next) {
    const schema = Joi.object().keys({
        book_name: Joi.string().alphanum().min(4).max(30).required() ,
        book_price: Joi.number().required(),
        author_percentage : Joi.number().required() ,
        no_in_stock : Joi.number().required()
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
    registerAuthor ,
    login ,
    addBook
    
}