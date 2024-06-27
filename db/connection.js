const mongoose=require('mongoose');
const uri=process.env.DB_URI
mongoose.connect(uri).then(()=>{
    console.log("connection successfully to database");
}).catch((error)=>{
    console.log("connection failed",error);
})