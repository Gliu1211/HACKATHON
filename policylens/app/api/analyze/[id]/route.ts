import { NextRequest, NextResponse } from "next/server";
import { getBillById } from "@/data/bills";
import { analyzeBill } from "@/lib/analyze";
import { fetchOfficialBillText } from "@/lib/congress";
import { Bill, CredibleSource } from "@/types";

async function getGroundedBillText(
  bill: Bill,
  customText?: string
) {
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

  if (!bill.fullText) {
    return null;
  }

  return {
    text: bill.fullText,
    sourceType: "provided_bill_text" as const,
    url: bill.officialTextUrl,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bill = getBillById(id);

  if (!bill) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  const billText = await getGroundedBillText(bill);

  if (!billText) {
    return NextResponse.json(
      { error: "No bill text available" },
      { status: 400 }
    );
  }

  try {
    const analysis = await analyzeBill({
      billTitle: bill.title,
      billText,
      credibleSources: bill.credibleSources,
    });
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Failed to analyze bill" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const customText: string | undefined = body.text;

  let billTitle: string;
  let billText: Awaited<ReturnType<typeof getGroundedBillText>>;
  let credibleSources: CredibleSource[] | undefined;

  if (id === "custom" && customText) {
    billTitle = body.title || "Custom Bill";
    billText = await getGroundedBillText(
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
  } else {
    const bill = getBillById(id);
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }
    billTitle = bill.title;
    billText = await getGroundedBillText(bill);
    credibleSources = bill.credibleSources;
  }

  if (!billText) {
    return NextResponse.json(
      { error: "No bill text available" },
      { status: 400 }
    );
  }

  try {
    const analysis = await analyzeBill({ billTitle, billText, credibleSources });
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Failed to analyze bill" },
      { status: 500 }
    );
  }
}
