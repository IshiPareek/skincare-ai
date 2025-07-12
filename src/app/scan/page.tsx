// src/app/scan/page.tsx --> /scan
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Camera access error:", err));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = SpeechRecognition
      ? new SpeechRecognition()
      : null;
  }, []);

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening || speaking) return;
    setListening(true);
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const userSpeech = event.results[0][0].transcript;
      setTranscript((t) => [...t, `You: ${userSpeech}`]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userSpeech }),
      });
      const data = await res.json();
      const reply = data.message;
      setTranscript((t) => [...t, `AI: ${reply}`]);
      speak(reply);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => {
      setListening(false);
      if (!speaking) startListening();
    };
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      startListening();
    };
    speechSynthesis.speak(utterance);
  };

  return (
    <main className="relative min-h-screen bg-white px-4 pt-8 pb-32 flex flex-col items-center">
      {/* Top-left X button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 text-2xl text-gray-500 hover:text-black"
        aria-label="Go back"
      >
        ×
      </button>

      {/* Centered oval camera view */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        <div className="relative w-64 h-80 rounded-full overflow-hidden border-4 border-purple-400 shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={startListening}
          disabled={listening || speaking}
          className={`px-4 py-2 rounded-md text-white text-sm ${
            listening || speaking ? "bg-gray-400" : "bg-purple-500 hover:bg-purple-600"
          }`}
        >
          {listening ? "Listening..." : speaking ? "Speaking..." : "Start"}
        </button>
        <div className="w-full max-w-md bg-white border rounded-md p-3 text-sm space-y-1 h-40 overflow-y-auto">
          {transcript.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      </div>
    </main>
  );
}
