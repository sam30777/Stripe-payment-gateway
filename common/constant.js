


const jwtPrivateKey = 'sdfsdgfhegfdhg453423ujf3o8957430u0343485';
const errorMessage = {
    'parameter_missing'    : 'Invalid parameters were provided' ,
    'something_went_wrong' : 'something went wrong' ,
    'user_already_exists'  : 'User already Exists' ,
    'unable_to_register'   : 'unable_to_register' ,
    'user_does_not_exits'  : 'User does not exists' ,
    'password_is_incorrect' : 'Incorrect password'
}

const successMessages = {
    'user_registered_successfully' : 'user is registered successfully' ,
    'unable_to_register'           : 'Registration failed'
}


const codes = {
    'parameter_missing'   : 400 ,
    'user_already_exists' : 201   ,
    'user_registered_successfully' : 200 ,
    'something_went_wrong'  : 400 ,
    'user_does_not_exits'   : 400 ,
    'password_is_incorrect' : 400 
}

module.exports = {
    
    errorMessage ,
    codes ,
    successMessages ,
    jwtPrivateKey
}