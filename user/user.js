const log = require('log');

const constant = require('./../common/constant');

const responses = require('./../common/responses');

const encryptDecrypt = require('./../common/encryptDectypt');
const mysql          = require('./../database/mysql');
const token          = require('./../common/jwt');
const registerUser = async function (payload){
        try {  
            console.log("inside regioster-->",payload);
            let email = payload.email ;
            let user_name = payload.user_name ;
            let date_of_birth = new Date(payload.date_of_birth) ;
        
            let existingUser = await checkIfUserExists(email,user_name);
            
            console.log('existing user->',existingUser);

            if(existingUser) {
                return responses.getResponseWithMessage(constant.errorMessage.user_already_exists,constant.codes.user_already_exists,{});
            }
            
            let password = encryptDecrypt.encryptPassword(payload.password);
            let sql = 'INSERT INTO users (user_name,email,password,date_of_birth) VALUES(?,?,?,?)'
            let params = [user_name,email,password,date_of_birth] ;

            let insertedUser = await mysql.executeQueryPromisified(sql,params);
            if(insertedUser && insertedUser.length > 0) {
                let successMessage = constant.successMessages.user_registered_successfully.replace('{username}',user_name);
                console.log('scuess message',successMessage);
                return responses.getResponseWithMessage(successMessage,constant.codes.user_already_exists);
            } else {
                return responses.getResponseWithMessage(constant.successMessages.user_registered_successfully,constant.codes.user_registered_successfully);
            }

        } catch(error){
            throw error ; 

        }
}

const login = async function(payload){
    try {
        let user_name = payload.user_name ;
        let existingUser = await checkIfUserExists('',user_name);

        if(!existingUser) {
            return responses.getResponseWithMessage(constant.errorMessage.user_does_not_exits,constant.codes.user_does_not_exits);
        }

        let password = encryptDecrypt.encryptPassword(payload.password) ;
        if(password != existingUser.password) {
            return responses.getResponseWithMessage(constant.errorMessage.password_is_incorrect,constant.codes.password_is_incorrect);
        }

        let authObject   =  {
            role : 'user' ,
            user_id : existingUser.user_id
        } 
        let access_token =  await authObject.getAccessToken(authObject);
        let sql = 'UPDATE users SET access_token = ? WHERE user_id = ? ' ;
        let params = [access_token,user_id];

        let updatedAcce


    } catch(error)  {
        throw error ;
    }
}


const checkIfUserExists = async function(email,userName){    
    return new Promise((resolve,reject)=>{

    let sql = 'SELECT user_name , email from users WHERE email =? OR user_name = ? ' ;
    let params = [email,userName];

    connection .query(sql,params,(error,user)=>{
        console.log('result',error,user);
        if(error) {   
            reject(error);
        } 
        if(user && user.length > 0){
            return resolve(user[0]);
        }
        else return resolve(false)
    })

    })

} 




module.exports = {
    registerUser ,
    login 

}