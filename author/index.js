
const authorVaidator            = require('./authorValidator');
const authorController          = require('./authorController');
const token                     = require('./../common/jwt') ;

app.post('/author/register',authorVaidator.registerAuthor,authorController.registerAuthor)    ;
app.post('/author/login',authorVaidator.login,authorController.login) ;
app.post('/author/addBook',authorVaidator.addBook,token.verfiyAuthorAccessToken,authorController.addBook) ;


// app.post('/user/login',userValidator.login, async (req,res,)=>{
//     try {
//         let payload = req.body ;

//         let data = await user.login(payload) ;

//         res.send(JSON.stringify(data));

//     } catch(error) {
//         console.log('error while register->',error);
//         res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
//     }
// })

