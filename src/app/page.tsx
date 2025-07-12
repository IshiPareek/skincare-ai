// src/app/page.tsx  -->  /
"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white gap-10 px-4">
      <div className="w-40 h-40 rounded-full bg-purple-400" />
      <button
        onClick={() => router.push("/scan")}
        className="bg-black text-white px-6 py-2 rounded-md text-sm tracking-wide hover:bg-neutral-800"
      >
        START CONSULTATION
      </button>
    </main>
  );
}

/*
"use client";

import React, { useEffect, useRef, useState } from "react";
import { fakeScript } from "../lib/fakeReplies";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function Home() {
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
    <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-white to-pink-50">
      <h1 className="text-3xl sm:text-4xl font-bold text-pink-600 text-center">
        DERMAT + AI
      </h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-xl border border-gray-300 shadow-lg w-full max-w-xs sm:max-w-sm"
      />

      <button
        onClick={startListening}
        className={`px-5 py-3 rounded-lg font-medium transition ${
          listening
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-pink-600 hover:bg-pink-700 text-white"
        }`}
        disabled={listening}
      >
        {listening ? "Listening..." : "Start Consultation"}
      </button>

      <div className="w-full max-w-sm space-y-4 bg-white shadow-md rounded-lg p-4 text-left text-sm text-gray-700">
        <p>
          <span className="font-semibold">You said:</span> {transcript}
        </p>
        <p>
          <span className="font-semibold">AI replied:</span> {aiReply}
        </p>
      </div>
    </main>
  );
}
*/
