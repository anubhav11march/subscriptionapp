const Payment = require('../model/payment');
const { successmessage, errormessage, razorpay,randomDate } = require('../utils/util');
const mongoose = require('mongoose');
const User = require('../model/user');
const Subsciption = require('../model/usersubscription');
const shortid = require('shortid');
const crypto = require('crypto');
const usersubscription = require('../model/usersubscription');



exports.createSubscriptionorder = async (req, res) => {
    try {
        let { subscriptionId } = req.body;
        let { user } = req;
        user = mongoose.Types.ObjectId( JSON.parse(user));

        let user1 = await User.findOne({ _id: user });

        subscriptionId = mongoose.Types.ObjectId(subscriptionId);

        const subscription = await Subsciption.findOne({ _id: subscriptionId });

        if (!subscription) throw new Error('Subscription not avaliable ', 400, null)

        const options = {
            amount: subscription.amount,
            currency: 'INR',
            receipt: shortid.generate(), //any unique id
            notes: {
                desc: `Subscription purchased by ${user1.name}`,
            },
        }

        const response = await razorpay.orders.create(options);

        if (!response) throw new Error('Error in order creation', 400, null)

        res.status(200).json(response);
    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}


exports.PurchaseSubscription = async (req, res) => {
    try {
        let {
            orderCreationId, //from server response.id
            razorpayPaymentId, //returned by checkout from frontend
            razorpaySignature, //returned by checkout from frontend
            subscriptionId,
            vendorid
        } = req.body

        let { user } = req;
        user = mongoose.Types.ObjectId( JSON.parse(user));

        if (!orderCreationId)
            throw new Error('Order creation ID is requiered', 400, null)

        if (!razorpayPaymentId)
            throw new Error('razorpayPaymentId is requiered', 400, null)

        if (!razorpaySignature)
            throw new Error('razorpaySignature is requiered', 400, null)

        if (!subscriptionId) {
            throw new Error('subscriptionId is requiered', 400, null)
        }
        if (!vendorid) {
            throw new Error('vendorId is requiered', 400, null)
        }

        const subscription = await usersubscription.findById(mongoose.Types.ObjectId(subscriptionId));

        if (!subscription) throw new Error('Subscription not exists ', 400, null)

        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`)

        const digest = shasum.digest('hex');

        if (digest !== razorpaySignature) {
            throw new Error('Transaction is not legit', 400, null)
        } else if (digest === razorpaySignature) {
            const newPayment = new Payment({
                user,
                subscriptionid: mongoose.Types.ObjectId(subscriptionId),
                orderId: orderCreationId,
                paymentId: razorpayPaymentId,
                status: 'Payment Success',
                vendor:mongoose.Types.ObjectId(vendorid),
                paymentdate: randomDate(),
                amount: subscription.amount,
            })

            await newPayment.save();

            let subupdate = {
                ispayment: true,
                purchasedOn: Date.now()
            }

            const updatedsubscription = await usersubscription.findOneAndUpdate({ _id: mongoose.Types.ObjectId(subscriptionId) }, { $set: subupdate }, { new: true })
            if (!updatedsubscription) {
                return res.status(400).json(errormessage("Something went wrong!"));
            }
            // const newUserCourse = await UserCourses.create({
            //   user: req.user._id,
            //   teacher: course.teacher,
            //   course: courseId,
            //   payment: newPayment._id,
            //   purchasedOn: new Date(),
            //   validTill: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
            // })



            // const newConversion = await Conversations.create({
            //   members: [{ user: req.user._id }, { user: course.teacher }],
            //   userCourse: newUserCourse._id,
            //   createdAt: new Date(),
            // })

            res.status(200).json(successmessage("Updated Payment Successfuly!", updatedsubscription))
        }


    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.getSalestoday=async(req,res)=>{
    try{
        let {user}=req;
        user=mongoose.Types.ObjectId(user);

        let saletoday=await Payment.aggregate([
            {$match:{vendor:user,paymentdate:randomDate(),status:true}},
            {$group:{
                _id:"$date",
                salestoday:{$sum:"$amount"}
            }},
            {$project:{
                salestoday:1
            }}
            // {$lookup:{
            //     from:'usersubscriptions',
            //     localField:'subscriptionid',
            //     foreignField:'_id',
            //     as:'subscription_details'
            // }}
        ]).allowDiskUse(true);

        res.status(200).json(successmessage('Sale Today',saletoday));

    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}