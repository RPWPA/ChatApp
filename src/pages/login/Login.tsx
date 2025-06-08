import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login with hardcoded credentials
    if (email === "test@chat.com" && password === "123456") {
      // Simulate session storage (using localStorage)
      localStorage.setItem("sessionToken", "simulated-session-token");
      // Redirect to home (or dashboard) on successful login
      navigate("/");
    } else {
      setError("Invalid credentials. (Hint: test@chat.com / 123456)");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login Page (TSX)</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label> Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label> Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
         <button type="submit"> Login </ button>
      </form>
    </div>
  );
}

export default Login; 