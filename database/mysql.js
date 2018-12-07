
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

  const returnConnectionFromPool =  function () {
      return new Promise((resolve,reject)=>{
        connection.getConnection((error,conn)=>{
            if(error){
                return reject(error);
            }
            return resolve(conn);
        })
      })
  }

  const beginTransactionPromisified = function(conn) {
      return new Promise ((resolve,reject)=>{
        conn.beginTransaction((err)=>{
            console.log('begin transaciton->',err)
            if(err) return reject(err);

            return resolve();
        });
      })
  }

  const executeTransanctionQueryPromisified = function (conn , sql ,params) {
    return new Promise((resolve,reject)=>{
         conn.query(sql,params,(error,result)=>{    
            if(error) {
                 conn.rollback(()=>{
                    return reject(error)
                })
            }
            return resolve(result);
         })
      })
  }

  const rolBackPromisified = function (conn) {
    return new Promise((resolve,reject)=>{
        conn.rollback(()=>{
            console.log('inside rollback');
            return resolve(true);
        })
     })
  }

  const commitPromisified = function (conn) {
      return new Promise((resolve,reject)=>{
        conn.commit((err)=>{
            if(err){
                conn.rollback(()=>{
                    return reject(err);
                })
            }
            return resolve();
        })
      })
  }

  module.exports = {
      initializeConnectionPool  ,
      executeQueryPromisified ,
      returnConnectionFromPool ,
      beginTransactionPromisified ,
      executeTransanctionQueryPromisified ,
      rolBackPromisified ,
      commitPromisified
  }