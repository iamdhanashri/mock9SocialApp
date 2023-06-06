

const bcrypt = require("bcrypt");

const express=require("express")

const jwt= require("jsonwebtoken");
const { UserModel } = require("../model/user.model");
const { authMiddleware } = require("../middleware/auth.middleware");
const userRouter=express.Router();



// user sign up 

userRouter.post("/register",(req,res)=>{
   const {name,email,password,dob,bio} =req.body
   try{
   bcrypt.hash(password,5,async(err,hash)=>{
    if(err){
        res.send({msg:"user resgistration failed",error:err.message})
    }else{
        const user = new UserModel({name,email,password:hash,dob,bio})
        await user.save()
        res.status(201).send("user registration successful")
    }
   })
   }
   catch(e){
    res.send({msg:"user resgistration failed",error:e.message})
   }
})



// user login 

userRouter.post("/login",async(req,res)=>{
    const {email,password}=req.body
    try{
   const user= await UserModel.find({email})
   if(user.length>0){
    bcrypt.compare(password,user[0].password,(err,result)=>{
        if(result){
            let token=jwt.sign({userID:user[0]._id},"masai")
            res.status(201).send({msg:"login successful",token:token})
        }else{
            res.send("user login failed")
        }
    })
   }
    }
    catch(e){
  res.send("wrong credentials")
    }
})


// get user 

userRouter.get("/users",async(req,res)=>{
    let user=await UserModel.find();
    res.status(200).send(user) 
})


// post perticular user by its id with their friends 

userRouter.post("/users/:id/friends",authMiddleware,async(req,res)=>{
    const {userId}=req.body

    const friendId=req.params.id
    const user=await UserModel.findById(userId)
    if(!user){
        res.send("user not found")
    }
    const fUser= await UserModel.findById(friendId)
    if(!fUser){
        res.send("friend not found")
    }
    if(user.friendRequests.includes(friendId || fUser.friendRequests.includes(userId))){
        res.send("request already send")
    }
    user.friendRequests.push(friendId)
    await user.save()
    res.status(201).send("friend req send success")
})


// get user id friends 

userRouter.get("/users/:id/friends",async(req,res)=>{
    const userId=req.params.id
    const user= await UserModel.findOne({_id:userId})
    res.status(200).send(user)
})



//  put users/:id/friends/:friendId 

userRouter.put("/users/:id/friends/:friendId",authMiddleware, async(req,res)=>{
   try {
    const userId = req.params.id;
    const friendId = req.params.friendId;
    const { status } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
    res.status(404).send("User not found");
    }

    const friendUser = await UserModel.findById(friendId);
    if (!friendUser) {
    res.status(404).send("Friend user not found");
    }

    if (!user.friendRequests.includes(friendId) || !friendUser.friendRequests.includes(userId)) {
        console.log()
       res.status(400).send("Friend request Acceped");
      }
  
      if (status === 'accepted') {
        user.friends.push(friendId);
        friendUser.friends.push(userId);
  
        user.friendRequests = user.friendRequests.filter((id) => id.toString() !== friendId);
        friendUser.friendRequests = friendUser.friendRequests.filter((id) => id.toString() !== userId);
  
        await user.save();
        await friendUser.save();
  
    } else if (status === 'rejected') {
        user.friendRequests = user.friendRequests.filter((id) => id.toString() !== friendId);
        friendUser.friendRequests = friendUser.friendRequests.filter((id) => id.toString() !== userId);
  
        await user.save();
        await friendUser.save();
  
      } 

   } catch (e) {
      res.send(e.message)
   
   }
})


module.exports={
    userRouter
}


