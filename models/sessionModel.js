import mongoose from "mongoose";
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    creator: {type: Schema.Types.ObjectId, ref:'User', required: true},
    songTitle:{type:String, required:true},
    songwriters:[{ type: Schema.Types.ObjectId, ref: 'User' }],
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