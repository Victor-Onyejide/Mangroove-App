import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Session from '../models/sessionModel.js';
import {generateToken, isAuth, isAdmin} from '../utils.js';
import { v4 as uuidv4 } from 'uuid';
import {sendSessionUpdate} from '../sse.js';

const userRouter = express.Router();

userRouter.get('/', expressAsyncHandler(async(req, res) => {
    res.send({message: 'Message'});
}));
userRouter.post('/login', expressAsyncHandler(async(req, res) => {
    const user = await User.findOne({email: req.body.email});
    if(user)
    {
        if(bcrypt.compareSync(req.body.password, user.password))
        {
            const token = generateToken(user);
            const isProduction = process.env.NODE_ENV === 'production';

            res.cookie('token', token, {
                httpOnly: true,
                secure: isProduction, // Set to true in production
                sameSite: isProduction ? 'strict' : 'lax', // Adjust as needed should be none in production
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });

            res.json({
                _id:user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                token: token
            });
            return;
        }
    }
    res.status(401).send({message:'Invalid email or password'});
}));

userRouter.post('/signup', expressAsyncHandler(async(req,res) => {
    console.log("Signup request received:", req.body);
    const user = new User ({
        username: req.body.username,
        email: req.body.email,
        stageName: req.body.aka,
        password: bcrypt.hashSync(req.body.password, 8),
        affiliation: req.body.affiliation,
        publisher: req.body.publisher,
        role: req.body.role,
        isAdmin: req.body.isAdmin || false,
    });

    const createdUsers = await user.save();

    const token = generateToken(createdUsers);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction, // Set to true in production
            sameSite: isProduction ? 'strict' : 'lax', // Adjust as needed should be none in production
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
    if(!createdUsers)
    {
        return res.status(400).send({message: 'Invalid user data'});
    }

    res.send({
        _id: createdUsers._id,
        username: createdUsers.username,
        name: createdUsers.name,
        email: createdUsers.email,
        isAdmin: createdUsers.isAdmin,
        token: generateToken(createdUsers),
    })
}));

userRouter.get('/profile', isAuth, expressAsyncHandler(async(req, res) => {
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        isAdmin: req.user.isAdmin
    });
}));

// Logout route
userRouter.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the token cookie
    res.status(200).json({ message: 'Logged out successfully' });
});

// Session routes
// Create a new session
userRouter.post('/create-session', isAuth, expressAsyncHandler(async(req, res) => {

    const {
        songTitle,
        sessionType
    } = req.body;

    // Fetch creator to capture username for denormalized storage
    const creatorUser = await User.findById(req.user._id).select('username');

    const session = new Session({
        creator: req.user._id,
        songTitle: songTitle,
        sessionType: sessionType,
        // Store both user id and username in songwriters
        songwriters: [{ user: req.user._id, username: creatorUser?.username || '' }],
        joinLink: uuidv4(),
        linkExpiresAt: new Date(),
    });
    await session.save();
    res.status(201).json({ message: 'Session created', session: session });
}));

// Get session by ID
userRouter.get('/session/:id', isAuth, expressAsyncHandler(async(req,res) =>{
    const sessionId = req.params.id;
    const session = await Session.findById(sessionId).populate({path:'songwriters.user', select:'_id username stageName affiliation publisher role ownership'})
    const userId = req.user._id;
    const isCreator = session.creator._id.toString() === userId;
    const isParticipant = session.invitations.map(p=> p._id.toString()).includes(userId);
    res.json(session);
}) )

// Get all sessions for the user
userRouter.get('/sessions', isAuth, expressAsyncHandler(async(req,res) => {
    const userId = req.user._id;

    // Sessions the user created
    const created = await Session.find({ creator: userId })
        .populate({ path: 'songwriters.user', select: '_id username stageName email' });

    // Sessions the user joined (accepted invitation) but did NOT create
        const joined = await Session.find({
      creator: { $ne: userId },
      invitations: {
        $elemMatch: { invitee: userId, status: 'accepted' }
      }
        }).populate({ path: 'songwriters.user', select: '_id username stageName email' });

    res.json({ created, joined });

}));

