import loadEnv from "./config/env.js";
import connectDB from "./config/db.js";
import app from "./app.js";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";
dotenv.config();

loadEnv();

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/chat" });

const connections = new Map();
const userConnections = new Map(); // Track unique users by userId
const messageHistory = [];
const MAX_HISTORY = 50;

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const userId = url.searchParams.get("userId");
  const userName = url.searchParams.get("userName");

  if (!userId || !userName) {
    ws.close();
    return;
  }

  connections.set(ws, { userId, userName });
  
  // Track this userId - increment count if already exists, otherwise create new
  if (!userConnections.has(userId)) {
    userConnections.set(userId, { userName, connectionCount: 1 });
  } else {
    const userData = userConnections.get(userId);
    userData.connectionCount += 1;
    userConnections.set(userId, userData);
  }

  console.log(`User connected: ${userName} (${userId})`);

  ws.send(JSON.stringify({
    type: "history",
    messages: messageHistory,
  }));

  const uniqueUserCount = userConnections.size;
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: "userCount",
        count: uniqueUserCount,
      }));
    }
  });

  ws.on("message", (data) => {
    try {
      const messageData = JSON.parse(data);

      if (messageData.type === "message") {
        const message = {
          id: Date.now().toString(),
          userId: messageData.userId,
          userName: messageData.userName,
          content: messageData.content,
          timestamp: new Date(messageData.timestamp),
        };
        messageHistory.push(message);
        if (messageHistory.length > MAX_HISTORY) {
          messageHistory.shift();
        }
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: "message",
              id: message.id,
              userId: message.userId,
              userName: message.userName,
              content: message.content,
              timestamp: message.timestamp,
            }));
          }
        });
      }
    } catch (err) {
      console.error("Error handling message:", err);
    }
  });

  ws.on("close", () => {
    const connectionData = connections.get(ws);
    if (connectionData) {
      const { userId, userName } = connectionData;
      connections.delete(ws);
      
      // Check if this user has any other active connections
      let hasOtherConnections = false;
      for (const [, data] of connections) {
        if (data.userId === userId) {
          hasOtherConnections = true;
          break;
        }
      }
      
      // Only remove from userConnections if no other connections exist
      if (!hasOtherConnections) {
        userConnections.delete(userId);
      }
      
      console.log(`User disconnected: ${userName} (${userId})`);

      const uniqueUserCount = userConnections.size;
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: "userCount",
            count: uniqueUserCount,
          }));
        }
      });
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

