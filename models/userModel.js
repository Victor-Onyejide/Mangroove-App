import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, required:true},
    email : {type:String, required:true},
    password: {type:String, required:true},
    affiliation:{type:String},
    publisher: {type:String},
    role: {type:String},
    ownership:{type:Number, min:0, max:100},
    isAdmin: {type:Boolean, default:false},
    createdAt: {type:Date, default:Date.now}
});

const User = mongoose.model("User", userSchema);
export default User;