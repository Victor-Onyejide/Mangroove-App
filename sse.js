const sessionClients = {};

function sendSessionUpdate(sessionId, data) {
  if (sessionClients[sessionId]) {
    sessionClients[sessionId] = sessionClients[sessionId].filter(client => {
      try {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
        return true;
      } catch (error) {
        return false;
      }
    });
  } else {
    console.log(`No clients connected for session ${sessionId} when sending SSE event.`);
  }
}

export { sessionClients, sendSessionUpdate };