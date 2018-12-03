
const mysql = require('mysql');



const  initializeConnectionPool = async function() {
    try {
        
        var conn = mysql.createPool({
          host                : 'localhost',
          user                : 'root',
          password            : '',
          database            : 'payment_system',
          multipleStatements  : true
        });
    
        return conn
        
    } catch (error) {
        console.log('error occured while connecting to sql-.>',error);
        return error; 
    }   
  }

  module.exports = {
      initializeConnectionPool 
  }