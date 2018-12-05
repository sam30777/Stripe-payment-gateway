const jwt = require('jsonwebtoken') ;
const constant = require('./constant');
const responses = require('./responses');


const getAccessToken = function (data){
    return jwt.sign({ data } , constant.jwtPrivateKey );
}

const verifyAccessToken = function (req,res,next){

    let access_token = req.get('Authorization') ;

    console.log('access token is this-->',access_token)
    let verifiedAccessToken = jwt.verify(access_token,constant.jwtPrivateKey);

    if(verifiedAccessToken.data.role != constant.roles.user) {
        responses.sendError(res,constant.errorMessage.not_autherised,constant.codes.not_autherised);
    }
    req.user_id =  verifiedAccessToken.data.user_id  ;
    next()
    
}
module.exports = {
    getAccessToken ,
    verifyAccessToken
}