// src/components/Inbox.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Inbox({ userEmail, onSignOut }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;

    setLoading(true);
    axios
      .get(`http://localhost:8000/api/v1/inbox/${encodeURIComponent(userEmail)}`)
      .then((res) => {
        if (res.data && res.data.messages) {
          setMessages(res.data.messages);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch inbox:", err);
      })
      .finally(() => {
        setLoading(false); // Guarantees loading spinner stops
      });
  }, [userEmail]);

  if (!userEmail) {
    return <div className="p-6 text-center">No active user session found. Please sign in again.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Access IQ Inbox</h1>
          <p className="text-sm text-gray-500">Authenticated as: <strong className="text-gray-700">{userEmail}</strong></p>
        </div>
        <button onClick={onSignOut} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Sign Out
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading messages...</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-800">{msg.sender}</span>
                <span className="text-xs text-gray-400">{msg.timestamp}</span>
              </div>
              <h3 className="font-medium text-blue-600 mb-1">{msg.subject}</h3>
              <p className="text-sm text-gray-600">{msg.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}