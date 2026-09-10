// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Inbox from "./components/Inbox";

export default function Dashboard({ userEmail, onSignOut }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;

    fetch(`http://localhost:8000/api/v1/inbox/${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setMessages(data.messages);
        }
      })
      .catch((err) => console.error("Error fetching inbox:", err))
      .finally(() => setLoading(false));
  }, [userEmail]);

  return (
    <div className="dashboard-container">
      {/* User Header */}
      <div className="card">
        <span className="badge">Authenticated</span>
        <h2>Access IQ System</h2>
        <p>Verified Email: <strong>{userEmail}</strong></p>
        <button onClick={onSignOut} className="btn-danger">
          Sign Out
        </button>
      </div>

      {/* Inbox Section */}
      <div className="inbox-section" style={{ marginTop: "20px" }}>
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          <Inbox messages={messages} />
        )}
      </div>
    </div>
  );
}