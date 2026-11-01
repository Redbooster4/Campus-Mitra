import { useEffect, useRef, useState } from "react";
import api from "@/api/api";
import { LoaderCircle, Mic, Square } from "lucide-react";
import styles from "./VoiceInput.module.css";

const MAX_RECORDING_MS = 90_000;
const MIME_TYPES=[
  "audio/webm;codecs=opus", 
  "audio/ogg;codecs=opus", 
  "audio/mp4", 
  "audio/webm"
];
const LANGUAGE_CODES = {
  English: "en",
  Hindi: "hi",
  Marathi: "mr",
  Gujarati: "gu",
};

export default function VoiceInput({ disabled = false, language = "English", onTranscript, onBusyChange }) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const wrapperRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const chunksRef = useRef([]);
  const frameRef = useRef(null);
  const stopTimerRef = useRef(null);
  const requestRef = useRef(null);
  const mountedRef = useRef(false);
  const discardRecordingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      discardRecordingRef.current = true;
      window.clearTimeout(stopTimerRef.current);
      window.cancelAnimationFrame(frameRef.current);
      requestRef.current?.abort();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const releaseAudio = () => {
    window.clearTimeout(stopTimerRef.current);
    window.cancelAnimationFrame(frameRef.current);
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed") audioContext.close().catch(() => {});
    wrapperRef.current?.style.setProperty("--voice-level", "0");
  };

  const startVoiceMeter = (stream) => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass || !wrapperRef.current) return;

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    const samples = new Uint8Array(analyser.fftSize);

    const updateLevel = () => {
      if (!analyserRef.current || !wrapperRef.current) return;
      analyserRef.current.getByteTimeDomainData(samples);
      const meanSquare = samples.reduce((total, sample) => total + ((sample - 128) / 128) ** 2, 0) / samples.length;
      const level = Math.min(1, Math.sqrt(meanSquare) * 2.8);
      wrapperRef.current.style.setProperty("--voice-level", level.toFixed(2));
      frameRef.current = window.requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const transcribeRecording = async (blob) => {
    if (discardRecordingRef.current || !blob.size) {
      if (mountedRef.current && !blob.size) setError("I didn't catch any audio. Try again.");
      if (mountedRef.current) onBusyChange?.(false);
      return;
    }

    setTranscribing(true);
    setError("");
    const requestController = new AbortController();
    requestRef.current = requestController;
    try {
      const response = await api.post(
        "/voice/transcribe",
        blob,
        {
          params: { language: LANGUAGE_CODES[language] || "en" },
          headers: { "Content-Type": blob.type || "audio/webm" },
          signal: requestController.signal,
          timeout: 65_000,
        }
      );
      const transcript = response.data?.text?.trim();
      if (!transcript) throw new Error("No speech was recognized. Try speaking a little closer to your mic.");
      if (mountedRef.current) {
        onTranscript?.(transcript);
        setAnnouncement("Transcript added to your message.");
      }
    } 
    catch(requestError){
      if (requestError.name !== "CanceledError" && requestError.name !== "AbortError" && mountedRef.current) {
        setError(requestError.response?.data?.error || requestError.message || "Couldn't transcribe that recording. Try again.");
      }
    } 
    finally{
      if (mountedRef.current) {
        setTranscribing(false);
        onBusyChange?.(false);
      }
      requestRef.current = null;
    }
  };

  const startRecording = async () => {
    setError("");
    setAnnouncement("");
    onBusyChange?.(true);
    discardRecordingRef.current = false;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Voice recording isn't supported by this browser.");
      onBusyChange?.(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const mimeType = typeof MediaRecorder.isTypeSupported === "function"
        ? MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type))
        : undefined;
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];
      startVoiceMeter(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        releaseAudio();
        if (mountedRef.current) setRecording(false);
        void transcribeRecording(blob);
      };
      recorder.onerror = () => {
        discardRecordingRef.current = true;
        releaseAudio();
        if (mountedRef.current) {
          setRecording(false);
          setError("The microphone recording stopped unexpectedly. Please try again.");
          onBusyChange?.(false);
        }
      };

      recorder.start(250);
      setRecording(true);
      stopTimerRef.current = window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, MAX_RECORDING_MS);
    } catch (recordingError) {
      releaseAudio();
      if (mountedRef.current) {
        setError(recordingError.name === "NotAllowedError"
          ? "Allow microphone access to use voice input."
          : "Couldn't start the microphone. Please try again.");
        onBusyChange?.(false);
      }
    }
  };

  const stopRecording = () => {
    window.clearTimeout(stopTimerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const statusText = recording ? "Listening to your voice" : transcribing ? "Transcribing your voice" : announcement;

  return (
    <div className={`${styles.voiceControl} ${recording ? styles.hasMeter : ""}`} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.voiceButton} ${recording ? styles.isListening : ""}`}
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled || transcribing}
        aria-label={recording ? "Stop recording and transcribe" : "Start voice input with cloud transcription"}
        title={recording ? "Stop and transcribe" : "Record voice for cloud transcription"}
      >
        {transcribing ? <LoaderCircle className={styles.transcribingIcon} size={17} />
          : recording ? <Square size={14} fill="currentColor" />
            : <Mic size={17} />}
      </button>
      {recording && (
        <span className={styles.voiceWaves} aria-hidden="true">
          <i /><i /><i /><i /><i />
        </span>
      )}
      {error && <span className={styles.voiceError} role="alert">{error}</span>}
      <span className={styles.screenReaderOnly} role="status" aria-live="polite">{statusText}</span>
    </div>
  );
}
