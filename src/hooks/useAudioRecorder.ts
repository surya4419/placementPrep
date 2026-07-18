import { useState, useRef } from 'react';

interface UseAudioRecorderOptions {
  onTranscript: (text: string) => void;
  onError: (msg: string) => void;
}

export function useAudioRecorder({ onTranscript, onError }: UseAudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (isRecording) return;

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      onError('Audio recording is not supported. Please use Chrome, Edge, or Safari, or type your response.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop mic tracks immediately
        stream.getTracks().forEach(t => t.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) {
          // Too small — nothing was captured
          return;
        }

        setIsTranscribing(true);
        try {
          const base64Audio = await blobToBase64(audioBlob);
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Transcription failed');
          if (data.transcript?.trim()) {
            onTranscript(data.transcript.trim());
          }
        } catch (err: any) {
          onError(err.message || 'Transcription failed. Please try again or type your response.');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        onError('Microphone access denied. Please allow microphone permission in your browser settings.');
      } else if (e.name === 'NotFoundError') {
        onError('No microphone found. Please connect a microphone or type your response.');
      } else {
        onError('Could not access microphone. Please type your response.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
    }
    setIsRecording(false);
  };

  return { isRecording, isTranscribing, startRecording, stopRecording };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
