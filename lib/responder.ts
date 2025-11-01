type Role = "system" | "user" | "assistant";

export type ChatMessage = {
  role: Role;
  content: string;
};

type KnowledgeEntry = {
  id: string;
  description: string;
  keywords: string[];
  response: string | ((prompt: string, history: ChatMessage[]) => string);
};

const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "intro",
    description: "Greeting and high level overview",
    keywords: ["hello", "hi", "hey", "who", "what", "are you", "introduce"],
    response: (prompt) =>
      `Hello! I’m Agentic Chat, a conversational assistant modeled after ChatGPT. I can help you explore ideas, break down problems, sketch product plans, or brainstorm content. Just let me know what you’d like to accomplish.`
  },
  {
    id: "code-help",
    description: "Explain coding problems or generate snippets",
    keywords: [
      "code",
      "bug",
      "error",
      "typescript",
      "javascript",
      "react",
      "component",
      "function",
      "algorithm",
      "regex",
      "next.js"
    ],
    response: (prompt) => {
      const request = prompt.trim();
      return [
        `Here's a breakdown you can follow:`,
        ``,
        `1. **Reframe the problem** – ${summarizePrompt(request)}.`,
        `2. **Steps to implement**`,
        `   - Identify the core data structures you need.`,
        `   - Map out the component or function signature.`,
        `   - Validate edge-cases before wiring it into the UI.`,
        `3. **Example scaffold**`,
        "```ts",
        "export function solve(input: InputType): OutputType {",
        "  // 1. Guard clauses for invalid state",
        "  // 2. Perform core transformation",
        "  // 3. Return the result in a predictable shape",
        "}",
        "```",
        ``,
        `Feel free to share the exact error message or file, and I’ll get more specific.`
      ].join("\n");
    }
  },
  {
    id: "product",
    description: "Product ideation or strategy",
    keywords: ["roadmap", "product", "market", "business", "strategy", "launch", "feature"],
    response: () =>
      [
        `Let's structure this idea so you can move quickly:`,
        ``,
        `- **North Star** – Clarify the outcome you want a user to achieve.`,
        `- **User Segments** – Define primary users, their motivations, and current workaround.`,
        `- **Experience Slice** – Identify the smallest valuable workflow you can ship.`,
        `- **Instrumentation** – Decide how you’ll measure adoption and success.`,
        ``,
        `Once you outline these, we can dig into messaging, activation loops, and technical scope.`
      ].join("\n")
  },
  {
    id: "writing",
    description: "Content creation guidance",
    keywords: ["write", "blog", "article", "essay", "story", "copy", "email", "tone", "style"],
    response: () =>
      [
        `Let's shape your writing with a clear template:`,
        ``,
        `1. **Audience & intent** – spell out who you’re speaking to and the outcome you want.`,
        `2. **Core message** – reduce it to a single, memorable sentence.`,
        `3. **Structure** – Outline an engaging hook, supporting arguments, and call-to-action.`,
        `4. **Voice** – Choose 2–3 adjectives (e.g. warm, practical, bold) to anchor the tone.`,
        ``,
        `Share any draft fragments and we’ll iterate together.`
      ].join("\n")
  },
  {
    id: "default",
    description: "Fallback response",
    keywords: [],
    response: (prompt, history) => {
      const insight = synthesizeContext(history);
      return [
        insight && `From what we've covered: ${insight}`,
        `Here’s how we can move forward:`,
        ``,
        `- Clarify what success looks like or share constraints.`,
        `- Break the problem into smaller, verifiable steps.`,
        `- Prioritize the next experiment so we can learn quickly.`,
        ``,
        `Drop more details and I’ll help fill in the gaps.`
      ]
        .filter(Boolean)
        .join("\n");
    }
  }
];

const heuristics: Array<{
  match: (prompt: string) => boolean;
  response: (prompt: string) => string;
}> = [
  {
    match: (prompt) => /^(hi|hello|hey)\b/i.test(prompt),
    response: () =>
      `Hi there! What should we explore together today? I can help with code, product strategy, writing, or brainstorming new directions.`
  },
  {
    match: (prompt) => /explain|how does|what is/i.test(prompt),
    response: (prompt) =>
      `Let’s break that down:\n\n- **Concept** – ${summarizePrompt(prompt)}\n- **Mechanics** – Think about inputs, transformations, and outputs.\n- **Next step** – Identify an example or edge-case to validate your understanding.`
  },
  {
    match: (prompt) => /\bplan\b|\broadmap\b|\bstrategy\b/i.test(prompt),
    response: (prompt) =>
      [
        `Here’s a lightweight plan you can adapt:`,
        ``,
        `- **Context** – ${summarizePrompt(prompt)}.`,
        `- **Milestones** – Organize work into momentum-building releases.`,
        `- **Risks** – Call out what could block progress and how to de-risk early.`,
        `- **Signals** – Define metrics or qualitative cues that tell you it’s working.`,
        ``,
        `Want a deeper dive on any section?`
      ].join("\n")
  }
];

function summarizePrompt(prompt: string) {
  return prompt.length > 140 ? `${prompt.slice(0, 135).trim()}…` : prompt.trim();
}

function synthesizeContext(history: ChatMessage[]) {
  const recent = history.slice(-4).filter((item) => item.role === "user");
  if (!recent.length) return "";

  const themes = recent
    .map((msg) => msg.content.toLowerCase())
    .map((content) => {
      if (content.includes("code")) return "you’re iterating on code.";
      if (content.includes("product")) return "you’re shaping a product concept.";
      if (content.includes("write")) return "you’re refining some writing.";
      return "you’re unpacking an idea.";
    });

  const uniqueThemes = Array.from(new Set(themes));
  return uniqueThemes.join(" Also, ");
}

function scoreEntry(prompt: string, entry: KnowledgeEntry) {
  if (!entry.keywords.length) return 0;
  const lower = prompt.toLowerCase();
  return entry.keywords.reduce((score, keyword) => {
    if (lower.includes(keyword)) {
      return score + Math.min(3, keyword.length / 4);
    }
    return score;
  }, 0);
}

function selectKnowledge(prompt: string): KnowledgeEntry {
  const sorted = knowledgeBase
    .filter((entry) => entry.id !== "default")
    .map((entry) => ({ entry, score: scoreEntry(prompt, entry) }))
    .sort((a, b) => b.score - a.score);

  const top = sorted[0];
  if (!top || top.score < 2) {
    return knowledgeBase.find((entry) => entry.id === "default")!;
  }

  return top.entry;
}

export function generateResponse(messages: ChatMessage[]) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const prompt = lastUserMessage?.content ?? "";
  if (!prompt) {
    return `I'm here and ready whenever you are.`;
  }

  const heuristic = heuristics.find((item) => item.match(prompt));
  if (heuristic) {
    return heuristic.response(prompt);
  }

  const entry = selectKnowledge(prompt);
  if (typeof entry.response === "function") {
    return entry.response(prompt, messages);
  }
  return entry.response;
}
