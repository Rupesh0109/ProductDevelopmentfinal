const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    rollno:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true
    },
    photos:[
        {
            name: {type:String},
            data: {type:Buffer},
            contentType:{type: String}
        }
    ]

},{timestamps:true})

module.exports=mongoose.model("User",userSchema)