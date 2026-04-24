import { getBillById } from "@/data/bills";
import { BillAnalysisClient } from "./BillAnalysisClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BillPage({ params }: Props) {
  const { id } = await params;
  const bill = getBillById(id);

  if (!bill) {
    notFound();
  }

  return <BillAnalysisClient bill={bill} />;
}
