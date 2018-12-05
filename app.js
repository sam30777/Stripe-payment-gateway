const express = require('express');

const startjs = require('./start');

const bodyParser = require('body-parser');

const path = require('path');

const indexPath = path.join(__dirname,'/public');

console.log("index pah->",indexPath);

const log = require('log');

const app = new express();


app.use('/',express.static(indexPath));

app.listen(3000,(req,res)=>{
    console.log('server is running at 3000');
})

app.get('/', function(req, res){
    res.sendFile('./public/index.html',{root: __dirname});
});

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));



global.app  = app ;
global.log = log ;



require('./user/index');
require('./stripe/index')


startjs.initializeDatabaseAndServer();


