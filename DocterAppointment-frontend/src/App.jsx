import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import { apiFetch } from "./api";
import "./styles/global.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      apiFetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.id) setUser(data);
          else handleLogout();
        })
        .catch(handleLogout);
    }
  }, [token]);

  const handleLogin = (jwt, userData) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;
  return <DashboardPage user={user} token={token} onLogout={handleLogout} setUser={setUser} />;
}
