"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechStatus = "idle" | "loading" | "playing";

const MIME = "audio/mpeg";

type MSCtor = typeof MediaSource & { isTypeSupported(t: string): boolean };

// iOS 17.1+ exposes ManagedMediaSource instead of MediaSource. Prefer it where
// available — it's the one Safari actually supports for streaming audio.
function getMediaSourceCtor(): MSCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    ManagedMediaSource?: MSCtor;
    MediaSource?: MSCtor;
  };
  const C = w.ManagedMediaSource ?? w.MediaSource;
  if (!C || typeof C.isTypeSupported !== "function") return null;
  return C.isTypeSupported(MIME) ? C : null;
}

export function useSpeech() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    const ms = mediaSourceRef.current;
    if (ms && ms.readyState === "open") {
      try {
        ms.endOfStream();
      } catch {
        // ignore — MediaSource may already be closing
      }
    }
    mediaSourceRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setActiveId(null);
    setStatus("idle");
  }, []);

  useEffect(() => stop, [stop]);

  const play = useCallback(
    async (id: string, text: string) => {
      if (activeId === id) {
        stop();
        return;
      }
      stop();
      if (!text.trim()) return;

      const ac = new AbortController();
      abortRef.current = ac;
      setActiveId(id);
      setStatus("loading");

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: ac.signal,
        });
        if (!res.ok || !res.body) throw new Error(`TTS failed (${res.status})`);

        const MSCtor = getMediaSourceCtor();
        if (MSCtor) {
          await playStreaming(res.body, MSCtor, ac, {
            onStart: () => setStatus("playing"),
            setAudio: (a) => (audioRef.current = a),
            setUrl: (u) => (urlRef.current = u),
            setMediaSource: (m) => (mediaSourceRef.current = m),
            onEnd: () => stop(),
          });
        } else {
          // Fallback: wait for full blob, then play. Older browsers / no MSE.
          const blob = await res.blob();
          if (ac.signal.aborted) return;
          const url = URL.createObjectURL(blob);
          urlRef.current = url;
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => stop();
          audio.onerror = () => stop();
          setStatus("playing");
          await audio.play();
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("TTS error:", err);
        }
        stop();
      }
    },
    [activeId, stop],
  );

  return { activeId, status, play, stop };
}

interface StreamingHandles {
  onStart: () => void;
  setAudio: (a: HTMLAudioElement) => void;
  setUrl: (u: string) => void;
  setMediaSource: (m: MediaSource) => void;
  onEnd: () => void;
}

async function playStreaming(
  body: ReadableStream<Uint8Array>,
  MSCtor: MSCtor,
  ac: AbortController,
  h: StreamingHandles,
): Promise<void> {
  const mediaSource = new MSCtor();
  h.setMediaSource(mediaSource);
  const url = URL.createObjectURL(mediaSource);
  h.setUrl(url);

  const audio = new Audio();
  h.setAudio(audio);
  audio.src = url;
  audio.onended = h.onEnd;
  audio.onerror = h.onEnd;

  await new Promise<void>((resolve, reject) => {
    mediaSource.addEventListener("sourceopen", () => resolve(), { once: true });
    mediaSource.addEventListener("error", () => reject(new Error("MediaSource error")), { once: true });
    ac.signal.addEventListener("abort", () => reject(new Error("AbortError")), { once: true });
  });
  if (ac.signal.aborted) return;

  const sb = mediaSource.addSourceBuffer(MIME);
  const queue: BufferSource[] = [];
  let closing = false;

  const pump = () => {
    if (sb.updating || queue.length === 0) return;
    const chunk = queue.shift()!;
    try {
      sb.appendBuffer(chunk);
    } catch {
      h.onEnd();
    }
  };
  sb.addEventListener("updateend", () => {
    if (queue.length > 0) pump();
    else if (closing && mediaSource.readyState === "open") {
      try {
        mediaSource.endOfStream();
      } catch {
        // already closed
      }
    }
  });

  // Start playback as soon as enough has buffered.
  const started = { value: false };
  audio.addEventListener("canplay", () => {
    if (started.value) return;
    started.value = true;
    h.onStart();
    void audio.play().catch(() => h.onEnd());
  });

  const reader = body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (ac.signal.aborted) return;
      if (done) {
        closing = true;
        if (!sb.updating && mediaSource.readyState === "open") {
          try {
            mediaSource.endOfStream();
          } catch {
            // ignore
          }
        }
        return;
      }
      if (value) {
        queue.push(value as BufferSource);
        pump();
      }
    }
  } catch (err) {
    if ((err as Error).name !== "AbortError") throw err;
  }
}
