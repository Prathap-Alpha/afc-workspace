export type Business = "afc" | "asset";
export type Scope = Business | "group";

export type Bdo = {
  name: string;
  spec: string;
  color: string;
  biz?: Business;
};

export const BDOS: Record<string, Bdo> = {
  thabo: { name: "Thabo Nkosi", spec: "Turboprops & piston", color: "#2f80ed" },
  lisa: { name: "Lisa van Wyk", spec: "Helicopters", color: "#e2445c" },
  pieter: { name: "Pieter Botha", spec: "Jets & business aviation", color: "#6c5ce7" },
  naledi: { name: "Naledi Dlamini", spec: "Agricultural & special mission", color: "#1f9d6b" },
  zanele: { name: "Zanele Khumalo", spec: "Trucks & commercial vehicles", color: "#d98a04", biz: "asset" },
  ruan: { name: "Ruan Venter", spec: "Construction & yellow plant", color: "#8e5a2b", biz: "asset" },
  fatima: { name: "Fatima Patel", spec: "Agri machinery & material handling", color: "#0f9d9a", biz: "asset" },
};

export type BusinessSummary = {
  name: string;
  short: string;
  book: number;
  facilities: number;
  disbQ: number;
  approval: number;
  tat: number;
  arrears: number;
  mix: Record<string, number>;
};

export const BIZ: Record<Business, BusinessSummary> = {
  afc: {
    name: "Aircraft Finance Corporation",
    short: "AFC",
    book: 1.84e9,
    facilities: 148,
    disbQ: 212e6,
    approval: 72,
    tat: 6.5,
    arrears: 1.6,
    mix: { "Turboprop & piston": 42, Jets: 31, Helicopters: 17, "Agricultural aircraft": 10 },
  },
  asset: {
    name: "Asset Finance Corporation",
    short: "Asset Finance",
    book: 1.12e9,
    facilities: 612,
    disbQ: 164e6,
    approval: 68,
    tat: 4.2,
    arrears: 2.9,
    mix: { "Commercial vehicles": 46, "Construction & plant": 28, Agricultural: 17, "Material handling": 9 },
  },
};

export type Lead = {
  id: number;
  biz?: Business;
  name: string;
  contact: string;
  src: string;
  bdo: string;
  status: string;
  value: number;
  type: string;
  days: number;
};

export type Application = {
  id: string;
  co: string;
  asset: string;
  amount: number;
  biz?: Business;
  bdo: string;
  received: string;
  docs: Record<string, number>;
  k: {
    dscr: number | null;
    ltv: number | null;
    de: number | null;
    cr: number | null;
    years: number | null;
  };
  risk: number | null;
  summary: string;
  strengths: string[];
  concerns: string[];
  rec: string;
  decision?: string;
  assessed?: boolean;
  isNew?: boolean;
  contact?: string;
  leadId?: number;
};

