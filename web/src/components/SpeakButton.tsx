import React, { useState, useEffect, useRef } from 'react';
import { isSpeechRecognitionSupported, startListening } from '../voice/recognition';

interface Props {
  lang: "en" | "ta" | "hi";
  onTranscriptUpdate: (text: string) => void;
  disabled?: boolean;
}

export function SpeakButton({ lang, onTranscriptUpdate, disabled }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    // Cleanup if component unmounts while listening
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setError("Speech not supported in this browser (try Chrome/Edge).");
      return;
    }

    setError(null);
    onTranscriptUpdate(""); // Clear previous text on new session

    const rec = startListening(
      lang,
      (text) => onTranscriptUpdate(text),
      (err) => {
        setError(err);
        setIsListening(false);
      },
      () => setIsListening(false)
    );

    if (rec) {
      recognitionRef.current = rec;
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 my-6">
      <button
        onClick={toggleListening}
        disabled={disabled && !isListening}
        className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all shadow-lg ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400'
        }`}
        aria-label={isListening ? "Stop listening" : "Start speaking"}
      >
        {/* Simple SVG Mic Icon */}
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isListening ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          )}
        </svg>
      </button>
      
      <p className={`text-sm font-semibold ${isListening ? 'text-red-500' : 'text-gray-600'}`}>
        {isListening ? "Listening..." : "Tap to Speak"}
      </p>
      
      {error && <p className="text-xs text-red-500 max-w-xs text-center">{error}</p>}
    </div>
  );
}