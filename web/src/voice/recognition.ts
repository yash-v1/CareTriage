export function isSpeechRecognitionSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function startListening(
  lang: "en" | "ta" | "hi",
  onResult: (text: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
): { stop: () => void } | null {
  // @ts-ignore - Vendor prefixes aren't in standard DOM types
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError("Speech recognition not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  // Map our short codes to standard Indic locales
  recognition.lang = lang === 'en' ? 'en-IN' : lang === 'ta' ? 'ta-IN' : 'hi-IN';
  recognition.continuous = true;
  recognition.interimResults = true;

  let finalTranscript = '';

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    onResult((finalTranscript + interim).trim());
  };

  recognition.onerror = (event: any) => {
    onError(`Mic error: ${event.error}`);
  };

  recognition.onend = () => {
    onEnd();
  };

  try {
    recognition.start();
    return { stop: () => recognition.stop() };
  } catch (e) {
    onError("Failed to start microphone.");
    return null;
  }
}