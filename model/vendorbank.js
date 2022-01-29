const mongoose=require('mongoose')

const VendorBankSchema= new mongoose.Schema({
    accountno:String,
    accountholdername:String,
    ifsccode:String,
    upidetails:String,
    userid:mongoose.Types.ObjectId
},{timestamps:true})

VendorBankSchema.index({userid:1});

module.exports=mongoose.model("Vendorbank",VendorBankSchema);
