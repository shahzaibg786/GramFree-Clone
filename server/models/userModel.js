const mongoose = require('mongoose')

const userSchema =new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please Enter Your Name!"],
        trim: true
    },
    email:{
        type: String,
        required: [true, "Please Enter Your Email!"],
        trim: true
    },
    password:{
        type: String,
        required: [true, "Please Enter Your Password!"]
    },
    role:{
        type: Number,
        default: 0 // user = 0, admin =1
    },
    avatar:{
        type: String,
        default : "https://res.cloudinary.com/dcwghe0gf/image/upload/v1610100048/samples/ecommerce/userprof_hoxs9a.png"
    }
},{
    timestamps : true
})

module.exports = mongoose.model("Users", userSchema)