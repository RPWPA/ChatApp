import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { broadcastMessage } from '../../slices/chatSlice';

// Simulated chat list (in a real app, you'd fetch this from an API or a store)
const chatList = [
  { id: 1, name: "Chat 1 (User A)", lastMessage: "Hello, how are you?" },
  { id: 2, name: "Chat 2 (User B)", lastMessage: "See you later." },
  { id: 3, name: "Chat 3 (Chatbot)", lastMessage: "How can I assist you?" }
];

function ChatList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<number[]>([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");

  const handleChatClick = (chatId: number) => {
    if (broadcastMode) {
      // Toggle selection (for broadcast)
      if (selectedChats.includes(chatId)) {
         setSelectedChats(selectedChats.filter(id => id !== chatId));
      } else {
         setSelectedChats([...selectedChats, chatId]);
      }
    } else {
      // Navigate to chat room (e.g. /chat/1)
      navigate(`/chat/${chatId}`);
    }
  };

  const handleBroadcastClick = () => {
    if (broadcastMode) {
      // If already in broadcast mode, open modal (if at least one chat is selected)
      if (selectedChats.length > 0) {
         setShowBroadcastModal(true);
      } else {
         alert("Please select at least one chat to broadcast.");
      }
    } else {
      // Toggle broadcast mode (multi-select)
      setBroadcastMode(true);
    }
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (broadcastText.trim() === "") {
      alert("Broadcast message cannot be empty.");
      return;
    }
    dispatch(broadcastMessage({
      chatIds: selectedChats.map(String),
      message: {
        sender: "You",
        text: broadcastText,
        timestamp: new Date().toISOString(),
      },
    }));
    setBroadcastText("");
    setShowBroadcastModal(false);
    setBroadcastMode(false);
    setSelectedChats([]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1> Chat List (TSX) </h1>
      <button onClick={handleBroadcastClick} style={{ marginBottom: "10px" }}>
        {broadcastMode ? `Broadcast (Selected: ${selectedChats.length})` : "Broadcast"}
      </button>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {chatList.map((chat) => (
          <li
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            style={{ padding: "10px", border: "1px solid #ccc", marginBottom: "5px", cursor: "pointer", backgroundColor: (broadcastMode && selectedChats.includes(chat.id)) ? "#e0e0e0" : "white" }}
          >
            <strong>{chat.name}</strong> – {chat.lastMessage}
          </li>
        ))}
      </ul>
      {showBroadcastModal && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", padding: "20px", border: "1px solid #ccc", backgroundColor: "white", zIndex: 1000 }}>
          <h2>Broadcast Message</h2>
          <form onSubmit={handleBroadcastSubmit}>
            <textarea
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Enter broadcast message (e.g. 'Hello everyone!')"
              rows={3}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <button type="submit"> Send Broadcast </button>
            <button type="button" onClick={() => { setShowBroadcastModal(false); setBroadcastText(""); }} style={{ marginLeft: "10px" }}> Cancel </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatList; 