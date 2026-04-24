import { Bill } from "@/types";

interface CongressTextFormat {
  type?: string;
  url?: string;
}

interface CongressTextVersion {
  date?: string;
  type?: string;
  formats?: CongressTextFormat[] | { item?: CongressTextFormat[] };
}

interface CongressTextResponse {
  textVersions?: CongressTextVersion[] | { item?: CongressTextVersion[] };
}

export interface OfficialBillTextResult {
  text: string;
  url: string;
  version?: string;
}

function parseBillNumber(billNumber: string) {
  const match = billNumber.match(/^(H\.R\.|S\.|H\.J\.RES\.|S\.J\.RES\.|H\.CON\.RES\.|S\.CON\.RES\.|H\.RES\.|S\.RES\.)\s*(\d+)$/i);
  if (!match) return null;

  const typeMap: Record<string, string> = {
    "H.R.": "hr",
    "S.": "s",
    "H.J.RES.": "hjres",
    "S.J.RES.": "sjres",
    "H.CON.RES.": "hconres",
    "S.CON.RES.": "sconres",
    "H.RES.": "hres",
    "S.RES.": "sres",
  };

  return {
    type: typeMap[match[1].toUpperCase()],
    number: match[2],
  };
}

function asArray<T>(value?: T[] | { item?: T[] }) {
  if (!value) return [];
  return Array.isArray(value) ? value : value.item ?? [];
}

function stripMarkup(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchOfficialBillText(bill: Bill): Promise<OfficialBillTextResult | null> {
  const apiKey = process.env.CONGRESS_API_KEY;
  const billParts = parseBillNumber(bill.billNumber);

  if (!apiKey || !billParts) {
    return null;
  }

  const textEndpoint = new URL(
    `https://api.congress.gov/v3/bill/${bill.congress}/${billParts.type}/${billParts.number}/text`
  );
  textEndpoint.searchParams.set("format", "json");
  textEndpoint.searchParams.set("api_key", apiKey);

  const response = await fetch(textEndpoint, { next: { revalidate: 60 * 60 * 24 } });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as CongressTextResponse;
  const versions = asArray(data.textVersions);
  const latest = versions[0];
  const formats = asArray(latest?.formats);
  const format =
    formats.find((item) => item.type === "Formatted Text") ??
    formats.find((item) => item.type === "Formatted XML") ??
    formats.find((item) => item.url);

  if (!format?.url) {
    return null;
  }

  const textResponse = await fetch(format.url, { next: { revalidate: 60 * 60 * 24 } });
  if (!textResponse.ok) {
    return null;
  }

  const rawText = await textResponse.text();
  const text = stripMarkup(rawText);

  if (!text) {
    return null;
  }

  return {
    text,
    url: format.url,
    version: latest?.type,
  };
}