export const seedLeads: Lead[] = [
  { id: 1041, name: "Karoo Air Charter", contact: "Jaco Steyn", src: "Website", bdo: "thabo", status: "Proposal sent", value: 14500000, type: "Cessna 208B Grand Caravan EX", days: 12 },
  { id: 1042, name: "Lowveld Agri-Spray", contact: "Annelie Kruger", src: "Phone", bdo: "naledi", status: "Application", value: 8200000, type: "Air Tractor AT-502B", days: 3 },
  { id: 1043, name: "Bushveld Heli Services", contact: "Sipho Mthembu", src: "Outlook", bdo: "lisa", status: "Application", value: 6900000, type: "Robinson R66", days: 9 },
  { id: 1044, name: "Cape Coastal Aviation", contact: "Ruan de Klerk", src: "Phone", bdo: "pieter", status: "Qualifying", value: 62000000, type: "Embraer Phenom 300E", days: 2 },
  { id: 1045, name: "Highveld Flight Academy", contact: "Priya Naidoo", src: "Website", bdo: "thabo", status: "Contacted", value: 4800000, type: "Cessna 172S Skyhawk", days: 15 },
  { id: 1046, name: "Zululand Medevac", contact: "Dr. Ayanda Zulu", src: "Outlook", bdo: "lisa", status: "Proposal sent", value: 48000000, type: "Leonardo AW119 Kx", days: 1 },
  { id: 1047, name: "Namaqua Mining Logistics", contact: "Werner Louw", src: "Phone", bdo: "thabo", status: "Qualifying", value: 39000000, type: "Beechcraft King Air 260", days: 8 },
  { id: 1048, name: "Garden Route Air", contact: "Lerato Mokoena", src: "Website", bdo: "pieter", status: "Won", value: 71000000, type: "Cessna Citation CJ4 Gen2", days: 0 },
  { id: 1049, name: "Free State Crop Care", contact: "Johan Pretorius", src: "Phone", bdo: "naledi", status: "Contacted", value: 11400000, type: "Thrush 510G", days: 11 },
  { id: 1050, name: "Kalahari Safari Flights", contact: "Mpho Sebe", src: "Outlook", bdo: "thabo", status: "Won", value: 17800000, type: "Cessna 208B Grand Caravan EX", days: 0 },
  { id: 1051, name: "Limpopo Game Capture", contact: "Hennie Venter", src: "Website", bdo: "lisa", status: "Lost", value: 5600000, type: "Robinson R44 Raven II", days: 0 },
  { id: 1052, name: "Atlantic Executive Jets", contact: "Claire Abrahams", src: "Phone", bdo: "pieter", status: "New", value: 95000000, type: "Pilatus PC-24", days: 1 },
  { id: 2001, biz: "asset", name: "Highveld Haulage", contact: "Thulani Dube", src: "Phone", bdo: "zanele", status: "Proposal sent", value: 7200000, type: "3 × Scania R560 truck-tractors", days: 10 },
  { id: 2002, biz: "asset", name: "Mzansi Civils", contact: "Andile Mahlangu", src: "Website", bdo: "ruan", status: "Qualifying", value: 4900000, type: "Komatsu PC300 excavator", days: 4 },
  { id: 2003, biz: "asset", name: "Swartland Grain Farms", contact: "Gerrit Basson", src: "Outlook", bdo: "fatima", status: "Application", value: 6300000, type: "John Deere S780 combine harvester", days: 2 },
  { id: 2004, biz: "asset", name: "Durban Port Logistics", contact: "Kavitha Reddy", src: "Website", bdo: "fatima", status: "Contacted", value: 2600000, type: "6 × Hyster forklifts", days: 13 },
  { id: 2005, biz: "asset", name: "Bakwena Construction", contact: "Kagiso Molefe", src: "Phone", bdo: "ruan", status: "Proposal sent", value: 11800000, type: "Bell B40E articulated dump trucks ×2", days: 1 },
  { id: 2006, biz: "asset", name: "Eastern Cape Couriers", contact: "Lwazi Ntuli", src: "Outlook", bdo: "zanele", status: "Qualifying", value: 5400000, type: "12 × Toyota Hilux LDV fleet", days: 8 },
  { id: 2007, biz: "asset", name: "Karoo Agri Co-op", contact: "Elsabe Viljoen", src: "Phone", bdo: "fatima", status: "Won", value: 3900000, type: "Case IH Puma 185 tractors ×2", days: 0 },
  { id: 2008, biz: "asset", name: "Gauteng Tippers", contact: "Bongani Sithole", src: "Website", bdo: "zanele", status: "Won", value: 4600000, type: "Volvo FMX 440 tippers ×2", days: 0 },
  { id: 2009, biz: "asset", name: "Limpopo Quarries", contact: "Jabu Maluleke", src: "Phone", bdo: "ruan", status: "New", value: 8700000, type: "CAT 980 wheel loader", days: 1 },
  { id: 2010, biz: "asset", name: "Westbank Freight", contact: "Ilse du Toit", src: "Website", bdo: "zanele", status: "Lost", value: 3100000, type: "Isuzu FVZ 1400 trucks ×2", days: 0 },
];

