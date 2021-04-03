const port = process.env.PORT || 3000;
const express = require('express');
const socket = require('socket.io');

const app = express();

const server = app.listen(port,function(){
    console.log('Server is running')
});

//for static files
app.use(express.static('public'));

//socket setup
