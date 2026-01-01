import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext/useAuth";
import "./GlobalChat.css";

const GlobalChat = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Guest Identity Logic
  const [guestId] = useState(() => {
    let id = localStorage.getItem("chat_guest_id");
    if (!id) {
      id = `guest-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("chat_guest_id", id);
    }
    return id;
  });

  const [guestName] = useState(() => {
    let name = localStorage.getItem("chat_guest_name");
    if (!name) {
        // Simple distinct guest name
       name = `Guest-${Math.floor(Math.random() * 10000)}`;
       localStorage.setItem("chat_guest_name", name);
    }
    return name;
  });

  const currentUserId = isAuthenticated && user ? user._id : guestId;
  const currentUserName = isAuthenticated && user ? user.name : guestName;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    // Removed isAuthenticated check
    
    setIsLoading(true);
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:5000";
    
    try {
      ws.current = new WebSocket(`${wsUrl}/chat?userId=${currentUserId}&userName=${currentUserName}`);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setIsLoading(false);
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "message") {
            setMessages((prev) => [...prev, {
              id: data.id,
              userName: data.userName,
              userId: data.userId,
              content: data.content,
              timestamp: new Date(data.timestamp),
              isOwn: data.userId === currentUserId,
            }]);
          } else if (data.type === "userCount") {
            setOnlineUsers(data.count);
          } else if (data.type === "history") {
            const formattedMessages = data.messages.map((msg) => ({
              id: msg.id,
              userName: msg.userName,
              userId: msg.userId,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
              isOwn: msg.userId === currentUserId,
            }));
            setMessages(formattedMessages);
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        setIsLoading(false);
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setIsLoading(false);

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          setTimeout(() => {
            console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`);
            connectWebSocket();
          }, 2000 * reconnectAttempts.current);
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setIsLoading(false);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Removed isAuthenticated check
    if (isOpen && !isConnected && !isLoading) {
      connectWebSocket();
    }

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentUserId]); // Added currentUserId to dependencies to reconnect if user switches

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !ws.current || !isConnected) {
      return;
    }

    const messageData = {
      type: "message",
      userId: currentUserId,
      userName: currentUserName,
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    ws.current.send(JSON.stringify(messageData));
    setInputMessage("");
  };

  // Removed early return for !isAuthenticated

  return (
    <>
      {/* Floating Chat Icon */}
      <button
        className={`global-chat-icon ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Global Chat"
      >
        💬
        {onlineUsers > 0 && <span className="user-count">{onlineUsers}</span>}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="global-chat-modal">
          <div className="global-chat-container">
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-content">
                <h3>Global Chat</h3>
                <div className="status-indicator">
                  <span className={`status-dot ${isConnected ? "connected" : "disconnected"}`}></span>
                  <span className="status-text">
                    {isConnected ? `${onlineUsers} online` : "Disconnected"}
                  </span>
                </div>
              </div>
              <button
                className="chat-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                ✕
              </button>
            </div>

            {/* Messages Area */}
            <div className="chat-messages">
              {isLoading && (
                <div className="chat-loading">
                  <div className="spinner"></div>
                  <p>Connecting...</p>
                </div>
              )}

              {!isLoading && messages.length === 0 && isConnected && (
                <div className="chat-empty">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.isOwn ? "own" : "other"}`}
                >
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-author">{msg.userName}</span>
                      <span className="message-time">
                        {msg.timestamp.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="message-text">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chat-input"
                placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={!isConnected || isLoading}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!isConnected || isLoading || !inputMessage.trim()}
                title="Send message"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalChat;

