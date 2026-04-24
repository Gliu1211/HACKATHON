import Anthropic from "@anthropic-ai/sdk";
import { BillAnalysis } from "@/types";

const client = new Anthropic();

const ANALYSIS_PROMPT = (billTitle: string, billText: string) => `
You are a nonpartisan policy analyst. Analyze the following bill and return a JSON object with this exact structure. Be factual, balanced, and cite real ideological perspectives accurately.

Bill: ${billTitle}

Bill Text/Summary:
${billText}

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "tldr": "2-3 sentence plain English summary of what the bill does",
  "whatItDoes": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "whoItAffects": ["group 1: how", "group 2: how", "group 3: how", "group 4: how"],
  "whatChanges": ["change from current law 1", "change from current law 2", "change from current law 3", "change from current law 4"],
  "keyProvisions": [
    {"title": "Provision Name", "description": "What this provision does in plain English", "impact": "high"},
    {"title": "Provision Name", "description": "What this provision does in plain English", "impact": "high"},
    {"title": "Provision Name", "description": "What this provision does in plain English", "impact": "medium"},
    {"title": "Provision Name", "description": "What this provision does in plain English", "impact": "medium"},
    {"title": "Provision Name", "description": "What this provision does in plain English", "impact": "low"}
  ],
  "perspectives": {
    "left": {
      "framing": "One sentence describing how left-leaning groups frame this bill",
      "keyArguments": ["argument 1", "argument 2", "argument 3"],
      "concerns": ["concern 1", "concern 2", "concern 3"],
      "supportLevel": "strong support",
      "sources": [
        {"name": "Center on Budget and Policy Priorities", "lean": "left"},
        {"name": "Economic Policy Institute", "lean": "left"},
        {"name": "Brookings Institution", "lean": "center"}
      ]
    },
    "center": {
      "framing": "One sentence describing how centrist/nonpartisan groups frame this bill",
      "keyArguments": ["argument 1", "argument 2", "argument 3"],
      "concerns": ["concern 1", "concern 2", "concern 3"],
      "supportLevel": "mixed",
      "sources": [
        {"name": "Congressional Budget Office", "lean": "center"},
        {"name": "Bipartisan Policy Center", "lean": "center"}
      ]
    },
    "right": {
      "framing": "One sentence describing how right-leaning groups frame this bill",
      "keyArguments": ["argument 1", "argument 2", "argument 3"],
      "concerns": ["concern 1", "concern 2", "concern 3"],
      "supportLevel": "strong oppose",
      "sources": [
        {"name": "Heritage Foundation", "lean": "right"},
        {"name": "Cato Institute", "lean": "right"},
        {"name": "Americans for Tax Reform", "lean": "right"}
      ]
    }
  },
  "controversialSections": [
    {
      "provision": "Name of the most controversial provision",
      "leftView": "How the left views this specific provision",
      "rightView": "How the right views this specific provision",
      "coreDisagreement": "One sentence capturing the fundamental disagreement"
    },
    {
      "provision": "Second most controversial provision",
      "leftView": "How the left views this specific provision",
      "rightView": "How the right views this specific provision",
      "coreDisagreement": "One sentence capturing the fundamental disagreement"
    },
    {
      "provision": "Third controversial provision",
      "leftView": "How the left views this specific provision",
      "rightView": "How the right views this specific provision",
      "coreDisagreement": "One sentence capturing the fundamental disagreement"
    }
  ],
  "beforeYouVote": [
    {"question": "What does this bill actually do?", "answer": "Plain English answer"},
    {"question": "Who benefits most?", "answer": "Plain English answer"},
    {"question": "What does it cost?", "answer": "Plain English answer"},
    {"question": "What are the main trade-offs?", "answer": "Plain English answer"},
    {"question": "Who opposes it and why?", "answer": "Plain English answer"}
  ]
}

Important guidelines:
- supportLevel must be exactly one of: "strong support", "lean support", "mixed", "lean oppose", "strong oppose"
- impact must be exactly one of: "high", "medium", "low"
- lean must be exactly one of: "left", "center", "right"
- Be accurate about which side supports/opposes based on the actual bill
- Represent each perspective fairly and accurately based on real published positions
`;

export async function analyzeBill(
  billTitle: string,
  billText: string
): Promise<BillAnalysis> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: ANALYSIS_PROMPT(billTitle, billText),
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const jsonText = content.text.trim();
  const analysis: BillAnalysis = JSON.parse(jsonText);
  return analysis;
}
