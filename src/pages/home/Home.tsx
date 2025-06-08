import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ChatList from "../chat/ChatList";

export default function Home() {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Simulate logout by clearing session storage (localStorage)
    localStorage.removeItem("sessionToken");
    navigate("/login");
  };
  return (
    <div style={{ padding: "20px" }}>
      <h1> Home Page (TSX) </h1>
      <p> You are logged in. (Session simulated via localStorage.) </p>
      <ChatList />  
      <button onClick={ handleLogout }> Logout </ button>
    </div>
  );
}