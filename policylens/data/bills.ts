import { Bill } from "@/types";

export const FEATURED_BILLS: Bill[] = [
  {
    id: "hr1-119",
    title: "One Big Beautiful Bill Act",
    shortTitle: "One Big Beautiful Bill",
    congress: 119,
    billNumber: "H.R. 1",
    sponsor: "Mike Johnson",
    sponsorParty: "R",
    sponsorState: "LA",
    introducedDate: "2025-01-03",
    status: "Passed House",
    summary:
      "A sweeping reconciliation bill extending and expanding 2017 tax cuts, increasing border security funding, rolling back clean energy incentives, and restructuring federal spending including Medicaid and SNAP reforms.",
    tags: ["Taxes", "Border", "Healthcare", "Energy", "Budget"],
    fullText: `The One Big Beautiful Bill Act (H.R. 1, 119th Congress) is a comprehensive budget reconciliation bill passed by the House of Representatives in 2025. It is the primary legislative vehicle for implementing President Trump's second-term domestic agenda.

KEY PROVISIONS:

TAX PROVISIONS:
- Makes permanent the individual income tax cuts from the 2017 Tax Cuts and Jobs Act, which were set to expire after 2025
- Eliminates taxes on tips for service workers (up to $25,000/year)
- Eliminates taxes on overtime pay
- Creates a new $5,000 "senior bonus" deduction for Americans over 65
- Increases the SALT (State and Local Tax) deduction cap from $10,000 to $40,000 for households earning under $500,000
- Reduces the corporate tax rate from 21% to 20% for domestic manufacturers
- Expands the Child Tax Credit from $2,000 to $2,500 per child
- Creates new savings accounts for children (Trump Accounts) with $1,000 government seed money

BORDER AND IMMIGRATION:
- Provides $46 billion for border wall construction and completion
- Funds hiring of 10,000 additional Border Patrol agents
- Funds detention capacity for up to 100,000 migrants
- Ends the diversity visa lottery program
- Restricts remittance wire transfers with a 3.5% excise tax
- Imposes fees on asylum applications

MEDICAID AND SNAP:
- Implements work requirements for Medicaid recipients aged 19-64 (exceptions for disabilities, pregnancy, caregiving)
- Requires states to conduct eligibility verification every 6 months instead of annually
- Caps federal Medicaid matching funds (per capita caps for certain enrollees)
- Reduces SNAP benefits by requiring states to cover 25% of benefit costs (currently 100% federal)
- Tightens SNAP eligibility requirements

ENERGY AND ENVIRONMENT:
- Phases out the $7,500 electric vehicle tax credit by 2026
- Repeals clean electricity tax credits from the Inflation Reduction Act
- Repeals wind and solar energy production tax credits
- Opens additional federal lands to oil and gas drilling
- Streamlines permitting for fossil fuel projects

STUDENT LOANS:
- Consolidates income-driven repayment plans into two options
- Caps graduate student loan borrowing
- Eliminates Public Service Loan Forgiveness for new borrowers

DEFENSE:
- Increases defense spending by $150 billion
- Funds development of a missile defense shield ("Iron Dome for America")

DEBT CEILING:
- Raises the federal debt ceiling by $4 trillion`,
  },
  {
    id: "ira-117",
    title: "Inflation Reduction Act of 2022",
    shortTitle: "Inflation Reduction Act",
    congress: 117,
    billNumber: "H.R. 5376",
    sponsor: "John Yarmuth",
    sponsorParty: "D",
    sponsorState: "KY",
    introducedDate: "2021-09-27",
    status: "Signed into Law",
    summary:
      "The largest climate investment in U.S. history, plus Medicare drug price negotiation, extended ACA subsidies, and deficit reduction through a 15% corporate minimum tax and enhanced IRS enforcement.",
    tags: ["Climate", "Healthcare", "Taxes", "Energy", "Deficit"],
    fullText: `The Inflation Reduction Act of 2022 (IRA) was signed into law on August 16, 2022. It is a landmark piece of legislation representing the largest climate investment in American history, along with significant healthcare and tax provisions.

KEY PROVISIONS:

CLIMATE AND ENERGY ($369 billion):
- $7,500 tax credit for new electric vehicles (income limits: $150k single, $300k joint)
- $4,000 tax credit for used electric vehicles
- Tax credits for home energy efficiency improvements (heat pumps, solar panels, insulation)
- Production tax credits for clean electricity generation (wind, solar, nuclear)
- Investment tax credits for clean energy manufacturing
- Methane emissions reduction program
- Environmental justice grants for disadvantaged communities
- Funding for domestic clean energy manufacturing and supply chains

HEALTHCARE:
- Authorizes Medicare to negotiate prescription drug prices for the first time
- First negotiations target 10 high-cost drugs (including insulin, blood thinners, diabetes medications)
- Caps Medicare out-of-pocket drug costs at $2,000/year starting 2025
- Caps insulin costs at $35/month for Medicare beneficiaries
- Extends Affordable Care Act enhanced subsidies through 2025
- Requires drug companies to pay rebates if prices rise faster than inflation

TAX PROVISIONS:
- 15% corporate alternative minimum tax on companies with over $1 billion in profits
- 1% excise tax on corporate stock buybacks
- Enhanced IRS funding ($80 billion over 10 years) to improve tax enforcement
- Clean energy production credits and investment credits

DEFICIT REDUCTION:
- Congressional Budget Office estimated $300 billion in deficit reduction over 10 years
- Revenue from new taxes and drug savings exceeds new spending`,
  },
  {
    id: "chips-117",
    title: "CHIPS and Science Act of 2022",
    shortTitle: "CHIPS Act",
    congress: 117,
    billNumber: "H.R. 4346",
    sponsor: "Frank Pallone",
    sponsorParty: "D",
    sponsorState: "NJ",
    introducedDate: "2022-07-19",
    status: "Signed into Law",
    summary:
      "Invests $280 billion to boost domestic semiconductor manufacturing, fund scientific research, and reduce U.S. dependence on foreign chip supply chains — particularly from China and Taiwan.",
    tags: ["Technology", "Manufacturing", "National Security", "Science", "China"],
    fullText: `The CHIPS and Science Act was signed into law on August 9, 2022. It represents a major bipartisan investment in American semiconductor manufacturing and scientific research.

KEY PROVISIONS:

SEMICONDUCTOR MANUFACTURING ($52 billion):
- $39 billion in direct subsidies for building semiconductor fabrication facilities (fabs) in the United States
- $13.2 billion for semiconductor research and development
- 25% investment tax credit for semiconductor manufacturing equipment and facilities
- Incentives designed to attract companies like TSMC, Samsung, and Intel to build U.S. fabs
- Guardrails: recipients cannot expand advanced chip manufacturing in China for 10 years

SCIENCE AND RESEARCH ($200 billion over 10 years):
- Doubles National Science Foundation funding
- Creates new NSF technology directorate focused on AI, quantum computing, and advanced manufacturing
- Increases Department of Energy Office of Science funding
- Expands STEM education programs
- Regional Technology and Innovation Hubs to spread research beyond coastal cities

NATIONAL SECURITY RATIONALE:
- U.S. semiconductor market share fell from 37% in 1990 to 12% today
- Taiwan produces ~92% of the world's most advanced chips
- China has invested $150+ billion in domestic chip production
- COVID pandemic revealed supply chain vulnerabilities

TRADE RESTRICTIONS:
- Bans companies receiving federal funds from expanding advanced chip production in China
- Restricts technology transfer to adversarial nations`,
  },
];

export function getBillById(id: string): Bill | undefined {
  return FEATURED_BILLS.find((b) => b.id === id);
}
