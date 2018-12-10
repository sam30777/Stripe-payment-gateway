let stripe = require('stripe')('sk_test_Iu7V5woq0JGsc94c4G6UN15d')

// stripe.charges.create({
//     amount     :   10000,
//     currency   :   'usd'  ,
//     customer   :   'cus_E6qrFml2SimJAi' , 
//        destination : {  amount : Math.round(10000),
//         account : 'acct_1DeICSENWOmzVEVT' 
//         }  
//   }, function(err, charge) {
//       console.log('err charge->',err,charge)
//     if(err){
       
//     }
   
//   });

stripe.accounts.retrieve(
    'acct_1DeICSENWOmzVEVT',
    function(err, account) {
        console.log('err , almunt=>',err,account)
      // asynchronously called
    }
  );

  

  