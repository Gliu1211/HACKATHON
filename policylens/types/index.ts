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
  officialTextUrl?: string;
  credibleSources?: CredibleSource[];
  tags: string[];
}

export interface BillAnalysis {
  sourceAudit: SourceAudit;
  citations: Citation[];
  tldr: CitedClaim[];
  whatItDoes: CitedClaim[];
  whoItAffects: CitedClaim[];
  whatChanges: CitedClaim[];
  keyProvisions: KeyProvision[];
  perspectives: PerspectiveSet;
  controversialSections: ControversialSection[];
  beforeYouVote: BeforeYouVoteItem[];
}

export interface KeyProvision {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  citations: string[];
}

export interface PerspectiveSet {
  left: PerspectiveView;
  center: PerspectiveView;
  right: PerspectiveView;
}

export interface PerspectiveView {
  framing: CitedClaim;
  keyArguments: CitedClaim[];
  concerns: CitedClaim[];
  supportLevel: "strong support" | "lean support" | "mixed" | "lean oppose" | "strong oppose";
  sources: SourceRef[];
}

export interface ControversialSection {
  provision: string;
  billSection: string;
  whyControversial: CitedClaim;
  leftView: CitedClaim;
  rightView: CitedClaim;
  coreDisagreement: CitedClaim;
  citations: string[];
}

export interface BeforeYouVoteItem {
  question: string;
  answer: CitedClaim;
}

export interface SourceRef {
  name: string;
  lean: "left" | "center" | "right";
  url?: string;
}

export interface CitedClaim {
  text: string;
  citations: string[];
}

export interface Citation {
  id: string;
  sourceType: "official_bill_text" | "credible_source" | "provided_bill_text";
  title: string;
  snippet: string;
  url?: string;
  section?: string;
}

export interface SourceAudit {
  billTextSource: "official_bill_text" | "provided_bill_text";
  billTextUrl?: string;
  credibleSourcesProvided: number;
  groundingRules: string[];
  limitations: string[];
}

export interface CredibleSource {
  id: string;
  name: string;
  lean: "left" | "center" | "right";
  title: string;
  url: string;
  snippet: string;
}
