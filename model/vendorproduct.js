const mongoose=require('mongoose');

const VendorProductSchema= new mongoose.Schema({
    category:String,
    name:String,
    price:Number,
    unit:String,
    image:String,
    vendorid:mongoose.Types.ObjectId,
    vendorname:String,
    vendorphoneno:String
},{timestamps:true})

VendorProductSchema.index({vendorid:1});

module.exports=mongoose.model("vendorproduct",VendorProductSchema);
