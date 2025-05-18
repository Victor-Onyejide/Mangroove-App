import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Session from '../models/sessionModel.js';
import {generateToken, isAuth, isAdmin} from '../utils.js';
import { v4 as uuidv4 } from 'uuid';

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
            res.json({
                _id:user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user)
            });
            return;
        }
    }
    res.status(401).send({message:'Invalid email or password'});
}));

userRouter.post('/signup', expressAsyncHandler(async(req,res) => {
    const user = new User ({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        affiliation: req.body.affiliation,
        publisher: req.body.publisher,
        role: req.body.role,
        isAdmin: req.body.isAdmin || false,
    });

    const createdUsers = await user.save();

    res.send({
        _id: createdUsers._id,
        username: createdUsers.username,
        name: createdUsers.name,
        email: createdUsers.email,
        isAdmin: createdUsers.isAdmin,
        token: generateToken(createdUsers),
    })
}));

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

userRouter.get('/session/:id', isAuth, expressAsyncHandler(async(req,res) =>{
    const sessionId = req.params.id;
    const session = await Session.findById(sessionId);

    const userId = req.user._id;
    const isCreator = session.creator._id.toString() === userId;
    const isParticipant = session.invitations.map(p=> p._id.toString()).includes(userId);
    res.json(session);
}) )

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
    // Fetch user info for avatar
    const user = await User.findById(userId).select('username');
 

    // Respond with the updated session
    res.json(session);
}));

export default userRouter;