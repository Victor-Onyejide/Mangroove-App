import dotenv from "dotenv";
import express from "express";
import process from "process";
import http from 'http';
import mongoose from "mongoose";
import userRouter from './routes/user.js';
import cors from 'cors';
import cookieParser from "cookie-parser";
import {sessionClients, sendSessionUpdate} from './sse.js';
import path from 'path';


const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend
  methods: ['GET', 'POST','OPTIONS'],
  credentials: true
}));

app.use(cookieParser()); // Middleware to parse cookies

const PORT = process.env.PORT || 4000;

dotenv.config();
app.use(express.json());

// Store clients for each session
// SSE route 
app.get('/event/:sessionId', (req,res) => {
  const {sessionId} = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Initialize the sessionClients array if it doesn't exist
  if (!sessionClients[sessionId]) {
    sessionClients[sessionId] = [];
  }
  // Add the current response object to the sessionClients array
  sessionClients[sessionId].push(res);
  
  // Send an initial message to the client
  res.write(`data: ${JSON.stringify({ message: `Connected to session ${sessionId}` })}\n\n`);
  
  //Handle client disconnect
  req.on('close', () => {
    sessionClients[sessionId] = sessionClients[sessionId].filter(client => client !== res);
    // Optionally, clean up empty arrays
    if (sessionClients[sessionId].length === 0) {
      delete sessionClients[sessionId];
    }
  });
});

//Example route to trigger SSE update
app.post('/updateSession/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const data = req.body; // Get the data from the request body
  console.log(`Received update for session ${sessionId}:`, data);

  // Send the data to all clients in the session
  sendSessionUpdate(sessionId, data);
  console.log(`Client connected to session ${sessionId}`);
  res.status(200).json({ message: 'Data sent to clients' });
});

//Connecting Database
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

app.use('/api/user', userRouter);

//Live SetUp
const __dir = path.resolve();
app.use(express.static(path.join(__dir, '/frontend/build')));
app.get('*', (req,res) => {
    res.sendFile(path.join(__dir, '/frontend/build/index.html'))
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
