const responses = require('./../common/responses');
const constant  = require('./../common/constant');
const encryptDecrypt = require('./../common/encryptDectypt');
const mysql          = require('./../database/mysql');
const token          = require('./../common/jwt');

const registerAuthor = async function (payload){
    try {  
        console.log("inside regioster-->",payload);
        let email = payload.email ;
        let user_name = payload.user_name ;
        let date_of_birth = new Date(payload.date_of_birth) ;
    
        let existingAuthor = await checkIfAuthorExists(email,user_name);
        
        console.log('existing user->',existingAuthor);

        if(existingAuthor) {
            return responses.getResponseWithMessage(constant.errorMessage.author_already_exists,constant.codes.author_already_exists,{});
        }
        
        let password = encryptDecrypt.encryptPassword(payload.password);
        console.log('password->',password);
        let sql = 'INSERT INTO authors (user_name,email,password,date_of_birth) VALUES(?,?,?,?)'
        let params = [user_name,email,password,date_of_birth] ;

        let insertedUser = await mysql.executeQueryPromisified(sql,params);

        console.log("insrted user->",insertedUser);

        if(insertedUser && insertedUser.insertId ) {
           
            return responses.getResponseWithMessage(constant.successMessages.author_registered_successfully,constant.codes.success);
        } else {
            return responses.getResponseWithMessage(constant.errorMessage.user_registraion_failed,constant.codes.user_registraion_failed);
        }

    } catch(error){
        throw error ; 

    }
}


const login = async function(payload){
    try {
        let user_name = payload.user_name ;
        let existingAuthor = await checkIfAuthorExists('',user_name);

        console.log("use->",existingAuthor);

        if(!existingAuthor) {
            return responses.getResponseWithMessage(constant.errorMessage.author_doesnot_exists,constant.codes.author_doesnot_exists);
        }

        let password = encryptDecrypt.encryptPassword(payload.password) ;
        if(password != existingAuthor.password) {
            return responses.getResponseWithMessage(constant.errorMessage.password_is_incorrect,constant.codes.password_is_incorrect);
        }

        let authObject   =  {
            role : constant.roles.author ,
            author_id : existingAuthor.author_id
        } 

        console.log("auth obj->",authObject);

        let access_token =  await token.getAccessToken(authObject);
        console.log('access_token->',access_token);

        let sql = 'UPDATE authors SET access_token = ? WHERE author_id = ? ' ;

        let params = [access_token,existingAuthor.author_id];

        let updatedAuthor = await mysql.executeQueryPromisified(sql,params);

        console.log('updated user ->',updatedAuthor);

        if(updatedAuthor && updatedAuthor.affectedRows  ){
            delete existingAuthor.password ;
            existingAuthor.access_token = access_token ;
            console.log('user after->',existingAuthor);
            return responses.getResponseWithMessage(constant.successMessages.login_successfull,constant.codes.success,existingAuthor)
        } else {
            return responses.getResponseWithMessage(constant.errorMessage.login_failed,constant.codes.login_failed)
        }
        
    } catch(error)  {
        throw error ;
    }
}

const addBook = async function(author_id,payload){
    try {
        let sql = 'SELECT * FROM authors WHERE author_id = ?'
        let params = [author_id];

        let existingAuthor = await mysql.executeQueryPromisified(sql,params);
        if(existingAuthor && existingAuthor.length > 0){
        let book_name = payload.book_name ;
        let book_price = payload.book_price ;
        let no_in_stock = payload.no_in_stock ;
        let author_percentage = payload.author_percentage ;

        sql = 'INSERT INTO books (book_name,book_price,no_in_stock,author_percentage,author_id) VALUES(?,?,?,?,?)'
        params = [book_name,book_price,no_in_stock,author_percentage,author_id];
        
        let insertedBooks = await mysql.executeQueryPromisified(sql,params);
        if(insertedBooks && insertedBooks.insertId) {
            return responses.getResponseWithMessage(constant.successMessages.book_added_successfully,constant.codes.success)
        }else{
            return responses.getResponseWithMessage(constant.errorMessage.failed_to_add_books,constant.codes.failed_to_add_books)
        }
            
        }else {
            return responses.getResponseWithMessage(constant.errorMessage.author_doesnot_exists,constant.codes.author_doesnot_exists)
        }
        

    } catch(error) {
        throw error ;
    }
}



const checkIfAuthorExists = async function(email,userName){    
    return new Promise((resolve,reject)=>{

    let sql = 'SELECT  author_id , user_name , password , date_of_birth , email from authors WHERE email =? OR user_name = ? ' ;
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
    registerAuthor ,
    login ,
    addBook
}