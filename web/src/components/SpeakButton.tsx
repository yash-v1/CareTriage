import { useState, useEffect, useRef } from 'react';
import { isSpeechRecognitionSupported, startListening } from '../voice/recognition';
import { getTranslations, type SupportedLang } from '../i18n';

interface Props {
  lang: SupportedLang;
  onTranscriptUpdate: (text: string) => void;
  disabled?: boolean;
}

export function SpeakButton({ lang, onTranscriptUpdate, disabled }: Props) {
  const t = getTranslations(lang);
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
      setError(t.micUnsupported);
      return;
    }

    setError(null);
    onTranscriptUpdate(""); // Clear previous text on new session

    const rec = startListening(
      lang,
      (text) => onTranscriptUpdate(text),
      (err) => {
        // Provide clear user-friendly guidance
        if (err.toLowerCase().includes("not-allowed") || err.toLowerCase().includes("permission")) {
          setError(t.micPermissionDenied);
        } else if (err.toLowerCase().includes("no-speech")) {
          setError(t.micNoSpeech);
        } else {
          setError(`${err}. ${t.micUnsupported}`);
        }
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
    <div className="flex flex-col items-center justify-center space-y-4 my-6">
      {/* Main Microphone Button: At least 120px circular target (w-32 h-32 = 128px) */}
      <div className="relative flex items-center justify-center">
        {/* Radar Pulse Animation when listening (disabled under prefers-reduced-motion) */}
        {isListening && (
          <div 
            className="absolute inset-0 rounded-full ring-8 ring-rose-400/60 animate-pulse motion-reduce:animate-none pointer-events-none" 
            aria-hidden="true"
          />
        )}

        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled && !isListening}
          aria-label={isListening ? t.micStopAria : t.micStartAria}
          className={`relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all shadow-xl focus-visible:ring-4 focus-visible:outline-none ${
            isListening 
              ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus-visible:ring-rose-300' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus-visible:ring-blue-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed'
          }`}
        >
          {isListening ? (
            // Stop Icon (filled rounded square)
            <svg className="w-12 h-12 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            // Microphone Icon
            <svg className="w-12 h-12 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Status Label below microphone */}
      <div aria-live="polite" className="text-center">
        <p className={`text-base font-extrabold tracking-wide ${isListening ? 'text-rose-700' : 'text-slate-900'}`}>
          {isListening ? t.micListening : t.micReady}
        </p>
      </div>
      
      {/* Plain-language Error / Fallback Alert with Icon */}
      {error && (
        <div 
          role="alert" 
          className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl text-slate-900 max-w-md text-left shadow-sm mt-2 flex items-start space-x-2.5"
        >
          <span className="text-xl shrink-0" aria-hidden="true">⚠️</span>
          <p className="text-sm font-semibold text-slate-800 leading-snug">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
