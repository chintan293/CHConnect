import { useState, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export function MessageAudio({ src, isOwnMessage }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setProgress((current / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const formatAudioTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      className={`my-1 flex items-center gap-3 rounded-xl p-2.5 shadow-sm sm:max-w-xs ${
        isOwnMessage
          ? "bg-black/15 text-accent-foreground dark:bg-white/10"
          : "bg-muted/10 border border-border text-foreground"
      }`}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
        className="hidden"
      />

      <button
        type="button"
        onClick={togglePlay}
        className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 ${
          isOwnMessage
            ? "bg-accent-foreground text-accent"
            : "bg-accent text-accent-foreground"
        }`}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isPlaying ? (
          <Pause className="size-5 fill-current" />
        ) : (
          <Play className="size-5 fill-current translate-x-0.5" />
        )}
      </button>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between text-xs font-medium opacity-90">
          <span className="flex items-center gap-1">
            <Volume2 className="size-3.5" /> Voice note
          </span>
          <span>{formatAudioTime(duration)}</span>
        </div>

        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-black/20 dark:bg-white/20">
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              isOwnMessage ? "bg-accent-foreground" : "bg-accent"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
