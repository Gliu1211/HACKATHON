import { NextRequest, NextResponse } from "next/server";
import { getBillById as getLocalBill } from "@/data/bills";
import { analyzeBill } from "@/lib/analyze";
import {
  fetchOfficialBillText,
  fetchOfficialBillTextByParams,
  getBillById as getCgovBill,
  getBillSummary,
  parseCgovId,
} from "@/lib/congress";
import { Bill, CredibleSource } from "@/types";

export const maxDuration = 120;

async function getGroundedBillText(bill: Bill, customText?: string) {
  if (customText) {
    return {
      text: customText,
      sourceType: "provided_bill_text" as const,
      url: undefined,
    };
  }

  const officialText = await fetchOfficialBillText(bill).catch((error) => {
    console.warn("Could not fetch official Congress.gov text:", error);
    return null;
  });

  if (officialText) {
    return {
      text: officialText.text,
      sourceType: "official_bill_text" as const,
      url: officialText.url,
    };
  }

  if (!bill.fullText) return null;

  return {
    text: bill.fullText,
    sourceType: "provided_bill_text" as const,
    url: bill.officialTextUrl,
  };
}

async function getGroundedCgovText(congress: number, type: string, number: string) {
  const [bill, summary, officialText] = await Promise.all([
    getCgovBill(congress, type, number),
    getBillSummary(congress, type, number),
    fetchOfficialBillTextByParams(congress, type, number).catch((error) => {
      console.warn("Could not fetch official Congress.gov text:", error);
      return null;
    }),
  ]);

  if (!bill) return null;

  if (officialText) {
    return {
      billTitle: bill.title,
      billText: {
        text: officialText.text,
        sourceType: "official_bill_text" as const,
        url: officialText.url,
      },
    };
  }

  const fallbackText = [
    `Bill: ${bill.billNumber} - ${bill.title}`,
    `Sponsor: ${bill.sponsor} (${bill.sponsorParty}-${bill.sponsorState})`,
    `Latest Action: ${bill.latestAction}`,
    "",
    "Congress.gov Official Summary:",
    summary,
  ]
    .filter(Boolean)
    .join("\n");

  if (!fallbackText.trim()) return null;

  return {
    billTitle: bill.title,
    billText: {
      text: fallbackText,
      sourceType: "provided_bill_text" as const,
      url: undefined,
    },
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let billTitle: string;
  let billText: Awaited<ReturnType<typeof getGroundedBillText>>;
  let credibleSources: CredibleSource[] | undefined;

  if (id.startsWith("cgov_")) {
    const { congress, type, number } = parseCgovId(id);
    const grounded = await getGroundedCgovText(congress, type, number);
    if (!grounded) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    billTitle = grounded.billTitle;
    billText = grounded.billText;
  } else {
    const bill = getLocalBill(id);
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    billTitle = bill.title;
    billText = await getGroundedBillText(bill);
    credibleSources = bill.credibleSources;
  }

  if (!billText) {
    return NextResponse.json({ error: "No bill text available" }, { status: 400 });
  }

  try {
    const analysis = await analyzeBill({ billTitle, billText, credibleSources });
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Failed to analyze bill" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const customText: string | undefined = body.text;

  if (id === "custom" && customText) {
    const billTitle = body.title || "Custom Bill";
    const billText = await getGroundedBillText(
      {
        id: "custom",
        title: billTitle,
        shortTitle: billTitle,
        congress: 0,
        billNumber: "Custom",
        sponsor: "Unknown",
        sponsorParty: "I",
        sponsorState: "NA",
        introducedDate: new Date().toISOString(),
        status: "Provided text",
        summary: "",
        tags: [],
      },
      customText
    );

    if (!billText) {
      return NextResponse.json({ error: "No bill text available" }, { status: 400 });
    }

    try {
      const analysis = await analyzeBill({ billTitle, billText });
      return NextResponse.json(analysis);
    } catch (err) {
      console.error("Analysis error:", err);
      return NextResponse.json({ error: "Failed to analyze bill" }, { status: 500 });
    }
  }

  return GET(req, { params: Promise.resolve({ id }) });
}
