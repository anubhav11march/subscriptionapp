const mongoose=require('mongoose')
const {isEmail } =require('validator')

const UserSchema= new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        username:true
    },
    password:{type:String},
    email:{
        type:String,
        validate:[
            isEmail,
            "Invalid Email!"
        ]
    },
    phoneno:{
        type:String,
    },
    pincode:String,
    address:String,
    confirmationcode:String,
    image:String,
    admin:Boolean,
    shopname:String,
    adminverified:{
        type:Boolean,
        default:false
    },
    isVendor:Boolean
})

UserSchema.index({username:1,phoneno:1});

module.exports=mongoose.model("User",UserSchema);
