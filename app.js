const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const upload = require('express-fileupload')
const {notFound,errorHandle}= require("./middleware/errorMiddleware")
require('dotenv').config()
const app = express()
app.use(express.json({extended:true}))
app.use(express.urlencoded({extended:true}))
app.use(cors({credentials:true,origin:"http://localhost:3000"}))
app.use(upload())
app.use('/uploads',express.static(__dirname+'/uploads'))


app.use('/api/users',userRoutes) //phle ye dono chalenge agr nhi milega inme phir error vale run honge.
app.use('/api/posts',postRoutes)
app.use(notFound)
app.use(errorHandle)



mongoose.connect(process.env.MONGO_URI)
.then(()=>{console.log("Successfully connected to database")})
.catch((err)=>{
    console.log("Khatarnaak error aagyi")
})
PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server is ready at  port ${PORT}`)
})


