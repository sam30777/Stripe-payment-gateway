const md5 = require('md5');


const  encryptPassword = function (message){
    return md5(message);
}


module.exports = {
    encryptPassword 
}