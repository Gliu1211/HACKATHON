import { getBillById as getLocalBill } from "@/data/bills";
import { parseCgovId, getBillById as getCgovBill } from "@/lib/congress";
import { BillAnalysisClient } from "./BillAnalysisClient";
import { Bill } from "@/types";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BillPage({ params }: Props) {
  const { id } = await params;

  let bill: Bill | undefined;

  if (id.startsWith("cgov_")) {
    const { congress, type, number } = parseCgovId(id);
    const cgov = await getCgovBill(congress, type, number);
    if (!cgov) notFound();
    bill = {
      id,
      title: cgov.title,
      shortTitle: cgov.title.length > 60 ? cgov.title.slice(0, 57) + "…" : cgov.title,
      congress: cgov.congress,
      billNumber: cgov.billNumber,
      sponsor: cgov.sponsor,
      sponsorParty: (cgov.sponsorParty as "D" | "R" | "I") || "I",
      sponsorState: cgov.sponsorState,
      introducedDate: cgov.introducedDate,
      status: cgov.latestAction || "In Progress",
      summary: cgov.latestAction || "",
      tags: cgov.policyArea ? [cgov.policyArea] : [],
    };
  } else {
    bill = getLocalBill(id);
    if (!bill) notFound();
  }

  return <BillAnalysisClient bill={bill} />;
}
