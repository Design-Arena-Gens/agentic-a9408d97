import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

type MessageComposerProps = {
  disabled?: boolean;
  onSend: (message: string) => Promise<void> | void;
};

export function MessageComposer({ disabled, onSend }: MessageComposerProps) {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim() || disabled || isSending) return;

    setIsSending(true);
    try {
      const nextValue = value.trim();
      setValue("");
      await onSend(nextValue);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex w-full flex-col gap-4 rounded-3xl border border-white/8 bg-white/[0.04] p-4 backdrop-blur transition",
        "shadow-[0_18px_60px_-30px_rgba(79,70,229,0.65)]"
      )}
    >
      <textarea
        className="min-h-[110px] resize-none rounded-2xl border border-transparent bg-base.lighter px-4 py-3 text-sm text-white shadow-inner outline-none focus:border-accent.soft focus:ring-2 focus:ring-accent.subtle/40"
        placeholder="Ask Agentic Chat anything…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled || isSending}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-text.muted">
          Agentic Chat crafts thoughtful, structured answers without external APIs.
        </span>
        <button
          type="submit"
          disabled={disabled || isSending || !value.trim()}
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent.soft",
            (disabled || isSending || !value.trim()) && "opacity-60"
          )}
        >
          {isSending ? "Thinking…" : "Send"}
        </button>
      </div>
    </form>
  );
}
