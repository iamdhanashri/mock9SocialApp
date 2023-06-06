
const bcrypt = require("bcrypt");

const express=require("express")

const jwt= require("jsonwebtoken");
const { PostModel } = require("../model/post.model");
const { UserModel } = require("../model/user.model");
const { authMiddleware } = require("../middleware/auth.middleware");

const postRouter=express.Router();

postRouter.post("/posts",authMiddleware,async(req,res)=>{
    const { text, image,userId } = req.body;
    const post = await PostModel.create({
      user: userId,
      text,
      image,
    });
   console.log("userId",userId)
    await UserModel.findByIdAndUpdate(userId, { $push: { posts: post._id } });
    res.status(201).send("Post created successfully");
})

postRouter.get("/posts",async(req,res)=>{
    let post=await PostModel.find();
    res.status(200).send(post) 
})


postRouter.put("/posts/:id",authMiddleware, async (req, res) => {
    const { text, image,userId } = req.body;
    const postId = req.params.id;

    const post = await PostModel.findById(postId);
    if (!post) {
       res.status(404).send("Post not found");
    }

    if (post.user.toString() !== userId) {
       res.status(403).send("Forbidden");
    }

    await PostModel.findByIdAndUpdate(postId, { text, image });

    res.status(204).send("Post Updated successfully");

})

postRouter.delete("/posts/:id", authMiddleware, async (req, res) => {
    const id = req.params.id;
    const post = await PostModel.findOne({ "_id": id });
    const userId_in_post = post.user
    const userId_in_req = req.body.userId
    try {
        if (userId_in_req == userId_in_post) {
            await PostModel.findByIdAndDelete({ _id: id })
            res.send("Post Deleted successfully");

        }
        else {
            res.send("You are not Authorized ");

        }

    } catch (e) {
        res.send("Something went wrong  ");

    }
})

postRouter.post("/posts/:id/like", authMiddleware, async(req,res)=>{

    const postId = req.params.id;
    const {userId} = req.body;

    const post = await PostModel.findById(postId);
    if (!post) {
     res.status(404).send("Post not found");
    }

    if (post.likes.includes(userId)) {
       res.status(400).send("Post already liked");
    }

    post.likes.push(userId);
    await post.save();

    res.status(201).send("Post liked successfully");
   
})

postRouter.post("/posts/:id/comment", authMiddleware, async(req,res)=>{
    const { text,userId } = req.body;
    const postId = req.params.id;

    const post = await PostModel.findById(postId);
    if (!post) {
       res.status(404).send("Post not found");
    }

    const comment = {
      user: userId,
      text,
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).send("Comment added successfully");
})

// get post by id 

postRouter.get("/posts/:id",async(req,res)=>{
    const id =req.params.id
    const post =await PostModel.findOne({_id:id})
    res.status(200).send(post)
})








module.exports ={
    postRouter
}