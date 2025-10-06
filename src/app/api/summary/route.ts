// my-app/src/app/api/summary/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // Reject empty text early
    if (!text?.trim()) {
      return NextResponse.json({ summary: "Error: No text provided for summarization." });
    }

    const res = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    // Handle non-OK responses
    if (!res.ok) {
      const errorText = await res.text();
      console.error("HuggingFace API error:", res.status, errorText);

      return NextResponse.json({
        summary: `Error: HuggingFace API returned ${res.status}. Try shorter text or check the API key.`,
      });
    }

    // Safely parse JSON
    let data;
    try {
      data = await res.json();
    } catch (err) {
      const htmlText = await res.text();
      console.error("HuggingFace returned non-JSON:", htmlText);

      return NextResponse.json({
        summary: "Error: HuggingFace API did not return valid JSON. Try again later.",
      });
    }

    // Hugging Face models return an array with summary_text
    const summary = data[0]?.summary_text || "No summary available.";
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Unexpected server error:", err);
    return NextResponse.json({
      summary: "Error: Server failed to process request. Try again later.",
    });
  }
}
