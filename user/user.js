const log = require('log');

const constant = require('./../common/constant');


const registerUser = async function (payload){
        try{  
            let email = payload.email ;
            let userName = payload.userName ;
            let existingUser = await checkIfUserExists(email,userName);
        } catch(error){
            
        }
}

const checkIfUserExists = async function(email,userName){    
    return new Promise((resolve,reject)=>{

    let sql = 'SELECT userName , email from users WHER email =? OR userName = ? ' ;
    let params = [email,userName];

    connection .query(sql,params,(error,user)=>{
        if(error) {   
            reject(constant.errorMessage.something_went_wrong);
        } 
        
    })

    })


} 


module.exports = {
    registerUser 
}