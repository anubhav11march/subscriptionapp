const express=require('express');
const router=express.Router();
const {auth}=require('../middleware/userauth');
const PaymentController=require('../controllers/payment');

router.post(
    '/purchase/subsciption',
    auth,
    PaymentController.PurchaseSubscription
)