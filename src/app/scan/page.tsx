// src/app/scan/page.tsx

"use client";

import React, { useState } from "react";

export default function ScanPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [productMatches, setProductMatches] = useState<any[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = `You: ${input}`;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Semantic product search
    try {
      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      if (searchRes.ok) {
        const { matches } = await searchRes.json();
        setProductMatches(matches || []);
      } else {
        setProductMatches([]);
      }
    } catch {
      setProductMatches([]);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const reply = `AI: ${data.reply}`;
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setMessages((prev) => [...prev, "AI: Sorry, something went wrong."]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center pt-6 px-4 pb-6 font-helvetica">
      <header className="text-xs tracking-wide text-gray-600 font-semibold border-b border-gray-300 w-full text-center pb-2">
        SKINCARE AI
      </header>

      {/* Product matches UI */}
      {productMatches.length > 0 && (
        <div className="w-full max-w-md mt-4 mb-2 bg-white border border-green-200 rounded p-3 shadow-sm">
          <div className="font-bold text-green-700 text-sm mb-2">Top Product Matches</div>
          {productMatches.map((match, i) => (
            <div key={i} className="mb-2 p-2 border-b last:border-b-0 border-gray-100">
              <div className="font-semibold text-gray-900 text-sm">{match.metadata?.name || "Unnamed Product"}</div>
              <div className="text-xs text-gray-700">{match.document}</div>
              {match.metadata?.concerns && (
                <div className="text-xs text-gray-500 mt-1">Concerns: {Array.isArray(match.metadata.concerns) ? match.metadata.concerns.join(", ") : match.metadata.concerns}</div>
              )}
              {match.distance !== undefined && (
                <div className="text-xs text-gray-400">Similarity: {match.distance.toFixed(3)}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-md mt-6 flex flex-col gap-2 overflow-y-auto h-[450px] border border-gray-200 rounded-md p-4 bg-gray-50">
        {messages.map((msg, i) => (
          <p key={i} className="text-sm text-gray-800 whitespace-pre-wrap">
            {msg}
          </p>
        ))}
        {loading && <p className="text-sm text-gray-500">AI is typing...</p>}
      </div>

      <div className="w-full max-w-md mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your skincare question..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-[#B7CFB4] hover:bg-[#a1b5a0] text-sm font-bold rounded-md"
        >
          Send
        </button>
      </div>
    </main>
  );
}
