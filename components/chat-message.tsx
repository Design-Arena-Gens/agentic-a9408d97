import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MessageProps = {
  role: "user" | "assistant" | "system";
  content: string;
  index: number;
  isStreaming?: boolean;
};

const bubbleStyles = {
  user: "bg-gradient-to-br from-accent.subtle to-accent.soft text-white shadow-lg shadow-indigo-500/20",
  assistant: "bg-base.light border border-white/5 text-text.secondary backdrop-blur",
  system: "bg-base.lighter text-text.muted border border-white/5"
};

export function ChatMessage({ role, content, index, isStreaming }: MessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 200, damping: 20 }}
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        role === "system" && "justify-center"
      )}
    >
      <div
        className={cn(
          "max-w-3xl rounded-3xl px-5 py-4 text-sm leading-6",
          "shadow-lg ring-1 ring-white/5",
          "whitespace-pre-wrap break-words",
          bubbleStyles[role] ?? bubbleStyles.assistant
        )}
      >
        <div className="flex flex-col gap-3">
          {content.split("\n").map((line, lineIndex) => (
            <p key={`${index}-${lineIndex}`} className="text-balance">
              {line || "\u00A0"}
            </p>
          ))}
          {isStreaming ? <span className="text-xs text-text.muted">Agentic is thinking…</span> : null}
        </div>
      </div>
    </motion.div>
  );
}
