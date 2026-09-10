// src/App.jsx
import React, { useState, useEffect } from "react";
import Inbox from "./components/Inbox"; // or Dashboard
import Auth from "./Auth";

export default function App() {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("access_iq_user");
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  const handleLoginSuccess = (email) => {
    localStorage.setItem("access_iq_user", email);
    setUserEmail(email);
  };

  const handleSignOut = () => {
    localStorage.removeItem("access_iq_user");
    setUserEmail("");
  };

  return (
    <div>
      {userEmail ? (
        <Inbox userEmail={userEmail} onSignOut={handleSignOut} />
      ) : (
        <Auth onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}