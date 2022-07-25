const userModel = require("../models/userModel.js");
const file =  require("../controllers/aws.js");
const bcrypt = require ('bcrypt');


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if(typeof value != "string") return false;
    return true;
};
const isValid1 = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if(typeof value != "number") return false;
    return true;
};
const createUser = async function(req,res){
    try{
    const { fname,lname,email, profileImage, phone,password, address} = req.body
    if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "please enter details" })

    if (!isValid(fname)) return res.status(400).send({ status: false, message: "please enter fname" })

    if (!isValid(lname)) return res.status(400).send({ status: false, message: "please enter lname" })

    if (!isValid(email)) return res.status(400).send({ status: false, message: "please enter email" })
    const usedEmail = await userModel.findOne({email:email})
    if(usedEmail) return res.status(409).send({ status: false, message: "emailId is already used" })

//===================================Imagefile validation==========================//
    const files = req.files[0];
    if(!files) return res.status(400).send({ status: false, message: "please enter profileImage" })
    const  fileType = files['type'];
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    if (!validImageTypes.includes(fileType)) return res.status(400).send({ status: false, message: "Please enter valid image file" })
         //********uploading image to aws*******/
    const uploadImage  = await file.uploadFile(files)
    req.body.profileImage = uploadImage;
//==================================phone validations============================//
    if (!isValid(phone)) return res.status(400).send({ status: false, message: "please enter phone number" })
    if (!/^[0-9]{10}$/.test(phone)) return res.status(400).send({ status: false, message: "please enter valid phone number" })
    const usedNumber = await userModel.findOne({ phone: phone })
    if (usedNumber) return res.status(409).send({ status: false, message: " Phone number is already exist" })
//===========================password validation===================================//
    if (!isValid(password)) return res.status(400).send({ status: false, message: "please enter password" })
    if (!/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password)) return res.status(400).send({ status: false, message: "Please enter strong password of atleast 8 character, It should contain atleast One Capital letter , one lower case letter and special character ," })
                 //******password hashing and salting **********/
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, function(err, hash) {
        req.body.password = hash
      });

//============================address validations================================//
      if(Object.keys(address).length != 2)return res.status(400).send({ status: false, message: "Shipping or billing address is missing" })
               //******shipping validation**************//
      const shipping = address.shipping
      if(Object.keys(shipping).length != 3)return res.status(400).send({ status: false, message: "Some shipping details is missing" })
      const {street , city , pincode} = shipping
      if (!isValid(street)) return res.status(400).send({ status: false, message: "please enter street details" });
      if (!isValid(city)) return res.status(400).send({ status: false, message: "please enter city" });
      if (!isValid1(pincode)) return res.status(400).send({ status: false, message: "please enter phone number" });
      if(!/^[1-9]{1}[0-9]{2}\\s{0, 1}[0-9]{3}$/.test(pincode)) return res.status(400).send({ status: false, message: "please enter valid pincode" })
      
      //******billing validation**************//
      const billing = address.billing
      if(Object.keys(billing).length != 3)return res.status(400).send({ status: false, message: "Some billing details is missing" })
      const {street1 , city1 , pincode1} = billing
      if (!isValid(street1)) return res.status(400).send({ status: false, message: "please enter street details" });
      if (!isValid(city1)) return res.status(400).send({ status: false, message: "please enter city" });
      if (!isValid1(pincode1)) return res.status(400).send({ status: false, message: "please enter phone number" });
      if(!/^[1-9]{1}[0-9]{2}\\s{0, 1}[0-9]{3}$/.test(pincode1)) return res.status(400).send({ status: false, message: "please enter valid pincode" })


      let user = await userModel.create(data)
      return res.status(201).send({ status: true, message: "User created successfully", data: user })
  } catch (err) {
      return res.status(500).send({ status: false, message: err.message })
  }
}

   /////user Login /////
const userLogin = async function (req,res){
    let data = req.body;
    
    let userName = data.email;

    let password = data.password;

    if (!isValid(userName) || !isValid(password)) 
     return res.status(400).send({status:false,msg:"Provide emailId and Password both"});

     let user = await userModel.findOne({ $and: [{ email: userName, password: password }] });

     if(!user){
        return res.status(400).send({status:false,msg:"EmailId or Password is Wrong"})
     }

     let token = jwt.sign({
        userId: user._id.toString()
    }, "functionup-radon",
    {
        expiresIn: "1h"
    });

    res.status(200).send({ status: true, msg: "success", userId:user._id ,token: token })


}



module.exports.createUser =  createUser
module.exports.userLogin  = userLogin
