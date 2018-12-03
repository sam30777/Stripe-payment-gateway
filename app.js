const express = require('express');

const startjs = require('./start');

const bodyParser = require('body-parser');



const log = require('log');
const app = new express();



app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
global.app  = app ;
global.log = log ;



require('./user/index');


startjs.initializeDatabaseAndServer();


