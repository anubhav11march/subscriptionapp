// const Payment = require('../model/payment');
// const { successmessage, errormessage,razorpay } = require('../utils/util');
// const mongoose = require('mongoose');
// const User = require('../model/user');
// const Subsciption=require('../model/usersubscription');


// exports.createSubscriptionorder = async (req, res) => {
//     try {
//         const { subscriptionId } = req.body;
//         subscriptionId=mongoose.Types.ObjectId(subscriptionId);

//         const course = await Subsciption.findOne({_id:subscriptionId});

//         if (!course) throw new Error('Course not avaliable ', 400, null)

//         const options = {
//             amount: course.price * 100,
//             currency: 'INR',
//             receipt: shortid.generate(), //any unique id
//             notes: {
//                 desc: `Course purchased by ${req.user._id}`,
//             },
//         }

//         const response = await razorpay.orders.create(options);

//         if (!response) throw new Error('Error in order creation', 400, null)

//         return res.status(200).json(response)
//     } catch (err) {
//         res.status(400).json(errormessage(err.message));
//     }
// }


// exports.PurchaseSubscription = async (req, res) => {
//     try {
//         const {
//             orderCreationId, //from server response.id
//             razorpayPaymentId, //returned by checkout from frontend
//             razorpaySignature, //returned by checkout from frontend
//             subsciptionId,
//         } = req.body

//         if (!orderCreationId)
//             throw new Error('Order creation ID is requiered', 400, null)

//         if (!razorpayPaymentId)
//             throw new Error('razorpayPaymentId is requiered', 400, null)

//         if (!razorpaySignature)
//             throw new Error('razorpaySignature is requiered', 400, null)

//         if (!Validations.isValidMongoObjectId(courseId))
//             throw new Error('Course Id is not valid', 400, null)



//     } catch (err) {
//         res.status(400).json(errormessage(err.message));
//     }
// }