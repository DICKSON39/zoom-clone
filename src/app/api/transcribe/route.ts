// src/app/api/transcribe/route.ts
import { NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";
import fs from "fs/promises";

export async function POST(req: Request) {
  try {
    const { audioBase64 } = await req.json();
    const audioBuffer = Buffer.from(audioBase64, "base64");

    // Save temp audio file
    const tempFile = path.join(process.cwd(), "temp.wav");
    await fs.writeFile(tempFile, audioBuffer);

    // Path to your prebuilt whisper main.exe and model
    const exePath = path.join(
      process.cwd(),
      "node_modules/whisper-node/lib/whisper.cpp/main.exe"
    );
    const modelPath = path.join(
      process.cwd(),
      "node_modules/whisper-node/lib/whisper.cpp/models/ggml-tiny.bin"
    );

    const transcript = await new Promise<string>((resolve, reject) => {
      execFile(exePath, ["-m", modelPath, "-f", tempFile], (err, stdout) => {
        if (err) return reject(err);
        // Whisper output contains the transcript at the end
        const lines = stdout.split("\n").filter(Boolean);
        resolve(lines[lines.length - 1] || "");
      });
    });

    // Delete temp file
    await fs.unlink(tempFile);

    return NextResponse.json({ transcript });
  } catch (err) {
    console.error("Whisper transcription error:", err);
    return NextResponse.json({ transcript: "" });
  }
}