// Invite a user to a session
userRouter.post('/session/:id/join', isAuth, expressAsyncHandler(async (req, res) => {
    const { id: sessionId } = req.params;
    const userId = req.user._id;

    // Fetch the session
    const session = await Session.findById(sessionId);
    if (!session) {
        console.log("Session not found for ID:", sessionId);
        return res.status(404).json({ message: "Not Found" });
    }
    // Mark invitation as accepted
    const invite = session.invitations.find(i => i.invitee.toString() === userId);
    if (invite) {
        invite.status = 'accepted';
    } else {
        console.log("No invitation found for user:", userId);
    }

    // Add user to songwriters if not already present (store id + username)
    const alreadySongwriter = Array.isArray(session.songwriters) && session.songwriters.some(sw => String(sw.user) === String(userId));
    if (!alreadySongwriter) {
        const user = await User.findById(userId).select('username role');
        session.songwriters.push({ user: userId, username: user?.username || '' });
        console.log("User added to songwriters:", userId);
    } else {
        console.log("User already in songwriters:", userId);
    }

    // Find or add the invitation
    const existingInvite = session.invitations.find(invite =>
        invite.invitee.toString() === userId
    );
    if (existingInvite) {
        existingInvite.status = 'accepted';
        console.log("Existing invitation updated:", existingInvite);
    } else {
        const newInvite = {
            invitee: userId,
            status: 'accepted',
            invitedAt: Date.now(),
        };
        session.invitations.push(newInvite);
        console.log("New invitation added:", newInvite);
    }

    // If a role was provided from the accept page, update the user's role
    if (req.body && req.body.role) {
        const role = String(req.body.role);
        const user = await User.findById(userId);
        if (user) {
            user.role = role;
            await user.save();
        }
    }

    // Save the session
    await session.save();
    await session.populate({ path: 'songwriters.user', select: '_id username stageName affiliation publisher role ownership' });
    sendSessionUpdate(sessionId, session);
    // Fetch user info for avatar
    const user = await User.findById(userId).select('username');

    // Respond with the updated session
    res.json(session);
}));

userRouter.post('/session/:id/end', isAuth, expressAsyncHandler(async (req, res) => {
    const sessionId = req.params.id;
    const userId = req.user._id;
    let session = await Session.findById(sessionId);

    if (!session) {
        return res.status(404).json({ message: 'Session not found' });
    }
    if (session.creator.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Only the session creator can end the session' });
    }
    session.isEnded = true;
    await session.save();
    session = await Session.findById(sessionId).populate({ path: 'songwriters.user', select: '_id username stageName affiliation publisher role ownership' });
    sendSessionUpdate(sessionId, {ended:true});
    res.json({ message: 'Session ended successfully', session });
}));

