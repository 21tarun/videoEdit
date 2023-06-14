const express = require('express');
// const multer = require('multer');


const route= require('./routes/route')
const app= express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use( multer().any())



app.use("/",route)
app.listen(4000, function(req,res){
    console.log("server is running on 4000")
})