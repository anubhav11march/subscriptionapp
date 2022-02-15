const Usersubscription = require('../model/usersubscription');
const Vendorproduct = require('../model/vendorproduct');
const { successmessage, errormessage } = require('../utils/util');
const mongoose = require('mongoose');
const User=require('../model/user');
const { getCategories, randomDate,todayDate} = require('../utils/util');

exports.Subscribe = async (req, res) => {
    try {
        let { user } = req;
        let { productid, quantity, interval, amount, productname, category, priceperquantity,vendorphoneno } = req.body;

        if ( !quantity || !interval || !amount || !productname || !category || !priceperquantity||!vendorphoneno) {
            return res.status(400).json(errormessage("All fields should be present!"));
        }

        user = mongoose.Types.ObjectId(JSON.parse(user));

        vendorphoneno=vendorphoneno.trim();
        let vendordetails=await User.findOne({phoneno:vendorphoneno});
        if(!vendordetails){
            return res.status(404).json(errormessage("No Vendor Found!"));
        }
        if (!getCategories.includes(category)) {
            return res.status(400).json(errormessage("Category Invalid!"));
        }

        productname = productname.trim();
        productname=productname.toLowerCase();

        const isMatch = await Usersubscription.findOne({ userid: user, productName:productname });
        if (isMatch) {
            return res.status(200).json(errormessage('You have already subscribed to this product!'));
        }

        let usersubscribe = new Usersubscription({
            // productid: mongoose.Types.ObjectId(productid),
            productName: productname,
            category,
            priceperquantity,
            userid: user,
            quantity: parseInt(quantity),
            interval,
            amount: parseInt(amount),
            vendor: vendordetails._id,
            status: false,
            duedate:todayDate()
        });

        await usersubscribe.save();
        res.status(200).json(successmessage('Successfuly Subscribed!', usersubscribe));

    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.getSubscriptions = async (req, res) => {
    try {
        let { user } = req;
        user = mongoose.Types.ObjectId(JSON.parse(user));
        let subscribedproducts = await Usersubscription.aggregate([
            { $match: { userid: user } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'vendor',
                    foreignField: '_id',
                    as: "vendor_details"
                }
            }
            // {
            //     $group: {
            //         _id:"$userid",
            //         products: { $push: "$productid" }
            //     }
            // },
            // {
            //     $lookup: {
            //         'from': 'vendorproducts',
            //         'let': { 'uid': '$products' },
            //         'pipeline': [
            //             { '$match': { '$expr': { '$in': ['$_id', '$$uid'] } } },
            //         ],
            //         'as': 'productdata'
            //     }
            // },
            // {
            //     $project:{
            //         products:"$productdata"
            //     }
            // }
        ]).allowDiskUse(true);

        res.status(200).json(successmessage('User Subscriptions', subscribedproducts));

    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.editSubscription = async (req, res) => {
    try {
        let { user } = req;
        user = mongoose.Types.ObjectId(JSON.parse(user));
        let { subid, quantity, interval, amount } = req.body;
        productid = mongoose.Types.ObjectId(productid);

        let findConditions = {
            _id: mongoose.Types.ObjectId(subid),
            userid: user
        }

        let subdetails = await Usersubscription.findOne(findConditions);
        if (!subdetails) {
            return res.status(400).json(errormessage('No Subscription found with this user!'));
        }

        let updates = {
            quantity,
            interval,
            amount
        }

        let usersub = await usersubscription.findOneAndUpdate(findConditions, { $set: updates }, { $new: true });

        res.status(200).json(successmessage('Subscription Updated successfully!', usersub));

    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.getSubscription = async (req, res) => {
    try {
        let { user } = req;
        user = mongoose.Types.ObjectId(JSON.parse(user));
        let { subid } = req.query;

        let subscriptiondetails = await Usersubscription.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(subid) } },
            {
                $lookup: {
                    from: 'vendorproducts',
                    foreignField: '_id',
                    localField: 'productid',
                    as: 'product_details'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'vendor',
                    as: 'vendor_details'
                }
            },
            {$addFields:{product_details:{ $first: "$product_details" }}},
            {$addFields:{vendor_details: { $first: "$vendor_details" }}},
        ]).allowDiskUse(true);

        res.status(200).json(successmessage("Subscription Details", subscriptiondetails));

    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.addCustomSubscription=async(req,res)=>{
    try{
        let { user } = req;
        let {  vendorname,quantity, interval, amount, productname, category, priceperquantity,vendorphoneno } = req.body;

        if ( !vendorname||!quantity || !interval || !amount || !productname || !category || !priceperquantity||!vendorphoneno) {
            return res.status(400).json(errormessage("All fields should be present!"));
        }

        user = mongoose.Types.ObjectId(JSON.parse(user));

        vendorphoneno=vendorphoneno.trim();
        vendorname=vendorname.trim();

        // checking valid phone no.
        let reg = "(?:(?:\\+|0{0,2})91(\\s*[\\-]\\s*)?|[0]?)?[789]\\d{9}";
        let phonereg = new RegExp(reg);
        console.log(phonereg.test(vendorphoneno));
        if (!phonereg.test(vendorphoneno)) {
            return res.status(400).json(errormessage("Enter valid Phone Number"));
        }

        // let vendordetails=await User.findOne({phoneno:vendorphoneno});
        // if(!vendordetails){
        //     return res.status(404).json(errormessage("No Vendor Found!"));
        // }
        if (!getCategories.includes(category)) {
            return res.status(400).json(errormessage("Category Invalid!"));
        }

        productname = productname.trim();
        productname=productname.toLowerCase();

        const isMatch = await Usersubscription.findOne({ userid:user,vendorphoneno, productName:productname });
        if (isMatch) {
            return res.status(200).json(errormessage('You have already subscribed to this product! Change Product Name!'));
        }

        let usersubscribe = new Usersubscription({
            // productid: mongoose.Types.ObjectId(productid),
            vendorname,
            vendorphoneno,
            productName: productname,
            category,
            priceperquantity,
            userid: user,
            quantity: parseInt(quantity),
            interval,
            amount: parseInt(amount),
            status: false,
            isCustom:true
        });

        await usersubscribe.save();
        res.status(200).json(successmessage('Successfuly Subscribed!', usersubscribe));
    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

exports.postUndelivered=async(req,res)=>{
    try{
        let {date,sub_id}=req.body;
        if(!date||!sub_id){
            return res.status(400).json(errormessage("All fields should be present!"));
        }
        // console.log('hello',date)
        date=randomDate(date);
        console.log(date);
        let updates={
            $push:{notdelivered:date}
        }

        let updatedSubscription=await Usersubscription.findOneAndUpdate({_id:mongoose.Types.ObjectId(sub_id)},updates,{new:true});
        if(!updatedSubscription){
            return res.status(400).json(errormessage("SOmething Went Wrong!"));
        }

        res.status(200).json(successmessage(updatedSubscription));

    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

exports.getVendorSubscriptions=async(req,res)=>{
    try{
        let { user } = req;
        user = mongoose.Types.ObjectId(JSON.parse(user));
        let subscribedproducts = await Usersubscription.aggregate([
            { $match: { vendor: user } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'vendor',
                    foreignField: '_id',
                    as: "vendor_details"
                }
            }
        ]).allowDiskUse(true);

        res.status(200).json(successmessage('Vendor Subscriptions', subscribedproducts));
    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

// exports.getCalender=async(req,res)=>{
//     try{
//         let {subid}=req.body;
//         if(!subid){
//             return res.status(400).json(errormessage(err.message));
//         }

//         subid=mongoose.Types.ObjectId(subid);
//         await Usersubscription.aggregate([
//             {$match:{_id:subid}},
//             {}
//         ])

//     }catch(err){
//         res.status(400).json(errormessage(err.message));
//     }
// }

exports.postdelivereddate=async(req,res)=>{
    try{
        let {date,sub_id}=req.body;

        if(!date||!sub_id){
            return res.status(400).json(errormessage("All fields should be present!"));
        }
        date=randomDate(date);

        let updates={
            $push:{delivereddates:date}
        }

        let updatedSubscription=await Usersubscription.findOneAndUpdate({_id:mongoose.Types.ObjectId(sub_id)},updates,{new:true});
        if(!updatedSubscription){
            return res.status(400).json(errormessage("SOmething Went Wrong!"));
        }

        res.status(200).json(successmessage(updatedSubscription));

    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

exports.putonhold=async(req,res)=>{
    try{
        let {sub_id,status}=req.body;

        if(!sub_id){
            return res.status(400).json(errormessage("All fields should be present!"));
        }  
        
        let updatedsub=await Usersubscription.findOneAndUpdate({_id:mongoose.Types.ObjectId(sub_id)},{$set:{ishold:status}},{new:true})
        
        if(!updatedsub){
            return res.status(400).json(errormessage("SOmething Went Wrong!"));
        }

        res.status(200).json(successmessage(updatedsub));

    }catch(err){
        res.status(400).json(err.message);
    }
}
