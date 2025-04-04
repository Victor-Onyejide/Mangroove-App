import dotenv from "dotenv";
import express from "express";
import process from "process";
import mongoose from "mongoose";


const app = express();
const PORT = 4000;

dotenv.config();
app.use(express.json());


//Connecting Database
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
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