export const DORMANT = [
  { biz: "asset" as Business, name: "Cape Winelands Estates", note: "Past client (2022 tractor finance) — asked about a bakkie fleet in Apr 2025", types: ["Hilux"], fit: 91, bdo: "fatima" },
  { biz: "asset" as Business, name: "Garden Route Security", note: "Enquired Jun 2025 about response-vehicle fleet", types: ["Hilux"], fit: 83, bdo: "zanele" },
  { biz: "asset" as Business, name: "Mzansi Civils", note: "Quoted new PC300; may take ex-lease unit to save 40%", types: ["Excavator"], fit: 87, bdo: "ruan" },
  { biz: "asset" as Business, name: "Rustenburg Earthworks", note: "Dormant since Feb 2025, wanted second excavator", types: ["Excavator"], fit: 80, bdo: "ruan" },
  { biz: "asset" as Business, name: "Small Town Plant Hire", note: "1 year trading, thin financials", types: ["Excavator", "Hilux"], fit: 44, bdo: "ruan" },
  { name: "Eastern Cape Air Tours", note: "Enquired Mar 2025 about a Caravan; deal paused on deposit size", types: ["Caravan", "Kodiak"], fit: 92, bdo: "thabo" },
  { name: "Mpumalanga Timber Patrol", note: "Asked about turboprop for fire-spotting, Aug 2025", types: ["Caravan", "PC-12", "Kodiak"], fit: 84, bdo: "naledi" },
  { name: "Kalahari Safari Flights", note: "Existing client, financed a Caravan 2024 — fleet expansion signalled", types: ["Caravan", "Kodiak"], fit: 88, bdo: "thabo" },
  { name: "Wild Coast Charters", note: "Enquiry for a PC-12 in 2024, no suitable stock at the time", types: ["PC-12"], fit: 90, bdo: "thabo" },
  { name: "Drakensberg Heli Tours", note: "Dormant since Jan 2025, wanted a second H125", types: ["H125"], fit: 86, bdo: "lisa" },
  { name: "Sun Coast Medevac", note: "Requested info on twin-engine helis, Oct 2025", types: ["H125", "AW119"], fit: 71, bdo: "lisa" },
  { name: "Boland Aero Club", note: "Small club, limited trading history", types: ["Kodiak", "Caravan"], fit: 48, bdo: "thabo" },
];

export const STOCK = [
  { k: "Hilux", biz: "asset" as Business, label: "Repossessed fleet: 10 × 2023 Toyota Hilux — R4.6m" },
  { k: "Excavator", biz: "asset" as Business, label: "Ex-lease 2021 CAT 320 excavator — R2.9m" },
  { k: "Caravan", label: "2019 Cessna Grand Caravan EX — R16.2m" },
  { k: "PC-12", label: "2018 Pilatus PC-12 NGX — R54m" },
  { k: "H125", label: "2020 Airbus H125 — R61m" },
];

export type Enquiry = {
  biz?: Business;
  src: string;
  from: string;
  subj: string;
  body: string;
  ex: {
    company: string;
    contact: string;
    type: string;
    value: number;
    urgency: string;
    fit: number;
    trading: string;
  };
  bdo: string;
};

export const ENQUIRIES: Enquiry[] = [
  {
    biz: "asset",
    src: "Website",
    from: "Sizwe Mthethwa · Lowveld Timber Transport",
    subj: "Website form: Truck finance",
    body: "Good day, we need to finance 4 Mercedes-Benz Actros 2645 truck-tractors with side-tipper trailers for a new timber haulage contract. Approx R14m. We have been operating 9 years.",
    ex: { company: "Lowveld Timber Transport", contact: "Sizwe Mthethwa", type: "4 × Mercedes-Benz Actros 2645 trucks", value: 14000000, urgency: "High — contract starts in 6 weeks", fit: 85, trading: "9 years" },
    bdo: "zanele",
  },
  {
    biz: "asset",
    src: "Outlook",
    from: "plant@northwestbuild.example",
    subj: "Excavator & TLB finance",
    body: "We'd like a quote for financing a Komatsu PC210 excavator and a JCB 3CX TLB, about R5.8m all in. 20% deposit available.",
    ex: { company: "North West Build", contact: "Plant manager", type: "Komatsu PC210 excavator + JCB 3CX", value: 5800000, urgency: "Medium", fit: 78, trading: "Deposit 20%" },
    bdo: "ruan",
  },
  {
    src: "Website",
    from: "Priya Govender · Polokwane Flight School",
    subj: "Website form: Finance for training aircraft",
    body: "Hi, we run a flight school in Polokwane and need to finance two Cessna 172S aircraft for our expanding PPL programme. Budget roughly R9.5 million in total. We've been trading 6 years. Could someone call me this week?",
    ex: { company: "Polokwane Flight School", contact: "Priya Govender", type: "2 × Cessna 172S Skyhawk", value: 9500000, urgency: "High — call requested this week", fit: 81, trading: "6 years" },
    bdo: "thabo",
  },
  {
    src: "Outlook",
    from: "ops@sunbirdems.example",
    subj: "RE: AW119 finance for EMS operations",
    body: "Good afternoon. Sunbird EMS is looking to add a Leonardo AW119 Kx to our air ambulance fleet in KZN. We have a provincial contract running to 2029. Please advise on terms for approx. R50m with a 15% deposit.",
    ex: { company: "Sunbird EMS", contact: "Operations desk", type: "Leonardo AW119 Kx", value: 50000000, urgency: "Medium", fit: 94, trading: "Govt. contract to 2029" },
    bdo: "lisa",
  },
  {
    src: "Outlook",
    from: "m.adams@westerncapeholdings.example",
    subj: "Citation CJ3+ acquisition",
    body: "We are considering acquiring a pre-owned Citation CJ3+ for corporate use, deposit around 20%. Can AFC finance a US-registered aircraft being imported? Value approx R68m.",
    ex: { company: "Western Cape Holdings", contact: "M. Adams", type: "Cessna Citation CJ3+", value: 68000000, urgency: "Medium — import query", fit: 76, trading: "Corporate" },
    bdo: "pieter",
  },
  {
    src: "Website",
    from: "Kobus Smit · Overberg Agri Services",
    subj: "Website form: Crop sprayer finance",
    body: "Looking for finance on an Air Tractor AT-602 ahead of next spraying season. R13m approx. We already have one AT-502 financed elsewhere.",
    ex: { company: "Overberg Agri Services", contact: "Kobus Smit", type: "Air Tractor AT-602", value: 13000000, urgency: "High — seasonal", fit: 79, trading: "Existing operator" },
    bdo: "naledi",
  },
];

