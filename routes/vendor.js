const express = require('express');
const router = express.Router();
const path =require('path');
const Vendorcontroller = require('../controllers/vendor');
const { auth } = require('../middleware/vendorauth');
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
    '/updatebankdetails',
    auth,
    upload.none(),
    Vendorcontroller.UpdatebankDetails
)

router.post(
    '/addproduct',
    auth,
    upload.none(),
    Vendorcontroller.addProduct
)

router.get(
    '/products',
    auth,
    //upload.none(),
    Vendorcontroller.getProducts
)

router.patch(
    '/editproduct',
    auth,
    upload.none(),
    Vendorcontroller.editProduct
)

module.exports=router;
