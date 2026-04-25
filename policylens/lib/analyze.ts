import { BillAnalysis, Citation, CredibleSource } from "@/types";

export interface BillTextSource {
  text: string;
  sourceType: "official_bill_text" | "provided_bill_text";
  url?: string;
}

interface AnalysisInput {
  billTitle: string;
  billText: BillTextSource;
  credibleSources?: CredibleSource[];
}

const MAX_BILL_CHUNKS = 18;
const BILL_CHUNK_SIZE = 1800;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function chunkBillText(text: string): Citation[] {
  const clean = normalizeWhitespace(text);
  const chunks: Citation[] = [];

  for (let start = 0; start < clean.length && chunks.length < MAX_BILL_CHUNKS; start += BILL_CHUNK_SIZE) {
    const snippet = clean.slice(start, start + BILL_CHUNK_SIZE);
    chunks.push({
      id: `B${chunks.length + 1}`,
      sourceType: "official_bill_text",
      title: "Official bill text",
      section: `Bill text excerpt ${chunks.length + 1}`,
      snippet,
    });
  }

  return chunks;
}

function buildCitations(input: AnalysisInput): Citation[] {
  const billCitations = chunkBillText(input.billText.text).map((citation) => ({
    ...citation,
    sourceType: input.billText.sourceType,
    url: input.billText.url,
    title:
      input.billText.sourceType === "official_bill_text"
        ? "Official bill text"
        : "Provided bill text",
  }));

  const sourceCitations: Citation[] = (input.credibleSources ?? []).map((source) => ({
    id: source.id,
    sourceType: "credible_source",
    title: `${source.name}: ${source.title}`,
    url: source.url,
    snippet: normalizeWhitespace(source.snippet),
  }));

  return [...billCitations, ...sourceCitations];
}

function sourcePacket(citations: Citation[]) {
  return citations
    .map((source) =>
      [
        `[${source.id}] ${source.title}`,
        `type: ${source.sourceType}`,
        source.url ? `url: ${source.url}` : undefined,
        source.section ? `section: ${source.section}` : undefined,
        `snippet: ${source.snippet}`,
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n\n");
}

const ANALYSIS_PROMPT = (input: AnalysisInput, citations: Citation[]) => `
You are PolicyLens, a nonpartisan legislative analysis engine.

CRITICAL GROUNDING RULES:
- Use ONLY the source excerpts below. Do not use outside knowledge.
- Every factual claim must include at least one citation id from the provided sources.
- If a claim cannot be supported by the provided bill text or provided credible-source snippets, omit it or say the provided sources do not establish it.
- Do not invent sources, URLs, organizations, public reactions, legal effects, costs, dates, or current-law baselines.
- "Controversial sections" must identify specific bill sections/provisions and explain why they are likely disputed. Do not give only broad overall opinions.
- For left/right/center perspectives, only describe a side's view when a credible-source snippet supports it. If no credible-source snippet supports a view, write that the provided sources do not establish that perspective and cite the relevant bill section instead.
- Source snippets should be short direct excerpts from the source packet, not paraphrased citations.

Bill: ${input.billTitle}

SOURCES:
${sourcePacket(citations)}

Return ONLY valid JSON with this exact structure:
{
  "sourceAudit": {
    "billTextSource": "${input.billText.sourceType}",
    "billTextUrl": ${input.billText.url ? JSON.stringify(input.billText.url) : "null"},
    "credibleSourcesProvided": ${input.credibleSources?.length ?? 0},
    "groundingRules": [
      "Only source excerpts supplied to the model may be used",
      "Every claim must carry citation ids",
      "Unsupported claims must be omitted or labeled as not established by provided sources"
    ],
    "limitations": ["Brief note on missing official text, missing credible sources, or incomplete excerpts if relevant"]
  },
  "citations": [
    {"id": "B1", "sourceType": "official_bill_text", "title": "Official bill text", "section": "Bill text excerpt 1", "snippet": "short exact source snippet", "url": "optional source url"}
  ],
  "tldr": [
    {"text": "Plain English claim 1", "citations": ["B1"]},
    {"text": "Plain English claim 2", "citations": ["B2"]}
  ],
  "whatItDoes": [
    {"text": "Action the bill takes", "citations": ["B1"]}
  ],
  "whoItAffects": [
    {"text": "Group affected: how the supplied text supports that effect", "citations": ["B1"]}
  ],
  "whatChanges": [
    {"text": "What changes relative to what the supplied bill text explicitly says", "citations": ["B1"]}
  ],
  "keyProvisions": [
    {"title": "Provision name", "description": "What this provision does in plain English", "impact": "high", "citations": ["B1"]}
  ],
  "perspectives": {
    "left": {
      "framing": {"text": "Supported left-leaning framing or 'not established by provided sources'", "citations": ["B1"]},
      "keyArguments": [{"text": "Supported argument", "citations": ["S1"]}],
      "concerns": [{"text": "Supported concern", "citations": ["S1"]}],
      "supportLevel": "mixed",
      "sources": [{"name": "Source name or Provided sources insufficient", "lean": "left", "url": "optional url"}]
    },
    "center": {
      "framing": {"text": "Supported centrist/nonpartisan framing or 'not established by provided sources'", "citations": ["B1"]},
      "keyArguments": [{"text": "Supported argument", "citations": ["S2"]}],
      "concerns": [{"text": "Supported concern", "citations": ["S2"]}],
      "supportLevel": "mixed",
      "sources": [{"name": "Source name or Provided sources insufficient", "lean": "center", "url": "optional url"}]
    },
    "right": {
      "framing": {"text": "Supported conservative framing or 'not established by provided sources'", "citations": ["B1"]},
      "keyArguments": [{"text": "Supported argument", "citations": ["S3"]}],
      "concerns": [{"text": "Supported concern", "citations": ["S3"]}],
      "supportLevel": "mixed",
      "sources": [{"name": "Source name or Provided sources insufficient", "lean": "right", "url": "optional url"}]
    }
  },
  "controversialSections": [
    {
      "provision": "Specific controversial provision",
      "billSection": "Section or excerpt id",
      "whyControversial": {"text": "Why this provision is likely disputed using only supplied sources", "citations": ["B1"]},
      "leftView": {"text": "Specific supported left view or not established", "citations": ["S1"]},
      "rightView": {"text": "Specific supported right view or not established", "citations": ["S3"]},
      "coreDisagreement": {"text": "The concrete disagreement about this section", "citations": ["B1", "S1", "S3"]},
      "citations": ["B1", "S1", "S3"]
    }
  ],
  "beforeYouVote": [
    {"question": "What does this bill actually do?", "answer": {"text": "Supported answer", "citations": ["B1"]}}
  ]
}

Requirements:
- Include 2-3 TL;DR claims.
- Include 4-6 items each for whatItDoes, whoItAffects, whatChanges, keyProvisions, and beforeYouVote when sources support them.
- Include 2-4 controversialSections, each tied to a specific bill provision.
- supportLevel must be exactly one of: "strong support", "lean support", "mixed", "lean oppose", "strong oppose".
- impact must be exactly one of: "high", "medium", "low".
- lean must be exactly one of: "left", "center", "right".
- The citations array in the output must include only source ids used by claims.
`;

function extractJson(text: string) {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("The LLM did not return a JSON object");
  }

  return trimmed.slice(start, end + 1);
}

async function callMistral(prompt: string) {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.MISTRAL_MODEL || "mistral-large-latest",
      temperature: 0,
      max_tokens: 7000,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Mistral analysis failed: ${response.status} ${details}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Mistral returned an empty response");
  }

  return content;
}

