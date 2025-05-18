import dotenv from "dotenv";
import express from "express";
import process from "process";
import http from 'http';
import mongoose from "mongoose";
import userRouter from './routes/user.js';
import cors from 'cors';
// import { Server as IOServer } from 'socket.io';


const app = express();
const server = http.createServer(app);
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend
  methods: ['GET', 'POST','OPTIONS'],
  credentials: true
}));

const PORT = 4000;

dotenv.config();
app.use(express.json());

// Store clients for each session
const sessionClients = {};
// SSE route 
app.get('/event/:sessionId', (req,res) => {
  const {sessionId} = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Function to send SSE data
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  //Store the response object for this session
  sessionClients[sessionId] = res;

  // Send an initial message to the client
  sendEvent({ message: `Connected to session ${sessionId}` });

  //Handle client disconnect
  req.on('close', () => {
    delete sessionClients[sessionId];
  });

});
// Function to send data to all clients in a session
function sendSessionUpdate(sessionId, data) {
  if(sessionClients[sessionId]) {
    sessionClients[sessionId].write(`data: ${JSON.stringify(data)}\n\n`);
  } 

}
//Example route to trigger SSE update
app.post('/updateSession/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const data = req.body; // Get the data from the request body

  // Send the data to all clients in the session
  sendSessionUpdate(sessionId, data);

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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
