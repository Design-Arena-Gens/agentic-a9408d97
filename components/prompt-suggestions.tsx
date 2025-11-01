import { motion } from "framer-motion";

export type PromptSuggestion = {
  title: string;
  prompt: string;
};

type PromptSuggestionsProps = {
  onSelect: (prompt: string) => void;
};

const suggestions: PromptSuggestion[] = [
  {
    title: "Plan a product launch",
    prompt: "Help me outline a product launch plan for a productivity app targeting remote teams."
  },
  {
    title: "Refine my code",
    prompt: "Review this React component and suggest improvements for accessibility and state management."
  },
  {
    title: "Rework my copy",
    prompt: "Rewrite this landing page hero copy with a confident, friendly tone that highlights a new AI feature."
  },
  {
    title: "Unlock momentum",
    prompt: "Help me break down a complex technical project into milestones and quick wins."
  }
];

export function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 120 }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + index * 0.04, type: "spring", stiffness: 160, damping: 18 }}
          onClick={() => onSelect(suggestion.prompt)}
          className="group rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-white/20 hover:bg-white/[0.08]"
        >
          <div className="text-sm font-semibold text-white">{suggestion.title}</div>
          <div className="mt-2 text-xs text-text.muted">{suggestion.prompt}</div>
        </motion.button>
      ))}
    </motion.div>
  );
}
