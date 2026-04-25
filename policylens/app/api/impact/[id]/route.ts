import { NextRequest, NextResponse } from "next/server";
import { getBillById as getLocalBill } from "@/data/bills";
import { parseCgovId, getBillById as getCgovBill, getBillSummary } from "@/lib/congress";
import { Mistral } from "@mistralai/mistralai";

export const maxDuration = 120;

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY, timeoutMs: 120_000 });

export interface PersonalImpactResult {
  summary: string;
  impacts: {
    category: string;
    effect: "positive" | "negative" | "neutral" | "mixed";
    headline: string;
    detail: string;
  }[];
  biggestWin: string | null;
  biggestRisk: string | null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const { income, state, occupation, familyStatus, ageGroup } = body;
  if (!income || !state || !occupation) {
    return NextResponse.json({ error: "Missing profile fields" }, { status: 400 });
  }

  let billTitle: string;
  let billText: string;

  if (id.startsWith("cgov_")) {
    const { congress, type, number } = parseCgovId(id);
    const [bill, summary] = await Promise.all([
      getCgovBill(congress, type, number),
      getBillSummary(congress, type, number),
    ]);
    if (!bill || !summary) {
      return NextResponse.json({ error: "Bill not found or no summary available" }, { status: 404 });
    }
    billTitle = bill.title;
    billText = `${bill.billNumber} — ${bill.title}\nLatest Action: ${bill.latestAction}\n\n${summary}`;
  } else {
    const bill = getLocalBill(id);
    if (!bill?.fullText) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }
    billTitle = bill.title;
    billText = bill.fullText;
  }

  const prompt = `You are a nonpartisan policy analyst. A user wants to know how a specific bill personally affects them. Be specific, concrete, and use real numbers where possible.

Bill: ${billTitle}

Bill Content:
${billText.slice(0, 6000)}

User Profile:
- Annual income: ${income}
- State: ${state}
- Occupation/sector: ${occupation}
- Family status: ${familyStatus}
- Age group: ${ageGroup}

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "summary": "2-3 sentence personalized summary of how this bill affects this specific person given their profile",
  "impacts": [
    {
      "category": "Taxes",
      "effect": "positive",
      "headline": "Concrete, specific headline about this impact — use dollar amounts or percentages when possible",
      "detail": "1-2 sentence explanation of why and how this affects them specifically given their profile"
    },
    {
      "category": "Healthcare",
      "effect": "negative",
      "headline": "...",
      "detail": "..."
    },
    {
      "category": "Employment",
      "effect": "neutral",
      "headline": "...",
      "detail": "..."
    }
  ],
  "biggestWin": "One sentence on the single biggest benefit for this person, or null if none",
  "biggestRisk": "One sentence on the single biggest downside for this person, or null if none"
}

Rules:
- Only include impact categories that are actually relevant to this bill — 2 to 5 impacts max
- effect must be exactly one of: "positive", "negative", "neutral", "mixed"
- Be specific to the user's income level, state, occupation, and family status
- Use real numbers from the bill where possible (e.g. "$2,500 child tax credit", "$35/month insulin cap")
- If the bill has minimal impact on this person, say so honestly
`;

  try {
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("No response");

    const json = content.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const result: PersonalImpactResult = JSON.parse(json);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Impact error:", err);
    return NextResponse.json({ error: "Failed to calculate impact" }, { status: 500 });
  }
}
