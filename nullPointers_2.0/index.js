const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const { logReqRes } = require('./middlewares/log');
const { error } = require('console');

const app = express();
const PORT = 6969;

mongodb+srv://<saksham>:1AGrEtT2wLj272T5@null-ptrs.2idnn.mongodb.net/?retryWrites=true&w=majority&appName=null-ptrs

app.set("view engine", "ejs");
app.set("views", path.resolve('./views'));
app.use(express.static('./assets'));
app.use(express.static('./assets'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(logReqRes("log.txt"));

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(PORT, (error) => {
    if(error){
        console.log("Error connecting with server", error);
    }
    else{
        console.log(`Server is listening on port -> ${PORT}`);
        console.log(`http://localhost:${PORT}`);
    }
})