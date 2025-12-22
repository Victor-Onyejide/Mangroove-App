import mongoose from "mongoose";
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    creator: {type: Schema.Types.ObjectId, ref:'User', required: true},
    songTitle:{type:String, required:true},
    sessionType:{type:String, required:true},
    // Store both the user reference and a denormalized username for fast display
    songwriters:[{
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        username: { type: String }
    }],
    joinLink: {type:String, unique:true},
    linkExpiresAt: {type:Date},
    createdAt: {type:Date, default:Date.now},
    isEnded: {type:Boolean, default:false},
    invitations:[{
        invitee: {type:Schema.Types.ObjectId, ref:'User', required:true},
        status: {type:String, enum: ['pending', 'accepted', 'declined'], default:'pending'},
        invitedAt:{type:Date, default:Date.now}
    }],
    ownership: [{
    songwriter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    writing: { type: Number, required: true, min: 0, max: 100, default: 0 },
    publishing: { type: Number, required: true, min: 0, max: 100, default: 0 }
    }]
        ,
        // Pending ownership proposal that requires confirmation from joined participants
        pendingOwnership: {
            proposalId: { type: String },
            proposal: [{
                songwriter: { type: Schema.Types.ObjectId, ref: 'User' },
                writing: { type: Number },
                publishing: { type: Number }
            }],
            proposedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            responses: [{
                user: { type: Schema.Types.ObjectId, ref: 'User' },
                accept: { type: Boolean }
            }],
            createdAt: { type: Date }
        }
            ,
            // Negotiation log: structured entries describing proposals/responses/commits
            negotiationLog: [{
                type: { type: String }, // e.g., 'proposal', 'response', 'partialCommit', 'commit'
                actor: { type: Schema.Types.ObjectId, ref: 'User' },
                actorName: { type: String },
                detail: { type: String },
                data: { type: Schema.Types.Mixed },
                timestamp: { type: Date, default: Date.now }
            }]
})
const Session = mongoose.model('Session', sessionSchema);
export default Session;