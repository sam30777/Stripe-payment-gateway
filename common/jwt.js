const jwt = require('jsonwebtoken') ;
const constant = require('./constant');
const getAccessToken = function (data){
    return jwt.sign({ data } , constant.jwtPrivateKey , { algorithm: 'RS256'});
}


module.exports = {
    getAccessToken
}