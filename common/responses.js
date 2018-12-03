function sendSuccess(res,data){
    var response = {
        message:  "Success" ,
        status : 200 ,
        data   : data ? data : {}
      };
      return res.send(JSON.stringify(response)); 
}

function sendError(res,message,code) {
    var response = {
        message: message ,
        status : code,
        data   : {}
      };
      return res.send(JSON.stringify(response)); 
}

module.exports = {
    sendSuccess ,
    sendError
}