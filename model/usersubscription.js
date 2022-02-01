const mongoose=require('mongoose');

const UserSubscriptionSchema= new mongoose.Schema({
    userid:mongoose.Types.ObjectId,
    productid:mongoose.Types.ObjectId,
    vendor:mongoose.Types.ObjectId,
    quantity:Number,
    interval:String,
    amount:Number,
    status:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

UserSubscriptionSchema.index({username:1,phoneno:1});

module.exports=mongoose.model("usersubscription",UserSubscriptionSchema);
