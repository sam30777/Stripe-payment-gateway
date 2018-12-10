
const token            = require('./../common/jwt')
const stripeValidator  = require('./stripeValidator');
const stripeController = require('./stripeController');

app.post('/user/addCardAndCustomer',stripeValidator.addCardAndCustomer,token.verifyAccessToken,stripeController.addCardAndCustomer);
app.post('/user/editCardDetails',stripeValidator.editCardDetails,token.verifyAccessToken,stripeController.editCardDetails)
app.post('/user/deleteCard',stripeValidator.deleteCard , token.verifyAccessToken , stripeController.deleteCard )
app.post('/author/addAccount',stripeValidator.addAccount,token.verfiyAuthorAccessToken , stripeController.addAccount)
app.post('/user/buyBook',stripeValidator.buyBook , token.verifyAccessToken , stripeController.buyBook )
app.post('author/deleteAccount',token.verfiyAuthorAccessToken,stripeController.deleteAccount)
app.get('/author/getAccountInfo',toke.verfiyAuthorAccessToken,stripeController.getAccountInfo);
app.get('/user/getCardInfo',token.verifyAccessToken,stripeController.getCardInfo);
app.post('admin/bulkPayPendingAmounts',token.verifyAdminAccessToken,stripeValidator.bulkPayPendingAmounts,stripeController.bulkPayPendingAmounts);
