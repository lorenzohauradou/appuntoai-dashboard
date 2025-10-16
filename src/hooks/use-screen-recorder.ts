import { useState, useRef, useCallback } from 'react';

type RecorderState = 'idle' | 'recording' | 'stopped' | 'error';

export const useScreenRecorder = () => {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setError("Il tuo browser non supporta la registrazione dello schermo.");
      setRecorderState('error');
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      if (displayStream.getAudioTracks().length === 0) {
        displayStream.getVideoTracks().forEach(track => track.stop());
        setError("Audio non rilevato. Assicurati di aver spuntato 'Condividi audio scheda' quando selezioni la scheda di Google Meet.");
        setRecorderState('error');
        return;
      }
      
      streamRef.current = displayStream;
      setRecorderState('recording');
      
      // Timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
      const audioStream = new MediaStream(displayStream.getAudioTracks());
      mediaRecorderRef.current = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const completeBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(completeBlob);
        setAudioUrl(URL.createObjectURL(completeBlob));
        setRecorderState('stopped');
        audioChunksRef.current = [];
        streamRef.current?.getTracks().forEach(track => track.stop());
        
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };

      // Gestisci quando l'utente clicca "Interrompi condivisione"
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

      mediaRecorderRef.current.start();

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError("Registrazione annullata.");
      } else {
        setError("Errore durante l'avvio della registrazione.");
      }
      console.error("Errore getDisplayMedia:", err);
      setRecorderState('error');
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);
  
  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setRecorderState('idle');
    setError(null);
    audioChunksRef.current = [];
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }, []);

  return {
    isRecording: recorderState === 'recording',
    isStopped: recorderState === 'stopped',
    recordingTime,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    clearRecording,
  };
};

