import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {type: String, required:true},
    email : {type:String, required:true},
    password: {type:String, required:true},
    createdAt: {type:Date, default:Date.now},
    isAdmin: {type:Boolean, default:false}
});

const User = mongoose.model("User", userSchema);
export default User;