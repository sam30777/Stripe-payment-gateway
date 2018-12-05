


const jwtPrivateKey = 'sdfsdgfhegfdhg453423ujf3o8957430u0343485';
const errorMessage = {
    'parameter_missing'    : 'Invalid parameters were provided' ,
    'something_went_wrong' : 'something went wrong' ,
    'user_already_exists'  : 'User already Exists' ,
    'unable_to_register'   : 'Registration failed' ,
    'user_does_not_exits'  : 'User does not exists' ,
    'password_is_incorrect' : 'Incorrect password' ,
    'login_failed'          : 'Login failed' ,
    'unable_to_register'           : 'Registration failed' ,
    'not_autherised'        : 'The access is forbidden'
   
}

const successMessages = {
    'user_registered_successfully' : 'user is registered successfully' ,
    'login_successfull'     : 'User logged in'
}

const roles = {
    user : 'user' ,
    author : 'author' 
}

const stripe = {
    stripe_secret_key : 'sk_test_Iu7V5woq0JGsc94c4G6UN15d' 
}

const codes = {
    'parameter_missing'   : 400 ,
    'user_already_exists' : 201   ,
    'user_registered_successfully' : 200 ,
    'something_went_wrong'  : 400 ,
    'user_does_not_exits'   : 400 ,
    'password_is_incorrect' : 400 ,
     'success'              : 200 ,
    'login_failed'          : 400 ,
    'not_autherised'        : 401
}

module.exports = {
    
    errorMessage ,
    codes ,
    successMessages ,
    jwtPrivateKey ,
    roles ,
    stripe
}