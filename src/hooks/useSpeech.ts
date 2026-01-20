import { useState, useCallback, useEffect } from "react";

interface UseSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const getPreferredVoice = useCallback(() => {
    if (options.voice) {
      const match = voices.find(v => v.name.toLowerCase().includes(options.voice!.toLowerCase()));
      if (match) return match;
    }
    
    // Prefer English voices with these priorities
    const priorities = [
      "Google US English",
      "Google UK English Female",
      "Samantha", // macOS
      "Microsoft Zira", // Windows
      "en-US",
      "en-GB",
    ];
    
    for (const priority of priorities) {
      const match = voices.find(v => 
        v.name.includes(priority) || v.lang.includes(priority)
      );
      if (match) return match;
    }
    
    return voices.find(v => v.lang.startsWith("en")) || voices[0];
  }, [voices, options.voice]);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;
    
    const voice = getPreferredVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    speechSynthesis.speak(utterance);
  }, [isSupported, options, getPreferredVoice]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
  };
}
