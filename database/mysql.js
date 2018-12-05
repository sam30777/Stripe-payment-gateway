
const mysql     = require('mysql');

const responses = require('./../common/responses');
const constant  = require('./../common/constant');

const  initializeConnectionPool = async function() {
    try {
        
        var conn = mysql.createPool({
          host                : 'localhost',
          user                : 'root',
          password            : 'clickpass',
          database            : 'payment_system',
          port                : '3306' ,
          multipleStatements  : true
        });
    
        return conn
        
    } catch (error) {
        console.log('error occured while connecting to sql-.>',error);
        return error; 
    }   
  }

  const executeQueryPromisified   = async function (query,params){
      return new Promise((resolve,reject)=>{
            connection.query(query,params,(error,result)=>{
                    if(error) {
                        return reject(error);
                    }

                    return resolve(result);
            })
      })
  }

  module.exports = {
      initializeConnectionPool  ,
      executeQueryPromisified
  }