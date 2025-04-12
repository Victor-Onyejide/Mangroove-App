import dotenv from "dotenv";
import express from "express";
import process from "process";
import mongoose from "mongoose";
import userRouter from './routes/user.js';


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

app.use('/api/user', userRouter);

app.listen(PORT, ()=> { console.log(`Listening on port ${PORT}`)});