async function callAnthropic(prompt: string) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
    max_tokens: 7000,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Anthropic returned an unexpected response type");
  }

  return content.text;
}

function validateCitationIds(analysis: BillAnalysis, allowedIds: Set<string>) {
  const used = new Set<string>();

  const collect = (ids?: string[]) => {
    for (const id of ids ?? []) {
      if (!allowedIds.has(id)) {
        throw new Error(`Analysis referenced an unknown citation id: ${id}`);
      }
      used.add(id);
    }
  };

  const collectClaim = (claim?: { citations?: string[] }) => collect(claim?.citations);

  analysis.tldr.forEach(collectClaim);
  analysis.whatItDoes.forEach(collectClaim);
  analysis.whoItAffects.forEach(collectClaim);
  analysis.whatChanges.forEach(collectClaim);
  analysis.keyProvisions.forEach((item) => collect(item.citations));
  Object.values(analysis.perspectives).forEach((perspective) => {
    collectClaim(perspective.framing);
    perspective.keyArguments.forEach(collectClaim);
    perspective.concerns.forEach(collectClaim);
  });
  analysis.controversialSections.forEach((section) => {
    collect(section.citations);
    collectClaim(section.whyControversial);
    collectClaim(section.leftView);
    collectClaim(section.rightView);
    collectClaim(section.coreDisagreement);
  });
  analysis.beforeYouVote.forEach((item) => collectClaim(item.answer));

  const citationById = new Map(analysis.citations.map((citation) => [citation.id, citation]));
  analysis.citations = [...used]
    .map((id) => citationById.get(id))
    .filter((citation): citation is Citation => Boolean(citation));
}

export async function analyzeBill(input: AnalysisInput): Promise<BillAnalysis>;
export async function analyzeBill(billTitle: string, billText: string): Promise<BillAnalysis>;
export async function analyzeBill(
  inputOrTitle: AnalysisInput | string,
  maybeBillText?: string
): Promise<BillAnalysis> {
  const input: AnalysisInput =
    typeof inputOrTitle === "string"
      ? {
          billTitle: inputOrTitle,
          billText: {
            text: maybeBillText ?? "",
            sourceType: "provided_bill_text",
          },
        }
      : inputOrTitle;

  if (!process.env.MISTRAL_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    throw new Error("MISTRAL_API_KEY or ANTHROPIC_API_KEY is required for bill analysis");
  }

  const citations = buildCitations(input);
  const allowedIds = new Set(citations.map((citation) => citation.id));
  const prompt = ANALYSIS_PROMPT(input, citations);
  const responseText = process.env.MISTRAL_API_KEY
    ? await callMistral(prompt)
    : await callAnthropic(prompt);

  const analysis = JSON.parse(extractJson(responseText)) as BillAnalysis;
  analysis.citations = citations;
  validateCitationIds(analysis, allowedIds);
  return analysis;
}
