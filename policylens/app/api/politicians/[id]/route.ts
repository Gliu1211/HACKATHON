import { NextRequest, NextResponse } from "next/server";
import { getBillById as getLocalBill } from "@/data/bills";
import { parseCgovId, getBillById as getCgovBill, getBillSummary } from "@/lib/congress";
import { Mistral } from "@mistralai/mistralai";

export const maxDuration = 120;

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY, timeoutMs: 120_000 });

export interface PoliticianPosition {
  name: string;
  title: string;
  party: "D" | "R" | "I";
  state: string;
  stance: "strong support" | "lean support" | "neutral" | "lean oppose" | "strong oppose";
  role: "sponsor" | "supporter" | "opponent" | "notable";
  quote: string;
  reasoning: string;
}

export interface PoliticiansResult {
  supporters: PoliticianPosition[];
  opponents: PoliticianPosition[];
  notable: PoliticianPosition[];
  context: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let billTitle: string;
  let billContext: string;

  if (id.startsWith("cgov_")) {
    const { congress, type, number } = parseCgovId(id);
    const [bill, summary] = await Promise.all([
      getCgovBill(congress, type, number),
      getBillSummary(congress, type, number),
    ]);
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    billTitle = bill.title;
    billContext = `${bill.billNumber} — ${bill.title}\nSponsor: ${bill.sponsor} (${bill.sponsorParty}-${bill.sponsorState})\n\n${summary?.slice(0, 3000) ?? ""}`;
  } else {
    const bill = getLocalBill(id);
    if (!bill?.fullText) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    billTitle = bill.title;
    billContext = `${bill.billNumber} — ${bill.title}\nSponsor: ${bill.sponsor} (${bill.sponsorParty}-${bill.sponsorState})\n\n${bill.fullText.slice(0, 3000)}`;
  }

  const prompt = `You are a nonpartisan political researcher. Based on your knowledge of real politicians' publicly stated positions, generate a list of key figures who have taken notable stances on this bill.

Bill: ${billTitle}
Context: ${billContext}

Return ONLY valid JSON (no markdown):
{
  "supporters": [
    {
      "name": "Full Name",
      "title": "Senator" or "Representative" or "President" or "Governor",
      "party": "D" or "R" or "I",
      "state": "State abbreviation e.g. NY",
      "stance": "strong support",
      "role": "sponsor" or "supporter",
      "quote": "A representative quote or paraphrase of their stated position in quotes",
      "reasoning": "1 sentence on why they support it based on their known positions"
    }
  ],
  "opponents": [
    {
      "name": "Full Name",
      "title": "Senator" or "Representative" or "President" or "Governor",
      "party": "D" or "R" or "I",
      "state": "State abbreviation",
      "stance": "strong oppose",
      "role": "opponent",
      "quote": "A representative quote or paraphrase of their stated position in quotes",
      "reasoning": "1 sentence on why they oppose it based on their known positions"
    }
  ],
  "notable": [
    {
      "name": "Full Name",
      "title": "their title",
      "party": "D" or "R" or "I",
      "state": "State abbreviation",
      "stance": "neutral" or "mixed",
      "role": "notable",
      "quote": "Their nuanced or notable statement",
      "reasoning": "Why their position is particularly notable or interesting"
    }
  ],
  "context": "1-2 sentences on the overall political dynamic around this bill — who's the key coalition, what's the main fault line"
}

Rules:
- Only include real politicians with real publicly known positions on this bill
- 2-4 supporters, 2-4 opponents, 0-2 notable/swing figures
- Quotes should be paraphrases of real statements, clearly representative of their position
- stance must be one of: "strong support", "lean support", "neutral", "lean oppose", "strong oppose"
- party must be one of: "D", "R", "I"
- role must be one of: "sponsor", "supporter", "opponent", "notable"
`;

  try {
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("No response");

    const json = content.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const result: PoliticiansResult = JSON.parse(json);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Politicians error:", err);
    return NextResponse.json({ error: "Failed to load politician data" }, { status: 500 });
  }
}
