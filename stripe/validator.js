
const Joi = require('joi');
const responses = require('./../common/responses');
const constant = require('./../common/constant');

const addCardAndCustomer = function (req,res,next) {
    console.log("user name==>",req.body);

    const schema = Joi.object().keys({
            number  : Joi.string().required(),
            exp_month: Joi.number().required(),
            exp_year: Joi.number().required(),
            cvc: Joi.string().required()
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
    addCardAndCustomer
}