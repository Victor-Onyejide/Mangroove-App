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
    console.log("Login request received:", req.body);

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
    } = req.body;

    const session = new Session({
        creator: req.user._id,
        songTitle: songTitle,
        songwriters: [req.user._id],
        joinLink: uuidv4(),
        linkExpiresAt: new Date(),
    });
    await session.save();
    res.status(201).json({ message: 'Session created', session: session });
}));

// Get session by ID
userRouter.get('/session/:id', isAuth, expressAsyncHandler(async(req,res) =>{
    const sessionId = req.params.id;
    const session = await Session.findById(sessionId).populate({path:'songwriters', select:'_id  username stageName affiliation publisher role ownership'})
    console.log("Session fetched Backend:", session);
    const userId = req.user._id;
    const isCreator = session.creator._id.toString() === userId;
    const isParticipant = session.invitations.map(p=> p._id.toString()).includes(userId);
    res.json(session);
}) )

// Get all sessions for the user
userRouter.get('/sessions', isAuth, expressAsyncHandler(async(req,res) => {
    const userId = req.user._id;

    // Sessions the user created
    const created = await Session.find({ creator: userId });

    // Sessions the user joined (accepted invitation) but did NOT create
    const joined = await Session.find({
      creator: { $ne: userId },
      invitations: {
        $elemMatch: { invitee: userId, status: 'accepted' }
      }
    });

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
        console.log("Invitation found and marked as accepted:", invite);
    } else {
        console.log("No invitation found for user:", userId);
    }

    // Add user to songwriters if not already present
    if (!session.songwriters.includes(userId)) {
        session.songwriters.push(userId);
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

    // Save the session
    await session.save();
    await session.populate({ path: 'songwriters', select: '_id username stageName affiliation publisher role ownership' });
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
    session = await Session.findById(sessionId).populate({ path: 'songwriters', select: '_id username stageName affiliation publisher role ownership' });
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
        // so partial updates don't wipe other songwriters' ownerships.
        const existingOwnership = Array.isArray(session.ownership) ? session.ownership.slice() : [];
        ownership.forEach(o => {
            const songwriterId = String(o.songwriter);
            // Accept either writing/publishing or a single percentage for backward compatibility
            const writing = o.writing !== undefined ? Number(o.writing) : (o.percentage !== undefined ? Number(o.percentage) : 0);
            const publishing = o.publishing !== undefined ? Number(o.publishing) : 0;
            const idx = existingOwnership.findIndex(e => String(e.songwriter) === songwriterId);
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
    await session.populate({ path: 'songwriters', select: '_id username stageName affiliation publisher role ownership' });

        res.status(200).json({ message: 'Ownership updated successfully', session });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

export default userRouter;