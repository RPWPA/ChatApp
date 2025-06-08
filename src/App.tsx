import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import { ChatList } from "./pages/chat/ChatList";
import ChatRoom from "./pages/chat/ChatRoom";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    // Simulate session check (using localStorage) and redirect unauthenticated users to /login
    const sessionToken = localStorage.getItem("sessionToken");
    if (!sessionToken && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [navigate, location]);
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:chatId" element={<ChatRoom />} />
      </Routes>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
} 