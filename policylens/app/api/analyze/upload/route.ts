import { NextRequest, NextResponse } from "next/server";
import { analyzeBill } from "@/lib/analyze";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = ((formData.get("title") as string) || "").trim() || "Uploaded Bill";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let text: string;

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    try {
      // Dynamic import avoids Next.js build-time issues with pdf-parse test files
      const pdfParse = (await import("pdf-parse")).default;
      const pdf = await pdfParse(buffer);
      text = pdf.text;
    } catch {
      return NextResponse.json({ error: "Could not read PDF. Try a text file instead." }, { status: 400 });
    }
  } else {
    text = buffer.toString("utf-8");
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "The file appears to be empty or unreadable." }, { status: 400 });
  }

  if (text.length > 200_000) {
    text = text.slice(0, 200_000);
  }

  try {
    const analysis = await analyzeBill(title, text);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Upload analysis error:", err);
    return NextResponse.json({ error: "Failed to analyze bill." }, { status: 500 });
  }
}