export const seedApps: Application[] = [
  {
    id: "APP-2211",
    co: "Karoo Air Charter",
    asset: "Cessna 208B Grand Caravan EX",
    amount: 14500000,
    bdo: "thabo",
    received: "3 Nov 2026",
    docs: { "Application form": 1, "Audited financials (3 yrs)": 1, "Management accounts YTD": 1, "Bank statements (6 months)": 1, "Air Operator Certificate": 1, "Director IDs & KYC": 1, "Independent aircraft valuation": 0, "Fleet utilisation report": 1 },
    k: { dscr: 1.42, ltv: 0.78, de: 1.6, cr: 1.3, years: 9 },
    risk: 34,
    summary: "Established Part 135 charter operator (9 years) with stable tourism and mining-contract revenue. Revenue up 11% year on year; EBITDA margin 24%. Requesting finance for a second Grand Caravan to service a new mining shuttle contract.",
    strengths: ["DSCR of 1.42× comfortably above AFC's 1.25× minimum", "Contracted revenue covers ~60% of projected aircraft hours", "Clean repayment history on existing AFC facility"],
    concerns: ["Independent valuation outstanding — LTV based on dealer quote", "Customer concentration: top client = 38% of revenue"],
    rec: "Proceed to credit committee, subject to independent valuation confirming value ≥ R18.6m.",
  },
  {
    id: "APP-2214",
    co: "Lowveld Agri-Spray",
    asset: "Air Tractor AT-502B",
    amount: 8200000,
    bdo: "naledi",
    received: "7 Nov 2026",
    docs: { "Application form": 1, "Audited financials (3 yrs)": 1, "Management accounts YTD": 1, "Bank statements (6 months)": 1, "Air Operator Certificate": 1, "Director IDs & KYC": 1, "Independent aircraft valuation": 1, "Seasonal contracts / LOIs": 0 },
    k: { dscr: 1.08, ltv: 0.85, de: 2.1, cr: 0.95, years: 5 },
    risk: 68,
    summary: "Agricultural spraying operator with highly seasonal cash flows (70% of revenue Oct–Mar). Drought impact visible in FY2025. Seeks finance for a replacement AT-502B.",
    strengths: ["Experienced owner-pilot, 5 years trading", "Valuation received and in line with request"],
    concerns: ["DSCR 1.08× below 1.25× policy minimum", "LTV 85% exceeds 80% limit", "Current ratio below 1.0 — short-term liquidity pressure", "No signed seasonal contracts on file"],
    rec: "Do not proceed on current terms. Request 12-month cash-flow forecast and signed seasonal LOIs; consider 30% deposit to bring LTV within policy.",
  },
  {
    id: "APP-2219",
    co: "Bushveld Heli Services",
    asset: "Robinson R66",
    amount: 6900000,
    bdo: "lisa",
    received: "11 Nov 2026",
    docs: { "Application form": 1, "Audited financials (3 yrs)": 0, "Management accounts YTD": 1, "Bank statements (6 months)": 0, "Air Operator Certificate": 1, "Director IDs & KYC": 1, "Independent aircraft valuation": 1, "Fleet utilisation report": 0 },
    k: { dscr: null, ltv: 0.74, de: null, cr: null, years: 4 },
    risk: null,
    summary: "Helicopter tourism and game-count operator. Application is incomplete — key financial documents have not been received, so a full assessment cannot be run yet.",
    strengths: ["LTV of 74% within policy", "AOC and KYC complete"],
    concerns: ["Audited financials missing", "Bank statements missing", "Utilisation report missing"],
    rec: "Assessment on hold. Request missing documents from applicant (draft email prepared).",
  },
  {
    id: "APP-2213",
    biz: "asset",
    co: "Swartland Grain Farms",
    asset: "John Deere S780 combine harvester",
    amount: 6300000,
    bdo: "fatima",
    received: "9 Nov 2026",
    docs: { "Application form": 1, "Audited financials (3 yrs)": 1, "Management accounts YTD": 1, "Bank statements (6 months)": 1, "Supplier quote / invoice": 1, "Director IDs & KYC": 1, "Independent asset valuation": 1, "Tax clearance certificate": 1 },
    k: { dscr: 1.56, ltv: 0.7, de: 1.1, cr: 1.45, years: 22 },
    risk: 24,
    summary: "Third-generation grain farm (22 years) replacing an 11-year-old harvester. Strong harvest in 2026 after two weaker seasons; seasonal cash flow aligned to a harvest-linked repayment schedule.",
    strengths: ["DSCR of 1.56× well above the 1.25× policy minimum", "Low leverage (1.1×) with substantial land equity", "Existing customer with no arrears in 6 years"],
    concerns: ["Rainfall-dependent income: consider crop insurance as a condition"],
    rec: "Proceed to credit committee with seasonal (annual balloon) repayment structure.",
  },
  {
    id: "APP-2217",
    biz: "asset",
    co: "Westcoast Mining Services",
    asset: "2 × CAT 745 articulated haulers",
    amount: 18400000,
    bdo: "ruan",
    received: "12 Nov 2026",
    docs: { "Application form": 1, "Audited financials (3 yrs)": 1, "Management accounts YTD": 0, "Bank statements (6 months)": 1, "Supplier quote / invoice": 1, "Director IDs & KYC": 1, "Independent asset valuation": 0, "Tax clearance certificate": 1 },
    k: { dscr: 1.19, ltv: 0.82, de: 2.7, cr: 1.05, years: 6 },
    risk: 63,
    summary: "Contract mining service provider expanding its hauling fleet for a new 3-year contract. Revenue concentrated in two mining clients.",
    strengths: ["Signed 3-year contract underpinning ~70% of projected utilisation", "6 years trading with growing revenue"],
    concerns: ["DSCR 1.19× below the 1.25× minimum", "LTV 82% and debt-to-equity 2.7× above policy limits", "Management accounts and valuation outstanding"],
    rec: "Return for more information: request YTD management accounts, valuation and contract cession; consider 25% deposit.",
  },
];

