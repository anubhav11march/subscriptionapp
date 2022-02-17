const express=require('express');
const router=express.Router();
const {auth}=require('../middleware/userauth');
const PaymentController=require('../controllers/payment');
const multer=require('multer');
const upload=multer({});


router.post(
    '/createsubsciptionorder',
    auth,
    upload.none(),
    PaymentController.createSubscriptionorder
)

router.post(
    '/subsciption',
    auth,
    upload.none(),
    PaymentController.PurchaseSubscription
)

module.exports=router