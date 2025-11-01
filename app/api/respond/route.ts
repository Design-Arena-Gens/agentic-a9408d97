import { NextResponse } from "next/server";
import { generateResponse, type ChatMessage } from "@/lib/responder";

type RequestPayload = {
  messages: ChatMessage[];
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestPayload;
    const { messages } = payload;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const reply = generateResponse(messages);
    return NextResponse.json({ message: reply });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
