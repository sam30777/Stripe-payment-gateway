
const responses      = require('./../common/responses');
const constant       = require('./../common/constant');
const authorServices = require('./authorServices');

const  registerAuthor =  async (req,res)=>{
    try {  
        let payloadData = req.body ;
        let data = await  authorServices.registerAuthor(payloadData);
        res.send(JSON.stringify(data));

    } catch (error) {
        console.log('error while register->',error);
         res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const login = async (req,res) => {
    try {
        let payloadData = req.body ;
        let data = await authorServices.login(payloadData);
        res.send(JSON.stringify(data));

    } catch (error){
        console.log('error while login->',error);
         res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}

const addBook = async (req,res) => {
    try {
        let payloadData = req.body ;
        let author_id   = req.author_id ;
        let data = await authorServices.addBook(author_id,payloadData);
        res.send(JSON.stringify(data));

    } catch (error){
        console.log('error while adding book->',error);
         res.send(JSON.stringify(responses.getResponseWithMessage(constant.errorMessage.something_went_wrong,constant.codes.something_went_wrong)));
    }
}



module.exports =  {
    registerAuthor ,
    login ,
    addBook
}
