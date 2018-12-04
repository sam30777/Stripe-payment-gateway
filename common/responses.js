function sendSuccess(res,message,data){
    var response = {
        message:  message ,
        status : 200 ,
        data   : data ? data : {}
      };
      return res.send(JSON.stringify(response)); 
}

function getResponseWithMessage(message,code,data){
    var response = {
        message : message ,
        status  : code ,
        data    : data
    }
    return response ;
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
    sendError ,
    getResponseWithMessage
}