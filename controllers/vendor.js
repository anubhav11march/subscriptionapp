const User = require('../model/user');
const Vendorbank = require('../model/vendorbank');
const Vendorproduct=require('../model/vendorproduct');
const Usersubscription=require('../model/usersubscription');
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
        let {category,productname,price,unit}=req.body;
        if(!category||!productname||!price||!unit){
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
        let vendorproducts=await Vendorproduct.find({vendorid:user});
        res.status(200).json(successmessage("Vendor Products",vendorproducts));
    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

exports.editProduct=async(req,res)=>{
    try{
        let {user}=req;
        user=mongoose.Types.ObjectId(JSON.parse(user));
        let {productid,category,name,price,unit}=req.body;

        if(!productid||!category||!name||!price||!unit){
            return res.status(400).json(errormessage("All fields shpuld be present!"));
        }

        let updates={
            category,
            name,
            price,
            unit
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

exports.getCustomers=async(req,res)=>{
    try{
        let {user}=req;
        user=mongoose.Types.ObjectId(JSON.parse(user));
        let vendorcustomers=await Usersubscription.aggregate([
            {$match:{vendor:user,status:true}},
            {$lookup:{
                from:'users',
                localField:'userid',
                foreignField:'_id',
                as:'customer_details'
            }},
            {$lookup:{
                from:'vendorproducts',
                localField:'productid',
                foreignField:'_id',
                as:'product_details'
            }},

        ]).allowDiskUse(true);
        res.status(200).json(successmessage('All Customers',vendorcustomers));
    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

exports.getRequests=async(req,res)=>{
    try{
        let {user}=req;
        user=mongoose.Types.ObjectId(JSON.parse(user));
        let vendorcustomers=await Usersubscription.aggregate([
            {$match:{vendor:user,status:false}},
            {$lookup:{
                from:'users',
                localField:'userid',
                foreignField:'_id',
                as:'customer_details'
            }},
            {$lookup:{
                from:'vendorproducts',
                localField:'productid',
                foreignField:'_id',
                as:'product_details'
            }},

        ]).allowDiskUse(true);
        res.status(200).json(successmessage('All Requests',vendorcustomers));
    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

exports.handlerequests=async(req,res)=>{
    try{
        console.log(req.body);
        let {sub_id,type}=req.body;
        if(!sub_id||!type){
            return res.status(400).json(errormessage("All fields must be present!"));
        }
        let {user}=req;
        user=mongoose.Types.ObjectId(JSON.parse(user));
        if(type==="accepted"){
            let updatedsub=await Usersubscription.findOneAndUpdate({_id:mongoose.Types.ObjectId(sub_id),vendor:user},{$set:{status:true}},{$new:true});
            return res.status(200).json(successmessage("Updated Successfuly!",updatedsub));
        }
        await Usersubscription.findOneAndDelete({_id:mongoose.Types.ObjectId(sub_id),vendor:user});
        res.status(200).json(successmessage(`Successfuly ${type}!`));
        
    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}