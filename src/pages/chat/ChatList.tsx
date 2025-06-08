import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { broadcastMessage } from '../../slices/chatSlice';
import { RootState } from '../../store/store';
import type { Message, ChatState } from '../../slices/chatSlice';

// Simulated chat list (in a real app, you'd fetch this from an API or a store)
const chats = [
  { id: "1", name: "General Chat", description: "Main chat room for everyone" },
  { id: "2", name: "Support", description: "Get help from our team" },
  { id: "3", name: "Announcements", description: "Important updates and news" },
];

export const ChatList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [broadcastText, setBroadcastText] = useState("");
  const chatState = useSelector((state: RootState) => state.chat as ChatState);

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleBroadcast = () => {
    if (broadcastText.trim()) {
      dispatch(broadcastMessage({
        chatIds: chats.map(chat => chat.id),
        message: {
          sender: "System",
          text: broadcastText,
          timestamp: new Date().toISOString(),
        }
      }));
      setBroadcastText("");
    }
  };

  // Get the last message for a specific chat
  const getLastMessage = (chatId: string): Message | undefined => {
    const chatMessages = chatState[chatId] || [];
    return chatMessages[chatMessages.length - 1];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold mb-4">Chat Rooms</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            placeholder="Broadcast a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleBroadcast}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Broadcast
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {chats.map((chat) => {
            const lastMessage = getLastMessage(chat.id);
            return (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{chat.name}</h2>
                    <p className="text-sm text-gray-600">{chat.description}</p>
                  </div>
                  {lastMessage && (
                    <div className="text-sm text-gray-500">
                      {new Date(lastMessage.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                {lastMessage && (
                  <div className="mt-2 text-sm text-gray-600 truncate">
                    <span className="font-medium">{lastMessage.sender}: </span>
                    {lastMessage.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 