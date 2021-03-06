const mongoose=require('mongoose');

const UserSubscriptionSchema= new mongoose.Schema({
    userid:mongoose.Types.ObjectId,
    productName:String,
    category:String,
    unit:String,
    vendorname:String,  // incase of custom
    vendorphoneno:String, // incase of custom
    // productid:mongoose.Types.ObjectId,
    vendor:mongoose.Types.ObjectId,
    priceperquantity:Number,
    quantity:Number,
    interval:String,
    duedate:String,
    delivereddates:[
        {type:String},
    ],
    notdelivered:[
        {type:String},
    ],
    amount:Number,  // total amount for subscription
    status:{
        type:Boolean,
        default:false
    },
    isCustom:{
        type:Boolean,
        default:false
    },
    ishold:{
        type:Boolean,
        default:false
    },
    purchasedOn:{
        type:Date
    },
    ispayment:{
        type:Boolean,
        default:false
    },
    validTill:{
        type:Date
    }
},{timestamps:true})

UserSubscriptionSchema.index({username:1,phoneno:1});

module.exports=mongoose.model("usersubscription",UserSubscriptionSchema);
