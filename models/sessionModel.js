import mongoose from "mongoose";
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    creator: {type: Schema.Types.ObjectId, ref:'User', required: true},
    songTitle:{type:String, required:true},
    songwriters:[{
        name:{type:String, required:true},
        affiliation:{type:String},
        publisher: {type:String},
        role: {type:String},
        ownership:{type:Number, min:0, max:100}
    }],
    joinLink: {type:String, unique:true},
    linkExpiresAt: {type:Date},
    createdAt: {type:Date, default:Date.now},
    invitations:[{
        invitee: {type:Schema.Types.ObjectId, ref:'User', required:true},
        status: {type:String, enum: ['pending', 'accepted', 'declined'], default:'pending'},
        invitedAt:{type:Date, default:Date.now}
    }]
})
const Session = mongoose.model('Session', sessionSchema);
export default Session;