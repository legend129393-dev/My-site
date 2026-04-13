const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// 🔗 MongoDB Atlas connect
mongoose.connect(
"mongodb+srv://legend129393_db_user:w0VasONYSk4VgRoI@legensx.s0goawf.mongodb.net/Legendclun"
).then(()=>{
  console.log("DB Connected ✅");
}).catch(err=>{
  console.log("DB Error ❌",err);
});

// 👤 User schema
const User = mongoose.model("User", {
  email: String,
  password: String,
  balance: { type: Number, default: 0 }
});

// 🟢 SIGNUP
app.post("/signup", async (req,res)=>{
  const {email,password} = req.body;

  try{
    const exist = await User.findOne({email});
    if(exist){
      console.log("[SIGNUP FAIL] User exists:", email);
      return res.json({msg:"User already exists ❌"});
    }

    const hash = await bcrypt.hash(password,10);

    await User.create({email,password:hash});

    console.log("[SIGNUP SUCCESS]", email);
    res.json({msg:"Signup successful ✅"});

  }catch(err){
    console.log("[SIGNUP ERROR]",err);
    res.json({msg:"Error in signup ❌"});
  }
});

// 🔵 LOGIN
app.post("/login", async (req,res)=>{
  const {email,password} = req.body;

  try{
    const user = await User.findOne({email});

    if(!user){
      console.log("[LOGIN FAIL] No user:", email);
      return res.json({msg:"User not found ❌"});
    }

    const match = await bcrypt.compare(password,user.password);

    if(!match){
      console.log("[LOGIN FAIL] Wrong password:", email);
      return res.json({msg:"Wrong password ❌"});
    }

    console.log("[LOGIN SUCCESS]", email);

    const token = jwt.sign({id:user._id},"secret123");

    res.json({msg:"Login success ✅",token});

  }catch(err){
    console.log("[LOGIN ERROR]",err);
    res.json({msg:"Error in login ❌"});
  }
});

// 🔐 DASHBOARD DATA
app.get("/me", async (req,res)=>{
  try{
    const token = req.headers.authorization;
    const data = jwt.verify(token,"secret123");

    const user = await User.findById(data.id);
    res.json(user);

  }catch{
    res.json({msg:"Invalid token ❌"});
  }
});

app.listen(3000, ()=>{
  console.log("Server running 🚀");
});