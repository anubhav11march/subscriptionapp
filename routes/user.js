const express = require('express');
const router = express.Router();
const path =require('path');
const Usercontroller = require('../controllers/user');
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
    '/signup',
    upload.none(),
    Usercontroller.UserSignUp
);
router.post(
    '/login',
    upload.none(),
    Usercontroller.LoginUser
);

router.post(
    '/updatedetails',
    auth,
    upload.none(),
    Usercontroller.UpdateDetails
)

router.get(
    '/categoryproducts',
    auth,
    upload.none(),
    Usercontroller.getCategoryProducts
)

router.get(
    '/categories',
    Usercontroller.getCategories
)

router.get(
    '/searchvendor',
    auth,
    Usercontroller.getVendors
)

module.exports=router;
