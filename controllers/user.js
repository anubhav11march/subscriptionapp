const User = require('../model/user');
const { generateToken, hashPassword, successmessage,
    errormessage, verifypassword, getCategories, sendForgotEmail
} = require('../utils/util');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid')
const path = require('path');
const mongoose = require('mongoose');
const vendorproduct = require('../model/vendorproduct');

exports.UserSignUp = async (req, res) => {
    try {
        console.log(req.body);
        let { phoneno, password, type } = req.body;
        if (!phoneno || !password || !type) {
            return res.status(400).json(errormessage("All fields must be present"));
        }

        // username = username.trim();
        password = password.trim();
        // email = email.trim();
        phoneno = phoneno.trim();

        //checking if phoneno exists already
        let ismatch = await User.findOne({ phoneno });
        if (ismatch) {
            return res.status(400).json(errormessage("Phoneno already registered! "));
        }

        //checking if email exists already and verified
        // let ismatch1 = await User.findOne({ email, status: true });
        // if (ismatch1) {
        //     return res.status(400).json(errormessage("Email already registered and verified! Login to proceed!"));
        // }



        // checking valid phone no.
        let reg = "(?:(?:\\+|0{0,2})91(\\s*[\\-]\\s*)?|[0]?)?[789]\\d{9}";
        let phonereg = new RegExp(reg);
        console.log(phonereg.test(phoneno));
        if (!phonereg.test(phoneno)) {
            return res.status(400).json(errormessage("Enter valid Phone Number"));
        }

        //hashing the password
        let hashedpassword = hashPassword(password);

        let confirmationcode = Math.floor(1000 + Math.random() * 9000);

        let user = new User({
            password: hashedpassword,
            phoneno,
            isVendor: type === "vendor" ? true : false
        });

        //generating token
        const token = generateToken(JSON.stringify(user._id));

        await user.save();

        // let result = await sendRegisterEmail(user.email, user.confirmationcode, user.username);
        // console.log(result);
        // if (result.error) {
        //     console.log("Email not sent!");
        //     return res.status(200).json(errormessage("Email not sent!"));
        // }

        res.status(200).json(successmessage("User Created!", token));

    } catch (err) {
        res.status(400).json(errormessage(err.message))
    }
}

