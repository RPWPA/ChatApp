import React from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Layout } from "./components/Layout";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import ChatList from "./pages/chat/ChatList";
import ChatRoom from "./pages/chat/ChatRoom";

// Wrapper component to handle authentication and layout
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem("sessionToken"));
  const isLoginPage = location.pathname === "/login";

  React.useEffect(() => {
    if (!isAuthenticated && !isLoginPage) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoginPage, navigate]);

  if (isLoginPage) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:chatId" element={<ChatRoom />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App; 