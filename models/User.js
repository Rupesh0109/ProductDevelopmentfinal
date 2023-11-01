const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const userSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    roll:{
        type:String,
        required:true
    },
    photos:[
        
            {

                "photoname": {type:String} ,    
                "photo": {data:Buffer,contentType:String},        
              }
                    
        
    ]

},{timestamps:true})

module.exports=mongoose.model("User",userSchema)