exports.LoginUser = async (req, res) => {
    try {
        console.log(req.headers);
        let { userinfo, password } = req.body;

        if (!userinfo || !password ) {
            return res.status(400).json(errormessage("All fields should be present!"));
        }

        userinfo = userinfo.trim();
        password = password.trim();

        // check whether email exists or not
        let user = await User.findOne({ $or: [{ email: userinfo }, { phoneno: userinfo }] });
        if (!user) {
            return res.status(400).json(errormessage("Email,phoneno or password incorrect!"));
        }

        // if (type === "vendor" && !user.isVendor) {
        //     return res.status(400).json(errormessage("Login as Vendor failed!"));
        // }

        // if (type === "user" && user.isVendor) {

        // }

        if (!verifypassword(password, user.password)) {
            return res.status(400).json(errormessage("Email or password incorrect!"));
        }

        //checking whether verified email or not
        // if (!user.status) {
        //     return res.status(400).json(errormessage("Email not Verified! Please verify your mail!"));
        // }


        let token = generateToken(JSON.stringify(user._id));
        let type=user.isVendor?"vendor":"buyer";

        res.status(200).json(successmessage("Logged In Successfuly!", {token,type}));

    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.UpdateDetails = async (req, res) => {
    try {
        let { user } = req;
        let { name, email, address, pincode, type, shopname, bio } = req.body;

        if (!name || !email || !address || !pincode || !type) {
            return res.status(400).json(errormessage('All fields should be present!'));
        }

        if(type==="vendor"){
            if(!shopname){
                return res.status(400).json(errormessage('All fields should be present!'));
            }
            if(!bio){
                return res.status(400).json(errormessage('All fields should be present!'));
            }
        }



        let pinregex = new RegExp("^[1-9]{1}[0-9]{2}[0-9]{3}$");
        if (!pinregex.test(pincode)) {
            return res.status(400).json(errormessage("Enter valid pincode!"));
        }
        user = mongoose.Types.ObjectId(JSON.parse(user));
        let updates = {
            name,
            email,
            address,
            pincode
        };

        let findConditions={
            _id:user
        };

        if(type==="vendor"){
            updates.shopname=shopname;
            updates.bio=bio;
            findConditions['isVendor']=true;
        }

        let updatedUser = await User.findOneAndUpdate(findConditions, { $set: updates }, { new: true });
        if(!updatedUser){
            return res.status(400).json(errormessage("Something went wrong!"));
        }
        res.status(200).json(successmessage('Updated Successfuly!', updatedUser));
    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.getCategoryProducts=async(req,res)=>{
    try{
        let {category}=req.params;
        
        let findConditions={};
        if(category){
            findConditions={
                category
            };
        }
        let products=await vendorproduct.find(findConditions);
        res.status(200).json(successmessage(products));
    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

exports.getCategories=async(req,res)=>{
    res.status(200).json(successmessage("All categories",getCategories));
}

exports.getVendors=async(req,res)=>{
    try{
        let {phoneno}=req.query;

        let findConditions={};
        if(phoneno){
            phoneno=phoneno.trim();
            findConditions.phoneno=phoneno;
        }

        let vendor=await User.findOne({phoneno});
        if(!vendor){
            return res.status(404).json(successmessage("No Vendor found!"));
        }
        res.status(200).json(successmessage("Vendor Details",vendor));


    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}

exports.forgotpassword = async (req, res) => {
    try {
        let { phoneno } = req.body;
        if (!phoneno) {
            return res.status(400).json(successmessage("Phoneno field should be given!"));
        }
        phoneno=phoneno.trim();
        let user = await User.findOne({ phoneno });
        if (!user) {
            return res.status(400).json(errormessage("User not found with the given phoneno!"));
        }
        let confirmationcode = Math.floor(1000 + Math.random() * 9000);
        user.confirmationcode = confirmationcode;
        if(!user.email){
            return res.status(400).json(errormessage("No Email associated with this account!"));
        }
        await sendForgotEmail(user.email, user.username, confirmationcode);
        await user.save();
        res.status(200).json(successmessage("Reset mail sent! Check your emailid!"));

    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.resetPassword = async (req, res) => {

    try {
        let { phoneno, password } = req.body;

        if (!phoneno || !password) {
            return res.status(400).json(errormessage("Provide email or password"));
        }

        let user = await User.findOne({ phoneno });
        if (!user) {
            return res.status(400).json(errormessage("No user found!"));
        }

        //hashing the password
        let hashedpassword = hashPassword(password);
        let updatedUser = await User.findOneAndUpdate({ phoneno }, { $set: { password: hashedpassword } }, { new: true });
        res.status(200).json(successmessage("Password Reset Successful!", updatedUser));
    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.verifyCode = async (req, res) => {
    try {
        let { code, phoneno } = req.body;

        if (!code || !phoneno ) {
            return res.status(400).json(errormessage("All fields must be present!"));
        }

        let findConditions = {
            phoneno
        };

        findConditions['confirmationcode'] = code;

        let user = await User.findOne(findConditions);
        if (!user) {
            return res.status(404).json(errormessage("Not Valid code!"));
        }

        // user.status = true;
        // await user.save();
        res.status(200).json(successmessage("Verified Succesfuly!", user))
    } catch (err) {
        res.status(400).json(errormessage(err.message));
    }
}

exports.getUserdetails=async(req,res)=>{
    try{

        let {user}=req;
        console.log(user);
        user=mongoose.Types.ObjectId( JSON.parse(user));
        let user1=await User.findOne({_id:user});
        if(!user1){
            return res.status(404).json(errormessage("User not found!"));
        }
        res.status(200).json(successmessage("user Details",user1));

    }catch(err){
        res.status(400).json(errormessage(err.message));
    }
}