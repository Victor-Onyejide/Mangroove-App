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
            res.send({
                _id:user._id,
                username: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user)
            });
            return;
        }
        res.status(200).send({message:'Welcome!'})
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
        name: createdUsers.name,
        email: createdUsers.email,
        isAdmin: createdUsers.isAdmin,
        token: generateToken(createdUsers),
    })
}));

userRouter.post('/create-session', isAuth, expressAsyncHandler(async(req, res) => {

    const {
        songTitle,
        userId
    } = req.body;
    

    const session = new Session({
        creator: req.user._id,
        songTitle: songTitle,
        songwriters: [],
        joinLink: uuidv4(),
        linkExpiresAt: new Date(),
    });
    await session.save();
    res.status(201).json({ message: 'Session created', session });
}));

userRouter.get('/session/:id', isAuth, expressAsyncHandler(async(req,res) =>{
    const sessionId = req.params.id;
    const session = await Session.findById(sessionId);

    const userId = req.user._id;
    const isCreator = session.creator._id.toString() === userId;
    const isParticipant = session.invitations.map(p=> p._id.toString()).includes(userId);

    if(!isCreator && !isParticipant){
        return res.status(403).json({message: 'Forbidden'});
    }
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

}))

//TODO: Update invations so users know the sessions they were invited to\i

export default userRouter;