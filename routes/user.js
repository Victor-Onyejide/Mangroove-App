import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Session from '../models/sessionModel.js';
import {generateToken, isAuth, isAdmin} from '../utils.js';

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

userRouter.post('/session', isAuth, expressAsyncHandler(async(req, res) => {

    const {songTitle, songwriters, joinLink, linkExpiresAt} = req.body;

    const session = new Session({
        creator: req.user.id,
        songTitle,
        songwriters,
        joinLink,
        linkExpiresAt
    });
    await session.save();
    res.status(201).json({ message: 'Session created', session });
}));

//TODO: Update invations so users know the sessions they were invited to\i

export default userRouter;