


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
    'not_autherised'        : 'The access is forbidden' ,
    'uable_to_add_card'     : 'Add card failed' ,
    'uable_to_add_customer' : 'Unable to add customer details' ,
     'card_not_found'       : 'Card not found' ,
     'unable_to_edit_card'  : 'Unable to edit card details' ,
     'unable_to_delete_card' : 'Unable to delete card' ,
     'author_already_exists' : 'Author already exists' ,
     'author_registration_failed' : 'Author registration failed' ,
     'user_registraion_failed'  : 'User registration failed' ,
     'author_doesnot_exists'  : 'Author does not exists' ,
     'failed_to_add_books'    : 'Failed to add books' ,
     'unable_to_add_account'  : 'Adding account was failed' ,
     'no_card_found'          : 'No card found' ,
     'no_book_found'           : 'No book found' ,
     'out_of_stock'           : 'Books are out of stock' ,
     'payment_failed'         : 'Payment was failed'
     
  
}

const successMessages = {
    'user_registered_successfully' : 'user is registered successfully' ,
    'login_successfull'     : 'User logged in' ,
    'card_added_successfully' : 'Card added successfully',
    'card_details_updated' : 'Card details updated successfully' ,
    'card_deleted'         : 'Card is deleted' ,
    'author_registered_successfully' : 'Author registered successfully' ,
    'book_added_successfully' : 'Book added successfully' ,
    'account_details_added'  : 'Account details added successfully' ,
    'booking_successfull'    : 'Booking successfull'
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
    'not_autherised'        : 401 ,
    'uable_to_add_card'     : 400 ,
    'uable_to_add_customer' : 400 ,
    'not_found'             : 400 ,
    'unable_to_edit_card'   : 400 ,
    'unable_to_delete_card' : 400 ,
    'author_already_exists' : 400 ,
    'author_registration_failed' : 400 ,
    'user_registraion_failed' : 400 ,
    'author_doesnot_exists' : 400 ,
    'failed_to_add_books'   : 400 ,
    'unable_to_add_account' : 400 ,
    'out_of_stock'          : 400 ,
    'payment_failed'        : 400
    
    
}

const stripeObject = 'bank_account';

module.exports = {
    
    errorMessage ,
    codes ,
    successMessages ,
    jwtPrivateKey ,
    roles ,
    stripe ,
    stripeObject
}