const express = require('express');
const router = express.Router();
const path =require('path');
const Subscriptioncontroller = require('../controllers/subscription');
const { auth } = require('../middleware/userauth');
const multer=require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname,'../uploads'));
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname)
    }
})
console.log( path.join(__dirname,'../uploads') )
const upload=multer({storage});

router.post(
    '/subscribe',
    auth,
    upload.none(),
    Subscriptioncontroller.Subscribe
);

router.get(
    '/getusersubscription',
    auth,
    Subscriptioncontroller.getSubscriptions
)

router.patch(
    '/editsubscription',
    auth,
    upload.none(),
    Subscriptioncontroller.editSubscription
)

router.post(
    '/addcustomsubscription',
    auth,
    upload.none(),
    Subscriptioncontroller.addCustomSubscription
)



module.exports=router;

