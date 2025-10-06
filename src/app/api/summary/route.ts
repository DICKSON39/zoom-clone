// app/api/summary/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text } = await req.json();

  const res = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  const data = await res.json();

  // The model returns [{summary_text: "..."}]
  const summary = data[0]?.summary_text || "No summary available";

  return NextResponse.json({ summary });
}
