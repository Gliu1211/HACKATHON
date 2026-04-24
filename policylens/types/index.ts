export interface Bill {
  id: string;
  title: string;
  shortTitle: string;
  congress: number;
  billNumber: string;
  sponsor: string;
  sponsorParty: "D" | "R" | "I";
  sponsorState: string;
  introducedDate: string;
  status: string;
  summary: string;
  fullText?: string;
  tags: string[];
}

export interface BillAnalysis {
  tldr: string;
  whatItDoes: string[];
  whoItAffects: string[];
  whatChanges: string[];
  keyProvisions: KeyProvision[];
  perspectives: PerspectiveSet;
  controversialSections: ControversialSection[];
  beforeYouVote: BeforeYouVoteItem[];
}

export interface KeyProvision {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export interface PerspectiveSet {
  left: PerspectiveView;
  center: PerspectiveView;
  right: PerspectiveView;
}

export interface PerspectiveView {
  framing: string;
  keyArguments: string[];
  concerns: string[];
  supportLevel: "strong support" | "lean support" | "mixed" | "lean oppose" | "strong oppose";
  sources: SourceRef[];
}

export interface ControversialSection {
  provision: string;
  leftView: string;
  rightView: string;
  coreDisagreement: string;
}

export interface BeforeYouVoteItem {
  question: string;
  answer: string;
}

export interface SourceRef {
  name: string;
  lean: "left" | "center" | "right";
  url?: string;
}