export const POLICY = { dscr: 1.25, ltv: 0.8, de: 2.5, cr: 1.0, years: 2 } as const;

export function money(n: number, full = false): string {
  if (full) return `R ${Math.round(n).toLocaleString("en-ZA").replace(/,/g, " ")}`;
  if (n >= 1e9) return `R ${(n / 1e9).toFixed(2)}bn`;
  if (n >= 1e6) return `R ${(n / 1e6).toFixed(n >= 1e8 ? 0 : 1)}m`;
  return `R ${n.toLocaleString("en-ZA")}`;
}

export function initials(n: string): string {
  return n.split(" ").map(part => part[0] ?? "").join("").slice(0, 2);
}

export function isOpen(l: Lead): boolean {
  return !["Won", "Lost"].includes(l.status);
}

export function inScope(x: { biz?: Business }, scope: Scope): boolean {
  return scope === "group" || (x.biz ?? "afc") === scope;
}

export function category(type: string): string {
  if (/King Air/i.test(type)) return "Turboprop & piston";
  if (/Scania|Volvo F|Isuzu|Hilux|Ranger|truck|tipper|Mercedes-Benz Actros/i.test(type)) return "Commercial vehicles";
  if (/Bell B40|CAT 3|CAT 9|Komatsu|excavator|loader|JCB|grader|CAT 745|CAT 980/i.test(type)) return "Construction & plant";
  if (/John Deere|Case IH|New Holland|harvester|tractor/i.test(type)) return "Agricultural";
  if (/forklift|Hyster|Linde/i.test(type)) return "Material handling";
  if (/Citation|Phenom|Learjet|Pilatus PC-24|Hawker/i.test(type)) return "Jets";
  if (/R44|R66|AW|Bell|H125|EC1|Koala/i.test(type)) return "Helicopters";
  if (/Air Tractor|Thrush|AT-/i.test(type)) return "Agricultural";
  return "Turboprop & piston";
}
