import dotenv from "dotenv";
// const bp = require('body-parser');
import path from "path";
// dotenv.config({path:'./server/.env'});
import express from "express"
// const routes = require('./routes/index')s
const app = express();
// const dbConfig = require('./config/dbConfig');
app.use(express.json())
// app.use('/api', routes)
import { v4 as uuidv4 } from 'uuid';

const PORT = 4000;

app.use(express.json());

let sessions = [];
app.get("/api/", (req, res) => {
 res.json("Hello")
});

app.post('/api/create-session', (req, res) => {
    //TODO: Update this creation with the proper DB
    const newSession = {
        sessionId: '1',
        name: req.body.name,
        createdAt: new Date(),
    };
    //TODO: Make sure you add the session to the user sessions
    sessions.push(newSession);

    res.json(newSession);
});


app.listen(PORT, ()=> { console.log(`Listening on port ${PORT}`)});