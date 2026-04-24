const BASE = "https://api.congress.gov/v3";

function key() {
  return process.env.CONGRESS_API_KEY ?? "";
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
  id: string; // "cgov_119_hr_1"
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

export async function searchBills(query: string): Promise<BillSearchResult[]> {
  const url = `${BASE}/bill?query=${encodeURIComponent(query)}&format=json&limit=10&api_key=${key()}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
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
  const url = `${BASE}/bill/${congress}/${type.toLowerCase()}/${number}?format=json&api_key=${key()}`;
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
  const url = `${BASE}/bill/${congress}/${type.toLowerCase()}/${number}/summaries?format=json&api_key=${key()}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return "";
  const data = await res.json();
  const summaries: { text: string; updateDate: string }[] = data.summaries ?? [];
  if (!summaries.length) return "";
  // use the most recent summary
  summaries.sort((a, b) => b.updateDate.localeCompare(a.updateDate));
  // strip HTML tags
  return summaries[0].text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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
  // "cgov_119_hr_1" -> { congress: 119, type: "hr", number: "1" }
  const parts = id.replace("cgov_", "").split("_");
  return {
    congress: parseInt(parts[0]),
    type: parts[1],
    number: parts.slice(2).join("_"),
  };
}
