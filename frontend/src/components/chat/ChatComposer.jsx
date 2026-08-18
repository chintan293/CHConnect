import { Button, TextArea } from "@heroui/react";
import { Paperclip, LoaderIcon, SendHorizontalIcon, Smile } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import { useChatStore } from "../../store/useChatStore";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";

const POPULAR_EMOJIS = ["👍", "❤️", "😂", "🔥", "🎉", "😍", "🙏", "😊", "✨", "🙌", "💯", "😎", "🚀", "👌"];

export function ChatComposer() {
  const composerText = useChatStore((state) => state.composerText);
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
  const sendMediaMessage = useChatStore((state) => state.sendMediaMessage);
  const isSendingMedia = useChatStore((state) => state.isSendingMedia);
  const uploadProgress = useChatStore((state) => state.uploadProgress);
  const sendTextMessage = useChatStore((state) => state.sendTextMessage);
  const setComposerText = useChatStore((state) => state.setComposerText);
  const sendTyping = useChatStore((state) => state.sendTyping);
  const sendStopTyping = useChatStore((state) => state.sendStopTyping);
  
  const { activeConversationId } = useSelectedConversation();
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const mediaInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const playSoundIfEnabled = () => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
  };

  const handleSend = async () => {
    if (activeConversationId) {
      sendStopTyping(activeConversationId);
    }
    setShowEmojiPicker(false);
    const didSendMessage = await sendTextMessage(activeConversationId);
    if (didSendMessage) playSoundIfEnabled();
  };

  const handleComposerTextChange = (event) => {
    const val = event.target.value;
    setComposerText(val);
    playSoundIfEnabled();

    if (activeConversationId) {
      sendTyping(activeConversationId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendStopTyping(activeConversationId);
      }, 2000);
    }
  };

  const handleMediaPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
       toast.error("File is too large. Maximum allowed size is 10 MB.");
       return;
    }

    const didSendMessage = await sendMediaMessage({
      conversationId: activeConversationId,
      file,
    });

    if (didSendMessage) playSoundIfEnabled();
  };

  const handleEmojiClick = (emoji) => {
    setComposerText(composerText + emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <footer className="relative shrink-0 border-t border-border px-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-2">
      {showEmojiPicker ? (
        <div className="absolute bottom-full left-3 mb-2 z-20 flex max-w-xs flex-wrap gap-1.5 rounded-2xl border border-border bg-surface p-2.5 shadow-xl backdrop-blur-md">
          {POPULAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="flex size-8 items-center justify-center rounded-lg text-lg transition-transform hover:scale-125 hover:bg-muted/10 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}

      {isSendingMedia ? (
        <div className="mx-auto mb-2 flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
          <LoaderIcon
            className="size-4 shrink-0 animate-spin text-accent"
            strokeWidth={2}
            aria-hidden
          />
          <span className="flex-1 truncate">Uploading file...</span>
          {uploadProgress > 0 && <span className="font-mono text-xs font-semibold tabular-nums text-accent">{uploadProgress}%</span>}
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-full items-end gap-1.5 px-0.5 sm:gap-2 sm:px-1">
        <input
          ref={mediaInputRef}
          type="file"
          accept="*/*"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          aria-hidden
          onChange={handleMediaPick}
        />

        <Button
          variant="ghost"
          isIconOnly
          isDisabled={isSendingMedia}
          aria-label="Toggle emoji picker"
          className="size-9 shrink-0 touch-manipulation self-end text-muted hover:text-foreground"
          onPress={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="size-5 sm:size-6" strokeWidth={1.8} />
        </Button>

        <Button
          variant="ghost"
          isIconOnly
          isDisabled={isSendingMedia}
          aria-label="Attach photo, video or audio"
          className="size-9 shrink-0 touch-manipulation self-end text-accent"
          onPress={() => mediaInputRef.current?.click()}
        >
          <Paperclip className="size-5 sm:size-6" strokeWidth={2} />
        </Button>

        <TextArea
          fullWidth
          variant="secondary"
          placeholder="Type a message"
          rows={1}
          value={composerText}
          onChange={handleComposerTextChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 rounded-full"
        />

        <Button variant="primary" isIconOnly isDisabled={!composerText.trim()} onPress={handleSend}>
          <SendHorizontalIcon className="size-5" />
        </Button>
      </div>
    </footer>
  );
}