"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatMessage as ChatMessageBubble } from "@/components/chat-message";
import { MessageComposer } from "@/components/message-composer";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import type { ChatMessage } from "@/lib/responder";

type MessageWithMeta = ChatMessage & { id: string };

const initialMessages: MessageWithMeta[] = [
  {
    id: "assistant-intro",
    role: "assistant",
    content: `Welcome to Agentic Chat. Drop a challenge, and I’ll help you unpack it with structure, clarity, and momentum.`
  }
];

export default function HomePage() {
  const [messages, setMessages] = useState<MessageWithMeta[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [allMessages]);

  const sendMessage = useCallback(async (input: string) => {
    const userMessage: MessageWithMeta = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ id, ...message }) => message)
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response.");
      }

      const data = (await response.json()) as { message: string };
      const assistantMessage: MessageWithMeta = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleSuggestion = useCallback(
    async (prompt: string) => {
      await sendMessage(prompt);
    },
    [sendMessage]
  );

  return (
    <main className="flex min-h-screen flex-col items-center px-4 pb-24 pt-16 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-6 text-center">
          <span className="mx-auto inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-text.muted">
            Agentic Chat Interface
          </span>
          <h1 className="text-balance text-4xl font-semibold text-white sm:text-5xl">
            A focused conversational partner for shipping ideas faster.
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-sm text-text.secondary sm:text-base">
            Designed to feel like ChatGPT, tuned for product builders and creatives. Keep a running
            conversation, refine your thinking, and capture traction one clear step at a time.
          </p>
        </div>

        <PromptSuggestions onSelect={handleSuggestion} />

        <div
          ref={containerRef}
          className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto rounded-3xl border border-white/5 bg-base.light/60 p-6 shadow-inner backdrop-blur"
        >
          {allMessages.map((message, index) => (
            <ChatMessageBubble key={message.id} role={message.role} content={message.content} index={index} />
          ))}
          {isLoading ? (
            <ChatMessageBubble
              key="assistant-pending"
              role="assistant"
              content="Let me gather my thoughts…"
              index={allMessages.length + 1}
              isStreaming
            />
          ) : null}
        </div>

        <MessageComposer onSend={sendMessage} disabled={isLoading} />

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <footer className="mt-6 text-center text-xs text-text.muted">
          Built with Next.js · Deployed to Vercel · Responses are generated locally without external AI APIs.
        </footer>
      </div>
    </main>
  );
}
