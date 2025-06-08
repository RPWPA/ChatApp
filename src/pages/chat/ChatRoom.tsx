import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Simulated chat messages (in a real app, you'd fetch or update these via an API or a store)
const initialMessages = [
  { id: 1, sender: "User A", text: "Hello, how are you?", timestamp: new Date(2023, 0, 1, 10, 0) },
  { id: 2, sender: "You", text: "I'm fine, thanks!", timestamp: new Date(2023, 0, 1, 10, 1) },
  { id: 3, sender: "User A", text: "See you later.", timestamp: new Date(2023, 0, 1, 10, 2) }
];

function getChatbotResponse(userMessage: string): string {
  // Simple canned/logic-based responses
  if (userMessage.toLowerCase().includes("hello")) return "Hello! How can I help you today?";
  if (userMessage.toLowerCase().includes("help")) return "Sure, I am here to assist you. What do you need help with?";
  if (userMessage.toLowerCase().includes("bye")) return "Goodbye! Have a great day!";
  return "I'm a chatbot. I can answer simple questions!";
}

function ChatRoom() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message (using useEffect and useRef)
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    const userText = newMessage;
    setNewMessage("");
  
    const newMsg = {
      id: messages.length + 1,
      sender: "You",
      text: userText,
      timestamp: new Date(),
    };
  
    // Add user message to messages
    setMessages((prev) => [...prev, newMsg]);
  
    // Simulate delayed bot response outside of state update to avoid double-calling
    setTimeout(() => {
      const botMsg = {
        id: messages.length + 2, // +2 because we're anticipating the previous message added
        sender: "Chatbot",
        text: getChatbotResponse(userText),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };
  

  return (
    <div style={{ padding: "20px" }}>
      <h1> Chat Room (TSX) – Chat ID: {chatId} </h1>
      <button onClick={() => navigate("/chat")} style={{ marginBottom: "10px" }}> Back to Chat List </button>
      <div style={{ height: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "10px" }}>
            <strong>{msg.sender} ({msg.timestamp.toLocaleTimeString()})</strong>: {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: "flex" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message (e.g. 'Hello!')"
          style={{ flex: 1, marginRight: "10px" }}
        />
        <button type="submit"> Send </button>
      </form>
    </div>
  );
}

export default ChatRoom; 