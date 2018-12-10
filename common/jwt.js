const jwt = require('jsonwebtoken') ;
const constant = require('./constant');
const responses = require('./responses');


const getAccessToken = function (data){
    return jwt.sign({ data } , constant.jwtPrivateKey );
}

const verifyAccessToken = function (req,res,next){

    let access_token ; 
    if(req.body.access_token){
        access_token = req.body.access_token ;
    } else {
        access_token = req.get('Authorization') ;
    }
     
    console.log('access token is this-->',access_token)
    let verifiedAccessToken = jwt.verify(access_token,constant.jwtPrivateKey);

    if(verifiedAccessToken.data.role != constant.roles.user) {
        responses.sendError(res,constant.errorMessage.not_autherised,constant.codes.not_autherised);
    }
    req.user_id =  verifiedAccessToken.data.user_id  ;
    next()
    
}


const verfiyAuthorAccessToken = function (req,res,next){

    let access_token ; 
    if(req.body.access_token){
        access_token = req.body.access_token ;
    } else {
        access_token = req.get('Authorization') ;
    }
    console.log('access token is this-->',access_token)
    let verifiedAccessToken = jwt.verify(access_token,constant.jwtPrivateKey);
    console.log('verfied token->',verifiedAccessToken);
    if(verifiedAccessToken.data.role != constant.roles.author) {
        responses.sendError(res,constant.errorMessage.not_autherised,constant.codes.not_autherised);
    }
    req.author_id =  verifiedAccessToken.data.author_id  ;
    next()
    
}

const verifyAdminAccessToken = function (req,res,next){

    let access_token ; 
    if(req.body.access_token){
        access_token = req.body.access_token ;
    } else {
        access_token = req.get('Authorization') ;
    }
    console.log('access token is this-->',access_token)
    let verifiedAccessToken = jwt.verify(access_token,constant.jwtPrivateKey);
    console.log('verfied token->',verifiedAccessToken);
    if(verifiedAccessToken.data.role != constant.roles.admin) {
        responses.sendError(res,constant.errorMessage.not_autherised,constant.codes.not_autherised);
    }
    req.admin_id =  verifiedAccessToken.data.admin_id  ;
    next()
    
}

module.exports = {
    getAccessToken ,
    verifyAccessToken ,
    verfiyAuthorAccessToken ,
    verifyAdminAccessToken
}