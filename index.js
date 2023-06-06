
const express=require("express");
const { dbConnection } = require("./configs/db");
const { userRouter } = require("./routes/user.route");
const { postRouter } = require("./routes/post.route");
const app=express();
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("homepage")
})

app.use("/api",userRouter)
app.use("/api",postRouter)



app.listen(8080,async()=>{
    try{
    await dbConnection
    console.log("connected to db")
    }
    catch(e){
    console.log(e.message)
    }
    console.log("listenig at port 8080")
})