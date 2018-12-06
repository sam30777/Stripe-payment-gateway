
const mySqlService = require('./database/mysql');

const  initializeDatabaseAndServer = async function() {
      try {
        var port =  process.env.port || 3001 ;
        global.connection   = await mySqlService.initializeConnectionPool();
        await startServer(port);
        return ;
      } catch (error){
          console.log('error while intializing server=>',error);
          return error ;
      }
  }


  const startServer = function(port) {
      return new Promise((resolve,reject)=>{
        app.listen(port,(error,result)=>{
            if(error){
                console.log('Error while starting server',error);
                return reject(error);
            }
            console.log(`---------------Server is connected at port ${port} `)
            return resolve()

        })
      })
    
  }


  module.exports = {
      initializeDatabaseAndServer
  }