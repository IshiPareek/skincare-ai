// src/app/scan/page.tsx --> /scan
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fakeScript } from "../../lib/fakeReplies";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [transcript, setTranscript] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [listening, setListening] = useState(false);

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

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const startListening = () => {
    if (!recognition) return;
    setListening(true);
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event: any) => {
      const userSpeech = event.results[0][0].transcript;
      setTranscript(userSpeech);

      setTimeout(() => {
        const reply = getFakeReply(userSpeech);
        setAiReply(reply);
        speak(reply);
      }, 1200);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  const getFakeReply = (input: string) => {
    const msg = input.toLowerCase();
    const step = fakeScript.find((s) => msg.includes(s.user));
    return step
      ? step.ai
      : "Can you tell me a bit more about your skin type or concern?";
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
        <p className="text-sm text-center text-gray-700">
          Fit your face in the oval
        </p>
      </div>

      {/* Bottom fixed transcript button */}
      <button
        onClick={() => router.push("/transcript")}
        className="absolute bottom-8 text-sm text-gray-500 hover:underline"
      >
        View transcript
      </button>
    </main>
  );
}

/*
// src/app/transcript/page.tsx --> /transcript
"use client";

import { useEffect, useState } from "react";
import { fakeScript } from "../../lib/fakeReplies";

export default function TranscriptPage() {
  const [conversation, setConversation] = useState(fakeScript);

  return (
    <main className="min-h-screen bg-white p-6 flex flex-col items-center text-left gap-4">
      <h1 className="text-xl font-semibold">Transcript</h1>
      <div className="w-full max-w-xl space-y-4">
        {conversation.map((step, index) => (
          <div key={index} className="text-sm space-y-1">
            <p>
              <span className="font-semibold text-blue-600">You:</span> {step.user}
            </p>
            <p>
              <span className="font-semibold text-green-600">AI:</span> {step.ai}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
  */
