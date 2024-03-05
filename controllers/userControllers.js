
const User = require("../models/user.model")
const HttpError = require("../models/errorModel")
const bcrypt= require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require('fs')
const path = require("path")
const {v4:uuid}= require('uuid')
require('dotenv').config()


//==================Register a new user
//POST :api/users/register
//UNPROTECTED
const registerUser =async (req,res,next)=>{
    try {
        const {name,email,password,avatar,posts,confirmPassword}= req.body
        if(!name || !email || !password ){
            return next(new HttpError("Name Email and Password are required fields.",422))
        }

        const newEmail = email.toLowerCase();
        const emailExists = await User.find({email:newEmail})
        //console.log(emailExists)
        if(emailExists.length>0){
            return next(new HttpError("Email already exists.",422))
        }
        if((password.trim()).length<6){
            return next(new HttpError("Password must be atleast 6 characters.",422))
        }
        if(password != confirmPassword){
            return next(new HttpError("Password and Confirm Password must be same.",422))
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password,salt)
        const newUser = await User.create({
            name,email:newEmail,password:hashedPass,
        })
        res.status(200).json(newUser)



        
    } catch (error) {
        return next(new HttpError("User Registration Failed",422))
        
    }
}

//==================Login a existing user
//POST :api/users/login
//UNPROTECTEd
const loginUser = async (req,res,next)=>{
  try {
    const {email,password}=req.body
    if(!email || !password){
        return next(new HttpError("All Fields(Email and Password) are required",422))
    }
    const newEmail = email.toLowerCase();
    const user = await User.find({
        email:newEmail
    })
    if(user.length==0){
        return next(new HttpError("User  not existed",422))
    }
    const hashedPass = user[0].password
    const comparePassword= await bcrypt.compare(password,hashedPass)
    if(!comparePassword){
        return next(new HttpError("Wrong Password",422))

    }
    
    const {id:id,name} =user[0]
    const token = jwt.sign({
        id,name
    },process.env.JWT_SECRET,{expiresIn:"1d"})

    res.status(200).json({token,id,name})
    
    
 
    
    
  } catch (error) {
    return next(new HttpError("User Login Failed",422))
    
  }
    
}



//==================USER PROFILE
//GET :api/users/:id => DYNAMIC URI
//PROTECTED
const getUser = async (req,res,next)=>{
    try {
        const {id} = req.params
        const user = await User.findById(id).select('-password')
        if(!user){
            return next(new HttpError("User not Found",404))
        }
        res.status(200).json(user)
        
    } catch (error) {
        return next(new HttpError(error))
        
    }

}


//==================Change USer avatar===
//POST :api/users/change-avatar
//PROTECTED
const changeAvatar =async (req,res,next)=>{
    try {
          if(!req.files.avatar){
            return next(new HttpError("Please choose an image.",422))
          }
        
          //fetch the current logged in User .
          //check if it has already an existing avatar.
          //if yes => delete the existing avatar and upload a new one .
        //Finding User from a database.
        const user = await User.findById(req.user.id)
        // delete old avatar if exists.
        if(user.avatar){
            fs.unlink(path.join(__dirname,'..','uploads',user.avatar),(err)=>{
                if(err){
                    return next(new HttpError(err))
                }    

            })
        }
        const {avatar} = req.files
        //check file size.
        if(avatar.size>500000){
            return next(new HttpError("Profile picture is too big.SHould be less than 500kb"),422)
        }
        let fileName 
        fileName= avatar.name
        let splittedFilename = fileName.split('.')
        let newFileName = splittedFilename[0]+ uuid()+'.'+splittedFilename[splittedFilename.length-1]
         avatar.mv(path.join(__dirname,'..','uploads',newFileName),async (err)=>{
            if(err){
                return next(new HttpError(err))
                
            }
            const updateAVatar = await User.findByIdAndUpdate(req.user.id,{avatar:newFileName},{new:true})
                  if(!updateAVatar){
                    return next(new HttpError("Avatar couldn,t be changed",422))
                  }
                  res.status(200).json(updateAVatar)
         })


    } catch (error) {
        return next(new HttpError(error))
        
    }
}


//==================Edit USer details===
//PATCH :api/users/edit-user
//PROTECTED
const editUser =async (req,res,next)=>{
    try {
        const {name,email,currentPassword,newPassword,newConfirmPassword} = req.body
        if(!name || !email || !email || !currentPassword || !newPassword || !newConfirmPassword){
            return next(new HttpError("All the fields are required.",422))
        } 
        //get user from database.   
        const user = await User.findById(req.user.id)    
        if(!user){
            return next(new HttpError("User not found.",403))
        }
        //make sure new email doesnot already exists.
        const emailExists = await  User.findOne({email})
        //Update other details with / without changing the email(which is a unique id because we use it to login.)
        
        if(emailExists &&(emailExists._id != req.user.id)){
            return next(new HttpError("Email already exists",422))
        }
        if(email != user.email){
            return next(new HttpError("Enter correct email. Email is not changeable.",422))
        }
        //compare current password to databasepassword.
        const validateUserPassword = await bcrypt.compare(currentPassword,user.password)
        if(!validateUserPassword){
            return next(new HttpError("Invalid current password.",422))
        }
        //compare new passwords.
        if(newPassword != newConfirmPassword){
            return next(new HttpError("New Password and ConfirmPassword must be same.",422))
        }

        //hash new Password.
        const salt = await bcrypt.genSalt(10)
        const newhashedPass = await bcrypt.hash(newPassword,salt) 

        //Update User info in database.
        const newInfo = await User.findByIdAndUpdate(req.user.id,{name,email:user.email,password:newhashedPass},{new:true})
        res.status(200).json(newInfo)



    } catch (error) {
        return next(new HttpError(error))
        
    }



}

//==================GET AUTHORS
//Get :api/users/
//PROTECTED
const getAuthors =async (req,res,next)=>{
    try {
        const authors = await User.find().select('-password')
        res.json(authors)
    } catch (error) {
        return next(new HttpError(error))
        
    }
}

module.exports={
    registerUser,getAuthors,changeAvatar,editUser,loginUser,getUser
}