// Route to update ownership for a session
userRouter.put('/session/:id/ownership', async (req, res) => {
    const { ownership } = req.body;

    if (!ownership || !Array.isArray(ownership)) {
        return res.status(400).json({ message: 'Invalid ownership data' });
    }

    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

            // Merge incoming ownership entries into existing session.ownership
            // so partial updates (e.g. updating only writing) don't overwrite other fields with 0.
            const existingOwnership = Array.isArray(session.ownership) ? session.ownership.slice() : [];
            ownership.forEach(o => {
                const songwriterId = String(o.songwriter);
                const idx = existingOwnership.findIndex(e => String(e.songwriter) === songwriterId);
                const existing = idx !== -1 ? existingOwnership[idx] : null;

                // Determine writing: prefer explicit non-empty incoming value, then percentage, then existing, else 0
                let writing;
                if (o.writing !== undefined && o.writing !== '') {
                    writing = Number(o.writing);
                } else if (o.percentage !== undefined && o.percentage !== '') {
                    writing = Number(o.percentage);
                } else {
                    writing = existing ? existing.writing : 0;
                }

                // Determine publishing: prefer explicit non-empty incoming value, then existing, else 0
                let publishing;
                if (o.publishing !== undefined && o.publishing !== '') {
                    publishing = Number(o.publishing);
                } else {
                    publishing = existing ? existing.publishing : 0;
                }

                if (idx !== -1) {
                    existingOwnership[idx].writing = writing;
                    existingOwnership[idx].publishing = publishing;
                } else {
                    existingOwnership.push({ songwriter: songwriterId, writing, publishing });
                }
            });
            session.ownership = existingOwnership;
        await session.save();

        // Re-populate songwriters before returning to ensure frontend gets full objects
        await session.populate({ path: 'songwriters.user', select: '_id username stageName affiliation publisher role ownership' });

        // Broadcast updated session to all SSE subscribers so splits update live
        try {
            sendSessionUpdate(session._id.toString(), session);
        } catch (e) {
            console.warn('Failed to send SSE update after ownership change:', e);
        }

        res.status(200).json({ message: 'Ownership updated successfully', session });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Propose an ownership update to all joined participants (creator initiates)
userRouter.post('/session/:id/ownership/propose', isAuth, expressAsyncHandler(async (req, res) => {
    const { ownership } = req.body;
    if (!ownership || !Array.isArray(ownership)) {
        return res.status(400).json({ message: 'Invalid ownership data' });
    }
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Only creator can propose ownership changes
    if (String(session.creator) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Only the session creator can propose ownership changes' });
    }

    const proposalId = uuidv4();
    // Build proposal by merging incoming values with existing ownership where fields are omitted
    const existingOwnership = Array.isArray(session.ownership) ? session.ownership.slice() : [];
    const proposalEntries = ownership.map(o => {
        const songwriterId = String(o.songwriter);
        const idx = existingOwnership.findIndex(e => String(e.songwriter) === songwriterId);
        const existing = idx !== -1 ? existingOwnership[idx] : null;

        const writing = (o.writing !== undefined && o.writing !== '') ? Number(o.writing) : (o.percentage !== undefined && o.percentage !== '' ? Number(o.percentage) : (existing ? existing.writing : 0));
        const publishing = (o.publishing !== undefined && o.publishing !== '') ? Number(o.publishing) : (existing ? existing.publishing : 0);
        return { songwriter: songwriterId, writing, publishing };
    });

    session.pendingOwnership = {
        proposalId,
        proposal: proposalEntries,
        proposedBy: req.user._id,
        responses: [],
        createdAt: Date.now()
    };

    await session.save();
    await session.populate({ path: 'songwriters.user', select: '_id username stageName affiliation publisher role ownership' });

    // Broadcast proposal to clients so they can prompt users
    try {
        // include proposer username for convenience on clients
        const proposerUser = await User.findById(req.user._id).select('username');
        sendSessionUpdate(session._id.toString(), { type: 'ownershipProposal', proposalId: proposalId, proposal: session.pendingOwnership.proposal, proposedBy: req.user._id, proposedByName: proposerUser?.username || '' });
    } catch (e) {
        console.warn('Failed to send SSE ownership proposal:', e);
    }

    res.json({ message: 'Proposal sent', pendingOwnership: session.pendingOwnership });
}));

// Respond to a pending ownership proposal (accept or reject)
userRouter.post('/session/:id/ownership/respond', isAuth, expressAsyncHandler(async (req, res) => {
    const { proposalId, accept } = req.body;
    const userId = req.user._id;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.pendingOwnership || session.pendingOwnership.proposalId !== proposalId) {
        return res.status(400).json({ message: 'No matching pending proposal' });
    }

    // Update or add response for this user
    const existingIdx = (session.pendingOwnership.responses || []).findIndex(r => String(r.user) === String(userId));
    if (existingIdx !== -1) {
        session.pendingOwnership.responses[existingIdx].accept = Boolean(accept);
    } else {
        session.pendingOwnership.responses = session.pendingOwnership.responses || [];
        session.pendingOwnership.responses.push({ user: userId, accept: Boolean(accept) });
    }

    await session.save();

    // Determine recipients: all users who have accepted the invitation (joined participants)
    const recipients = (session.invitations || []).filter(inv => inv.status === 'accepted').map(i => String(i.invitee));

    // Check for any rejection
    const anyReject = (session.pendingOwnership.responses || []).some(r => r.accept === false);
    if (anyReject) {
        // Clear pending and notify owner
        const rejectedBy = session.pendingOwnership.responses.find(r => r.accept === false).user;
        session.pendingOwnership = undefined;
        await session.save();
        try {
            const rejectedUser = await User.findById(rejectedBy).select('username');
            sendSessionUpdate(session._id.toString(), { type: 'ownershipRejected', rejectedBy: rejectedBy, rejectedByName: rejectedUser?.username || '' });
        } catch (e) {
            console.warn('Failed to send SSE ownership rejection:', e);
        }
        return res.json({ message: 'Proposal rejected by a participant' });
    }

    // If all recipients have responded and all accepted, commit the ownership
    const responses = session.pendingOwnership.responses || [];
    const respondedUserIds = responses.map(r => String(r.user));
    const allResponded = recipients.length > 0 && recipients.every(rid => respondedUserIds.includes(rid));
    if (allResponded && responses.every(r => r.accept === true)) {
        // Commit
        session.ownership = session.pendingOwnership.proposal.map(p => ({ songwriter: p.songwriter, writing: p.writing, publishing: p.publishing }));
        session.pendingOwnership = undefined;
        await session.save();
        await session.populate({ path: 'songwriters.user', select: '_id username stageName affiliation publisher role ownership' });
        try {
            sendSessionUpdate(session._id.toString(), { type: 'ownershipCommitted', session });
        } catch (e) {
            console.warn('Failed to send SSE ownership committed:', e);
        }
        return res.json({ message: 'Proposal accepted and committed', session });
    }

    // Otherwise, still pending
    try {
        const respondingUser = await User.findById(userId).select('username');
        sendSessionUpdate(session._id.toString(), { type: 'ownershipResponse', proposalId: proposalId, user: userId, userName: respondingUser?.username || '', accept: Boolean(accept) });
    } catch (e) {
        console.warn('Failed to send SSE ownership response update:', e);
    }

    res.json({ message: 'Response recorded' });
}));

// Patch to update session fields (e.g., songTitle). Allowed for creator or songwriters.
userRouter.patch('/session/:id', isAuth, expressAsyncHandler(async (req, res) => {
    const sessionId = req.params.id;
    const { songTitle } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const userId = req.user._id.toString();
    const isCreator = String(session.creator) === userId;
    const isSongwriter = Array.isArray(session.songwriters) && session.songwriters.map(s => String(s)).includes(userId);

    if (!isCreator && !isSongwriter) {
        return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    if (songTitle !== undefined) {
        session.songTitle = String(songTitle);
    }

    await session.save();
    await session.populate({ path: 'songwriters', select: '_id username stageName affiliation publisher role ownership' });

    // Notify SSE clients of the update
    try {
        sendSessionUpdate(sessionId, session);
    } catch (e) {
        console.warn('Failed to send SSE update after session patch:', e);
    }

    res.json({ message: 'Session updated', session });
}));

// Delete a session (only creator)
userRouter.delete('/session/:id', isAuth, expressAsyncHandler(async (req, res) => {
    const sessionId = req.params.id;
    const userId = req.user._id;

    const session = await Session.findById(sessionId);
    if (!session) {
        return res.status(404).json({ message: 'Session not found' });
    }

    if (String(session.creator) !== String(userId)) {
        return res.status(403).json({ message: 'Only the session creator can delete the session' });
    }

    try {
        await Session.findByIdAndDelete(sessionId);
        // Notify any SSE clients that the session was deleted
        // try {
        //     sendSessionUpdate(sessionId, { deleted: true });
        // } catch (e) {
        //     console.warn('Failed to send SSE delete update:', e);
        // }

        res.json({ message: 'Session deleted successfully', sessionId });
    } catch (err) {
        console.error('Error deleting session:', err);
        res.status(500).json({ message: 'Failed to delete session' });
    }
}));

export default userRouter;