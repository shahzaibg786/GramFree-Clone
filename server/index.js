const express = require('express')
const mongoose =require('mongoose')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
//const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

// APP CONFIG
const app = express()


//MIDDLE WARE
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true
}))


//ROUTES
app.use('/user', require('./routes/userRouter'))
app.use('/api', require('./routes/upload'))

//--DB CONNECTION
//const PORT = process.env.PORT
const URI = process.env.CONNECTION_URL

mongoose.connect(URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
},
err => {
    if(err) throw err;
    console.log("connected to mongodb")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`)
})