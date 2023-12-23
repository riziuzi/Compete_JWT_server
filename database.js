const mongoose = require("mongoose")

const Userschema = mongoose.Schema({
    name:String,
    username:{
        type: String,
        required: true,
        unique: true
    },
    password: String
})

exports.User = mongoose.model("User_JWT",Userschema)