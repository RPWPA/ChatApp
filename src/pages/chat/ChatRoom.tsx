import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Define a Message type that includes optional mediaUrl and mediaType
interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

// Update initialMessages to use Message[]
const initialMessages: Message[] = [
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
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Auto-scroll to the latest message (using useEffect and useRef)
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  // Simulate upload
  const simulateUpload = (callback: () => void) => {
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(null);
        callback();
      }
    }, 100);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" && !selectedFile) return;
    const userText = newMessage;
    setNewMessage("");

    let newMsg: Message;
    if (selectedFile) {
      newMsg = {
        id: messages.length + 1,
        sender: "You",
        text: userText,
        timestamp: new Date(),
        mediaUrl: previewUrl || undefined,
        mediaType: selectedFile.type.startsWith("image") ? "image" : selectedFile.type.startsWith("video") ? "video" : undefined,
      };
    } else {
      newMsg = {
        id: messages.length + 1,
        sender: "You",
        text: userText,
        timestamp: new Date(),
      };
    }

    if (selectedFile) {
      simulateUpload(() => {
        setMessages((prev) => [...prev, newMsg]);
        setSelectedFile(null);
        setPreviewUrl(null);
        setTimeout(() => {
          const botMsg: Message = {
            id: messages.length + 2,
            sender: "Chatbot",
            text: getChatbotResponse(userText),
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMsg]);
        }, 1200);
      });
    } else {
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => {
        const botMsg: Message = {
          id: messages.length + 2,
          sender: "Chatbot",
          text: getChatbotResponse(userText),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 1200);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1> Chat Room (TSX) – Chat ID: {chatId} </h1>
      <button onClick={() => navigate("/chat")} style={{ marginBottom: "10px" }}> Back to Chat List </button>
      <div style={{ height: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "10px" }}>
            <strong>{msg.sender} ({msg.timestamp.toLocaleTimeString()})</strong>: {msg.text}
            {msg.mediaUrl && msg.mediaType === "image" && (
              <div><img src={msg.mediaUrl} alt="attachment" style={{ maxWidth: 200, maxHeight: 200, display: "block", marginTop: 8 }} /></div>
            )}
            {msg.mediaUrl && msg.mediaType === "video" && (
              <div><video src={msg.mediaUrl} controls style={{ maxWidth: 200, maxHeight: 200, display: "block", marginTop: 8 }} /></div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {uploadProgress !== null && (
        <div style={{ marginBottom: 10 }}>
          <div>Uploading: {uploadProgress}%</div>
          <progress value={uploadProgress} max={100} style={{ width: 200 }} />
        </div>
      )}
      {previewUrl && (
        <div style={{ marginBottom: 10 }}>
          <div>Preview:</div>
          {selectedFile && selectedFile.type.startsWith("image") && (
            <img src={previewUrl} alt="preview" style={{ maxWidth: 100, maxHeight: 100 }} />
          )}
          {selectedFile && selectedFile.type.startsWith("video") && (
            <video src={previewUrl} controls style={{ maxWidth: 100, maxHeight: 100 }} />
          )}
        </div>
      )}
      <form onSubmit={handleSendMessage} style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message (e.g. 'Hello!')"
          style={{ flex: 1, marginRight: "10px" }}
          disabled={uploadProgress !== null}
        />
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ marginRight: "10px" }}
          disabled={uploadProgress !== null}
        />
        <button type="submit" disabled={uploadProgress !== null}> Send </button>
      </form>
    </div>
  );
}

export default ChatRoom; 