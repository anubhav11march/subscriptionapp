const User = require('../model/user');
const Vendorbank = require('../model/vendorbank');
const Vendorproduct=require('../model/vendorproduct');
const { successmessage,
    errormessage,
} = require('../utils/util');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid')
const path = require('path');
const mongoose = require('mongoose');

exports.UpdatebankDetails = async (req, res) => {
    try {
        let { user } = req;
        let { accountno, accountholdername, ifsccode, upidetails } = req.body;


        let bankschema = {
            userid: mongoose.Types.ObjectId(JSON.parse(user)),
            accountno,
            accountholdername,
            ifsccode,
            upidetails
        }
        let userbank = await Vendorbank.findOne({ userid: mongoose.Types.ObjectId(JSON.parse(user)) });
        if (!userbank) {
            let bankvendor = new Vendorbank(bankschema);
            await bankvendor.save();
            return res.status(200).json(successmessage("Updated Bank Details Successfuly!", bankvendor));
        }

        let updatedvendorbank = await Vendorbank.findOneAndUpdate({ userid: mongoose.Types.ObjectId(JSON.parse(user)) }, { $set: bankschema }, { $new: true });
        res.status(200).json(successmessage("Updated Bank Details Successfuly!", updatedvendorbank));

    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.addProduct=async(req,res)=>{
    try{
        let {productimage,category,productname,price,unit}=req.body;
        if(!productimage||!category||!productname||!price||!unit){
            return res.status(400).json(errormessage("All fields should be present!"));
        }
        let {user}=req;
        user=mongoose.Types.ObjectId(JSON.parse(user));

        let vendordetails=await User.findOne({_id:user});

        let product=new Vendorproduct({
            category,
            name:productname,
            price:parseInt(price),
            unit,
            image:productimage,
            vendorid:user,
            vendorname:vendordetails.name,
            vendorphoneno:vendordetails.phoneno
        })

        await product.save();
        res.status(200).json(successmessage("Product added successfuly!",product));

    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

exports.getProducts=async(req,res)=>{
    try{
        let {user}=req;
        user=mongoose.Types.ObjectId(JSON.parse(user));
        let vendorproducts=await Vendorproduct.findOne({vendorid:user});
        res.status(200).json(successmessage("Vendor Products",vendorproducts));
    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

exports.editProduct=async(req,res)=>{
    try{
        let {user}=req;
        user=mongoose.Types.ObjectId(JSON.parse(user));
        let {productid,category,name,price,unit,image}=req.body;

        if(!productid||!category||!name||!price||!unit||!image){
            return res.status(400).json(errormessage("All fields shpuld be present!"));
        }

        let updates={
            category,
            name,
            price,
            unit,
            image
        }

        let updatedproduct=await Vendorproduct.findOneAndUpdate({_id:mongoose.Types.ObjectId(productid),vendorid:user},{$set:updates},{new:true});
        if(!updatedproduct){
            return res.status(400).json(errormessage("Something went wrong!"));
        }
        res.status(200).json(successmessage("Product successfuly Editted!",updatedproduct));

    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}