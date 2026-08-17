import { useState } from "react";
import { Check, CheckCheck, FileIcon, Clock, AlertCircle, Download } from "lucide-react";
import { withTransform } from "../../lib/imagekit";
import { MessageVideo } from "./MessageVideo";
import { MessageAudio } from "./MessageAudio";

const IMAGE_TRANSFORM = "q-auto,w-640,f-auto";

export function MessageBubble({ message }) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const isOwnMessage = message.role === "me";
  const hasImage = Boolean(message.imageUrl);
  const hasVideo = Boolean(message.videoUrl);
  const hasAudio = Boolean(message.audioUrl);
  const hasFile = Boolean(message.fileUrl) || Boolean(message.fileName && !hasImage && !hasVideo && !hasAudio);

  const status = message.status || (message.isRead ? "read" : "sent");

  return (
    <div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[min(90%,28rem)] rounded-2xl px-3 py-2 text-[15px] leading-snug sm:max-w-[min(75%,28rem)] sm:px-3.5 shadow-xs ${
          isOwnMessage
            ? "rounded-br-md bg-accent text-accent-foreground"
            : "rounded-bl-md bg-surface border border-border/50 text-foreground"
        }`}
      >
        {hasImage ? (
          <>
            <img
              src={withTransform(message.imageUrl, IMAGE_TRANSFORM)}
              alt="Attached photo"
              onClick={() => setIsImageOpen(true)}
              className="mb-1.5 max-h-48 max-w-full cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-90 sm:max-h-60 sm:rounded-xl"
            />
            {isImageOpen ? (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
                onClick={() => setIsImageOpen(false)}
              >
                <img
                  src={message.imageUrl}
                  alt="Full size view"
                  className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                />
              </div>
            ) : null}
          </>
        ) : null}

        {hasVideo ? <MessageVideo src={message.videoUrl} /> : null}

        {hasAudio ? <MessageAudio src={message.audioUrl} isOwnMessage={isOwnMessage} /> : null}

        {hasFile ? (
          <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 p-3 mb-1.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
              <FileIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{message.fileName || "Unknown file"}</span>
              <span className="text-xs text-muted-foreground">
                {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(2)} MB` : "Unknown size"}
              </span>
            </div>
            {message.fileUrl ? (
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
                download
              >
                <Download className="h-4 w-4 text-foreground/80" />
              </a>
            ) : null}
          </div>
        ) : null}

        {message.text ? (
          <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
        ) : null}

        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[11px] tabular-nums ${
            isOwnMessage ? "text-accent-foreground/80" : "text-muted"
          }`}
        >
          <span>{message.time}</span>
          {isOwnMessage ? (
            <span className="inline-flex items-center">
              {status === "read" ? (
                <CheckCheck className="size-3.5 text-sky-400 dark:text-sky-300 stroke-[2.5]" aria-label="Read" />
              ) : status === "delivered" ? (
                <CheckCheck className="size-3.5 opacity-80 stroke-[2]" aria-label="Delivered" />
              ) : status === "sent" ? (
                <Check className="size-3.5 opacity-70 stroke-[2]" aria-label="Sent" />
              ) : status === "sending" ? (
                <Clock className="size-3.5 opacity-60 stroke-[2]" aria-label="Sending" />
              ) : status === "failed" ? (
                <AlertCircle className="size-3.5 text-red-500 stroke-[2]" aria-label="Failed" />
              ) : null}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}