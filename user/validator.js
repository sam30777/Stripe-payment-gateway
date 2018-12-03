
const Joi = require('joi');
const log = require('log');

const responses = require('./../common/responses');
const constant  = require('./../common/constant');
const registerUser = function (req,res,next){

    const schema = Joi.object().keys({
        username: Joi.string().alphanum().min(4).max(30).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
        dob     : Joi.date().required(),
        email: Joi.string().required()
    })

    let validate = Joi.validate(req.body, schema);
    if(validate.error){
        responses.sendError(res,constant.errorMessage.parameter_missing,constant.errorCode.parameter_missing);
    }
    else {
        next()
    }

    
}


module.exports = {
    registerUser 
}