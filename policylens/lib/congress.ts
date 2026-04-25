import { Bill } from "@/types";

const BASE = "https://api.congress.gov/v3";

function key() {
  return process.env.CONGRESS_API_KEY ?? "";
}

function withApiKey(url: URL) {
  url.searchParams.set("format", "json");
  url.searchParams.set("api_key", key());
  return url;
}

export interface CongressBill {
  congress: number;
  type: string;
  number: string;
  title: string;
  introducedDate: string;
  latestAction?: { text: string; actionDate: string };
  sponsors?: { fullName: string; party: string; state: string }[];
  policyArea?: { name: string };
}

export interface BillSearchResult {
  id: string;
  billNumber: string;
  title: string;
  congress: number;
  type: string;
  number: string;
  introducedDate: string;
  latestAction: string;
  sponsor: string;
  sponsorParty: string;
  sponsorState: string;
  policyArea: string;
}

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

export async function searchBills(query: string): Promise<BillSearchResult[]> {
  const url = withApiKey(new URL(`${BASE}/bill`));
  url.searchParams.set("query", query);
  url.searchParams.set("limit", "10");
  url.searchParams.set("sort", "updateDate+desc");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Congress API error: ${res.status}`);

  const data = await res.json();
  const bills: CongressBill[] = data.bills ?? [];
  return bills.map(normalizeBill);
}

export async function getBillById(
  congress: number,
  type: string,
  number: string
): Promise<BillSearchResult | null> {
  const url = withApiKey(new URL(`${BASE}/bill/${congress}/${type.toLowerCase()}/${number}`));
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.bill) return null;
  return normalizeBill(data.bill);
}

export async function getBillSummary(
  congress: number,
  type: string,
  number: string
): Promise<string> {
  const url = withApiKey(new URL(`${BASE}/bill/${congress}/${type.toLowerCase()}/${number}/summaries`));
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return "";

  const data = await res.json();
  const summaries: { text: string; updateDate: string }[] = data.summaries ?? [];
  if (!summaries.length) return "";

  summaries.sort((a, b) => b.updateDate.localeCompare(a.updateDate));
  return stripMarkup(summaries[0].text);
}

export async function fetchOfficialBillTextByParams(
  congress: number,
  type: string,
  number: string
): Promise<OfficialBillTextResult | null> {
  if (!key()) return null;

  const textEndpoint = withApiKey(new URL(`${BASE}/bill/${congress}/${type.toLowerCase()}/${number}/text`));
  const response = await fetch(textEndpoint, { next: { revalidate: 60 * 60 * 24 } });
  if (!response.ok) return null;

  const data = (await response.json()) as CongressTextResponse;
  const versions = asArray(data.textVersions);
  const latest = versions[0];
  const formats = asArray(latest?.formats);
  const format =
    formats.find((item) => item.type === "Formatted Text") ??
    formats.find((item) => item.type === "Formatted XML") ??
    formats.find((item) => item.url);

  if (!format?.url) return null;

  const textResponse = await fetch(format.url, { next: { revalidate: 60 * 60 * 24 } });
  if (!textResponse.ok) return null;

  const text = stripMarkup(await textResponse.text());
  if (!text) return null;

  return {
    text,
    url: format.url,
    version: latest?.type,
  };
}

export async function fetchOfficialBillText(bill: Bill): Promise<OfficialBillTextResult | null> {
  const billParts = parseBillNumber(bill.billNumber);
  if (!billParts) return null;

  return fetchOfficialBillTextByParams(bill.congress, billParts.type, billParts.number);
}

function normalizeBill(b: CongressBill): BillSearchResult {
  const sponsor = b.sponsors?.[0];
  return {
    id: `cgov_${b.congress}_${b.type.toLowerCase()}_${b.number}`,
    billNumber: `${b.type.toUpperCase()} ${b.number}`,
    title: b.title ?? "Untitled",
    congress: b.congress,
    type: b.type.toLowerCase(),
    number: b.number,
    introducedDate: b.introducedDate ?? "",
    latestAction: b.latestAction?.text ?? "",
    sponsor: sponsor?.fullName ?? "Unknown",
    sponsorParty: sponsor?.party ?? "?",
    sponsorState: sponsor?.state ?? "?",
    policyArea: b.policyArea?.name ?? "",
  };
}

export function parseCgovId(id: string) {
  const parts = id.replace("cgov_", "").split("_");
  return {
    congress: parseInt(parts[0], 10),
    type: parts[1],
    number: parts.slice(2).join("_"),
  };
}
