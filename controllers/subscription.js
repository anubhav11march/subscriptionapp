const Usersubscription = require('../model/usersubscription');
const Vendorproduct = require('../model/vendorproduct');
const { successmessage, errormessage } = require('../utils/util');
const mongoose = require('mongoose');
const usersubscription = require('../model/usersubscription');

exports.Subscribe = async (req, res) => {
    try {
        let { user } = req;
        let { productid, quantity, interval, amount } = req.body;

        if (!productid || !quantity || !interval || !amount) {
            return res.status(400).json(errormessage("All fields should be present!"));
        }

        user = mongoose.Types.ObjectId(JSON.parse(user));
        const product = await Vendorproduct.findOne({ _id: mongoose.Types.ObjectId(productid) });

        const isMatch = await Usersubscription.findOne({ userid: user, productid: mongoose.Types.ObjectId(productid) });
        if (isMatch) {
            return res.status(200).json(errormessage('You have already subscribed to this product!'));
        }

        let usersubscribe = new Usersubscription({
            productid: mongoose.Types.ObjectId(productid),
            userid: user,
            quantity: parseInt(quantity),
            interval,
            amount: parseInt(amount),
            vendor: product.vendorid,
            status:false
        });

        await usersubscribe.save();
        res.status(200).json(successmessage('Successfuly Subscribed!',usersubscribe));

    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.getSubscriptions = async (req, res) => {
    try {
        let {user}=req;
        user=mongoose.Types.ObjectId(JSON.parse(user));
        let subscribedproducts = await Usersubscription.aggregate([
            {$match:{userid:user}},
            {
                $group: {
                    _id:"$userid",
                    products: { $push: "$productid" }
                }
            },
            {
                $lookup: {
                    'from': 'vendorproducts',
                    'let': { 'uid': '$products' },
                    'pipeline': [
                        { '$match': { '$expr': { '$in': ['$_id', '$$uid'] } } },
                    ],
                    'as': 'productdata'
                }
            },
            {
                $project:{
                    products:"$productdata"
                }
            }
        ]).allowDiskUse(true);

        res.status(200).json(successmessage('User Subscriptions',subscribedproducts));

    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.editSubscription=async(req,res)=>{
    try{
        let {user}=req;
        user=mongoose.Types.ObjectId(JSON.parse(user));
        let {productid,quantity,interval,amount}=req.body;
        productid=mongoose.Types.ObjectId(productid);

        let findConditions={
            productid,
            userid:user
        }

        let subdetails=await Usersubscription.findOne(findConditions);
        if(!subdetails){
            return res.status(400).json(errormessage('No Subscription found with this user!'));
        }

        let updates={
            quantity,
            interval,
            amount
        }

        let usersub=await usersubscription.findOneAndUpdate(findConditions,{$set:updates},{$new:true});

        res.status(200).json(successmessage('Subscription Updated successfully!',usersub));

        }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

exports.getSubscription=async(req,res)=>{
    try{
        let {user}=req;
        user=mongoose.Types.ObjectId(JSON.parse(user));
        let {subid}=req.query;

        let subscriptiondetails=await Usersubscription.aggregate([
            {$match:{_id:mongoose.Types.ObjectId(subid)}},
            {$lookup:{
                from:'vendorproducts',
                foreignField:'_id',
                localField:'productid',
                as:'product_details'
            }},
            {$lookup:{
                from:'users',
                foreignField:'_id',
                localField:'vendor',
                as:'vendor_details'
            }},
            {$project:{
                quantity:"$quantity",
                interval:"$interval",
                amount:"$amount",
                product_details:{$first:"$product_details"},
                vendor_details:{$first:"$vendor_details"}
            }}
        ]).allowDiskUse(true);

        res.status(200).json(successmessage("Subscription Details",subscriptiondetails));

    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

