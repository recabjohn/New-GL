// ---------------------------------------------------------------------------
// STAGE COLORS — inline style–safe hex values mapped to Tailwind design tokens
// ---------------------------------------------------------------------------
export const STAGE_COLORS = {
  'In Progress': '#2A5BAD', // ink-500
  'Clearance':   '#D97706', // amber-600
  'Registered':  '#4879C2', // ink-400
  'Offered':     '#1AAD61', // sage-500
  'Bound':       '#F05A2A', // flame-500
  'Issued':      '#0E713E', // sage-700
}

// ---------------------------------------------------------------------------
// SUBMISSIONS  (20 rows for dashboard table)
// ---------------------------------------------------------------------------
export const submissions = [
  { id: 'SN129105', submissionNumber: 'SN129105', insuredName: 'Test',               dba: 'Test',              agencyName: 'Hawthorne Risk Advisors, LLC',  agentName: 'Michael Grant',    priority: 'HIGH',   transactionType: 'NEW-BUSINESS',  status: 'In Progress', effectiveDate: '10/01/2026', expirationDate: '10/01/2027', assignee: 'uiuxAdmin',    needByDate: '10/05/2026', createdDate: '03/05/2026', state: 'IL', annualRevenue: '$1,500,000', yearsInBusiness: 12, lossHistory: '2 losses — $38,200',  naicsCode: '238160', commission: 12.5 },
  { id: 'SN129106', submissionNumber: 'SN129106', insuredName: 'Anchor Marine Supply', dba: 'Anchor Marine',   agencyName: 'Pacific Crest Insurance',       agentName: 'Sarah Okonkwo',    priority: 'HIGH',   transactionType: 'RENEWAL',       status: 'Clearance',   effectiveDate: '11/01/2026', expirationDate: '11/01/2027', assignee: 'jsmith',       needByDate: '10/15/2026', createdDate: '03/04/2026', state: 'WA', annualRevenue: '$3,200,000', yearsInBusiness: 27, lossHistory: 'Clean (0 losses)',    naicsCode: '441110', commission: 12.5 },
  { id: 'SN129107', submissionNumber: 'SN129107', insuredName: 'Riverside Auto Repair', dba: 'Riverside Auto', agencyName: 'Meridian Specialty Lines',      agentName: 'Carlos Reyes',     priority: 'MEDIUM', transactionType: 'NEW-BUSINESS',  status: 'Offered',     effectiveDate: '09/15/2026', expirationDate: '09/15/2027', assignee: 'adavis',       needByDate: '09/20/2026', createdDate: '03/03/2026', state: 'CA', annualRevenue: '$875,000',   yearsInBusiness: 8,  lossHistory: '1 loss — $12,400',   naicsCode: '811111', commission: 12.5 },
  { id: 'SN129108', submissionNumber: 'SN129108', insuredName: 'Summit Roofing Co.',    dba: 'Summit Roofing',  agencyName: 'Apex Commercial Risk',          agentName: 'Lisa Tran',        priority: 'HIGH',   transactionType: 'NEW-BUSINESS',  status: 'In Progress', effectiveDate: '10/15/2026', expirationDate: '10/15/2027', assignee: 'uiuxAdmin',    needByDate: '10/10/2026', createdDate: '03/05/2026', state: 'TX', annualRevenue: '$2,100,000', yearsInBusiness: 15, lossHistory: 'Clean (0 losses)',    naicsCode: '238160', commission: 12.5 },
  { id: 'SN129109', submissionNumber: 'SN129109', insuredName: 'Blue Petal Florist',    dba: 'Blue Petal',      agencyName: 'Greenfield Risk Partners',      agentName: 'Omar Hassan',      priority: 'LOW',    transactionType: 'RENEWAL',       status: 'Registered',  effectiveDate: '08/01/2026', expirationDate: '08/01/2027', assignee: 'jsmith',       needByDate: '07/25/2026', createdDate: '03/02/2026', state: 'FL', annualRevenue: '$420,000',   yearsInBusiness: 6,  lossHistory: 'Clean (0 losses)',    naicsCode: '453110', commission: 12.5 },
  { id: 'SN129110', submissionNumber: 'SN129110', insuredName: 'Crestview Contractors', dba: 'Crestview',       agencyName: 'Hawthorne Risk Advisors, LLC',  agentName: 'Michael Grant',    priority: 'HIGH',   transactionType: 'ENDORSEMENT',   status: 'In Progress', effectiveDate: '10/01/2026', expirationDate: '10/01/2027', assignee: 'mrodriguez',   needByDate: '10/08/2026', createdDate: '03/05/2026', state: 'OH', annualRevenue: '$4,750,000', yearsInBusiness: 22, lossHistory: 'Clean (0 losses)',    naicsCode: '238210', commission: 12.5 },
  { id: 'SN129111', submissionNumber: 'SN129111', insuredName: 'Lakeside Storage LLC',  dba: 'Lakeside Self',   agencyName: 'Coastal Commercial Group',      agentName: 'Priya Sharma',     priority: 'MEDIUM', transactionType: 'NEW-BUSINESS',  status: 'Clearance',   effectiveDate: '11/15/2026', expirationDate: '11/15/2027', assignee: 'adavis',       needByDate: '11/01/2026', createdDate: '03/04/2026', state: 'GA', annualRevenue: '$1,100,000', yearsInBusiness: 9,  lossHistory: 'Clean (0 losses)',    naicsCode: '531130', commission: 12.5 },
  { id: 'SN129112', submissionNumber: 'SN129112', insuredName: 'Pinnacle Pediatrics',   dba: 'Pinnacle Peds',   agencyName: 'Meridian Specialty Lines',      agentName: 'Carlos Reyes',     priority: 'MEDIUM', transactionType: 'RENEWAL',       status: 'Offered',     effectiveDate: '09/01/2026', expirationDate: '09/01/2027', assignee: 'jsmith',       needByDate: '08/25/2026', createdDate: '03/01/2026', state: 'PA', annualRevenue: '$2,800,000', yearsInBusiness: 18, lossHistory: 'Clean (0 losses)',    naicsCode: '621111', commission: 12.5 },
  { id: 'SN129113', submissionNumber: 'SN129113', insuredName: 'Westgate Bar & Grill',  dba: 'Westgate',        agencyName: 'Pacific Crest Insurance',       agentName: 'Sarah Okonkwo',    priority: 'HIGH',   transactionType: 'NEW-BUSINESS',  status: 'In Progress', effectiveDate: '10/01/2026', expirationDate: '10/01/2027', assignee: 'uiuxAdmin',    needByDate: '09/28/2026', createdDate: '03/05/2026', state: 'NY', annualRevenue: '$1,950,000', yearsInBusiness: 11, lossHistory: '1 loss — $28,900',   naicsCode: '722511', commission: 12.5 },
  { id: 'SN129114', submissionNumber: 'SN129114', insuredName: 'Ironclad Security Inc.', dba: 'Ironclad',       agencyName: 'Apex Commercial Risk',          agentName: 'Lisa Tran',        priority: 'LOW',    transactionType: 'RENEWAL',       status: 'Registered',  effectiveDate: '07/01/2026', expirationDate: '07/01/2027', assignee: 'mrodriguez',   needByDate: '06/20/2026', createdDate: '02/28/2026', state: 'IL', annualRevenue: '$6,400,000', yearsInBusiness: 33, lossHistory: 'Clean (0 losses)',    naicsCode: '561612', commission: 12.5 },
  { id: 'SN129115', submissionNumber: 'SN129115', insuredName: 'Cypress Creek Nursery',  dba: 'Cypress Creek',  agencyName: 'Greenfield Risk Partners',      agentName: 'Omar Hassan',      priority: 'MEDIUM', transactionType: 'NEW-BUSINESS',  status: 'Clearance',   effectiveDate: '10/01/2026', expirationDate: '10/01/2027', assignee: 'adavis',       needByDate: '09/25/2026', createdDate: '03/03/2026', state: 'TX', annualRevenue: '$680,000',   yearsInBusiness: 5,  lossHistory: 'Clean (0 losses)',    naicsCode: '444220', commission: 12.5 },
  { id: 'SN129116', submissionNumber: 'SN129116', insuredName: 'Harbor View Hotel',      dba: 'Harbor View',    agencyName: 'Coastal Commercial Group',      agentName: 'Priya Sharma',     priority: 'HIGH',   transactionType: 'RENEWAL',       status: 'Offered',     effectiveDate: '12/01/2026', expirationDate: '12/01/2027', assignee: 'jsmith',       needByDate: '11/20/2026', createdDate: '03/04/2026', state: 'CA', annualRevenue: '$8,200,000', yearsInBusiness: 41, lossHistory: '1 loss — $12,400',   naicsCode: '721110', commission: 12.5 },
  { id: 'SN129117', submissionNumber: 'SN129117', insuredName: 'TechBridge Solutions',   dba: 'TechBridge',     agencyName: 'Hawthorne Risk Advisors, LLC',  agentName: 'Michael Grant',    priority: 'MEDIUM', transactionType: 'ENDORSEMENT',   status: 'In Progress', effectiveDate: '10/01/2026', expirationDate: '10/01/2027', assignee: 'mrodriguez',   needByDate: '10/12/2026', createdDate: '03/05/2026', state: 'WA', annualRevenue: '$5,300,000', yearsInBusiness: 7,  lossHistory: 'Clean (0 losses)',    naicsCode: '541511', commission: 12.5 },
  { id: 'SN129118', submissionNumber: 'SN129118', insuredName: 'Bayside Car Wash',       dba: 'Bayside',        agencyName: 'Meridian Specialty Lines',      agentName: 'Carlos Reyes',     priority: 'LOW',    transactionType: 'NEW-BUSINESS',  status: 'Registered',  effectiveDate: '08/15/2026', expirationDate: '08/15/2027', assignee: 'adavis',       needByDate: '08/10/2026', createdDate: '03/01/2026', state: 'FL', annualRevenue: '$920,000',   yearsInBusiness: 14, lossHistory: 'Clean (0 losses)',    naicsCode: '811192', commission: 12.5 },
  { id: 'SN129119', submissionNumber: 'SN129119', insuredName: 'Northfield Bakery',      dba: 'Northfield',     agencyName: 'Pacific Crest Insurance',       agentName: 'Sarah Okonkwo',    priority: 'MEDIUM', transactionType: 'RENEWAL',       status: 'Offered',     effectiveDate: '10/01/2026', expirationDate: '10/01/2027', assignee: 'jsmith',       needByDate: '09/30/2026', createdDate: '03/02/2026', state: 'NC', annualRevenue: '$540,000',   yearsInBusiness: 19, lossHistory: 'Clean (0 losses)',    naicsCode: '311812', commission: 12.5 },
  { id: 'SN129120', submissionNumber: 'SN129120', insuredName: 'Emerald Lawn & Landscape', dba: 'Emerald Lawn', agencyName: 'Apex Commercial Risk',          agentName: 'Lisa Tran',        priority: 'HIGH',   transactionType: 'NEW-BUSINESS',  status: 'Clearance',   effectiveDate: '11/01/2026', expirationDate: '11/01/2027', assignee: 'uiuxAdmin',    needByDate: '10/25/2026', createdDate: '03/05/2026', state: 'GA', annualRevenue: '$1,250,000', yearsInBusiness: 10, lossHistory: '2 losses — $51,700',  naicsCode: '561730', commission: 12.5 },
  { id: 'SN129121', submissionNumber: 'SN129121', insuredName: 'Magnolia Event Center',   dba: 'Magnolia',      agencyName: 'Greenfield Risk Partners',      agentName: 'Omar Hassan',      priority: 'MEDIUM', transactionType: 'ENDORSEMENT',   status: 'In Progress', effectiveDate: '10/01/2026', expirationDate: '10/01/2027', assignee: 'mrodriguez',   needByDate: '10/10/2026', createdDate: '03/04/2026', state: 'NY', annualRevenue: '$3,600,000', yearsInBusiness: 16, lossHistory: 'Clean (0 losses)',    naicsCode: '722320', commission: 12.5 },
  { id: 'SN129122', submissionNumber: 'SN129122', insuredName: 'Redstone Welding Inc.',   dba: 'Redstone',       agencyName: 'Coastal Commercial Group',      agentName: 'Priya Sharma',     priority: 'HIGH',   transactionType: 'RENEWAL',       status: 'Offered',     effectiveDate: '09/15/2026', expirationDate: '09/15/2027', assignee: 'adavis',       needByDate: '09/10/2026', createdDate: '03/03/2026', state: 'PA', annualRevenue: '$2,450,000', yearsInBusiness: 28, lossHistory: '3 losses — $94,100',  naicsCode: '332312', commission: 12.5 },
  { id: 'SN129123', submissionNumber: 'SN129123', insuredName: 'Valley Springs Gym',      dba: 'Valley Springs', agencyName: 'Hawthorne Risk Advisors, LLC', agentName: 'Michael Grant',    priority: 'LOW',    transactionType: 'NEW-BUSINESS',  status: 'Registered',  effectiveDate: '07/15/2026', expirationDate: '07/15/2027', assignee: 'jsmith',       needByDate: '07/08/2026', createdDate: '02/25/2026', state: 'OH', annualRevenue: '$760,000',   yearsInBusiness: 4,  lossHistory: 'Clean (0 losses)',    naicsCode: '713940', commission: 12.5 },
  { id: 'SN129124', submissionNumber: 'SN129124', insuredName: 'Desert Sun Solar LLC',    dba: 'Desert Sun',    agencyName: 'Meridian Specialty Lines',      agentName: 'Carlos Reyes',     priority: 'MEDIUM', transactionType: 'NEW-BUSINESS',  status: 'In Progress', effectiveDate: '10/01/2026', expirationDate: '10/01/2027', assignee: 'mrodriguez',   needByDate: '09/28/2026', createdDate: '03/05/2026', state: 'NC', annualRevenue: '$4,100,000', yearsInBusiness: 3,  lossHistory: 'Clean (0 losses)',    naicsCode: '238220', commission: 12.5 },
  { id: 'SN129125', submissionNumber: 'SN129125', insuredName: 'New Submission', dba: '', agencyName: '', agentName: '', priority: 'MEDIUM', transactionType: 'NEW-BUSINESS', status: 'In Progress', effectiveDate: '', expirationDate: '', assignee: 'uiuxAdmin', needByDate: '', createdDate: '03/06/2026', state: 'IL', annualRevenue: '$200,000', yearsInBusiness: 2, lossHistory: 'Clean (0 losses)', naicsCode: '541211', commission: 12.5 },
]

// ---------------------------------------------------------------------------
// ACCOUNT  (for SN129105)
// ---------------------------------------------------------------------------
export const account = {
  name: 'Test',
  dba: 'Test',
  fein: '',
  phone: '',
  email: '',
  legalEntity: 'Individual',
  address: {
    line1: '3703 South Racine Avenue',
    line2: '',
    city: 'Chicago',
    state: 'IL',
    zip: '60609',
    county: 'Cook',
    country: 'US',
  },
  // Business details
  naicsCode: '238160',
  naicsDescription: 'Roofing Contractors',
  industry: 'Construction',
  businessStartDate: '01/15/2012',
  descriptionOfOps: 'Commercial and residential roofing, including installation, repair, and maintenance services.',
  intelliscore: 72,
  financialStabilityScore: 85,
  // Submission info
  billingMethod: 'Agency Bill',
  defaultCommission: 12.5,
  externalSubmissionNumber: '',
  submissionDescription: '',
  installmentsAllowed: true,
  agencyLegalEntityName: 'Hawthorne Risk Advisors, LLC',
  submissionNote: '',
  uwEmail: 'uiuxadmin@solaris.com',
  serviceSpecialistName: '',
  serviceSpecialistEmail: '',
  applyLatestERC: true,
  contacts: [],
  namedInsureds: [],
  selectedLOBs: ['GL'],
  submissionType: 'NEW-BUSINESS',
  product: 'Solartis ISO - General Liability V1',
}

// ---------------------------------------------------------------------------
// GL POLICY  (from TC-GL-ND-10012026-V01.xlsx — Input sheet)
// ---------------------------------------------------------------------------
export const glPolicy = {
  underwriterName: 'uiuxAdmin',
  underwriterEmail: '',
  serviceSpecialistName: '',
  serviceSpecialistEmail: '',
  commission: 12.5,
  ercVersion: true,

  // Policy-level fields
  subline: 'Premises/Operations and Products/Completed Operations',
  eachOccurrenceLimit: '100,000 CSL',
  medPayLimit: '5,000',
  damageToRentedPremisesLimit: '100,000',
  personalAdvInjuryLimit: '100,000',
  generalAggregateLimit: '200,000 CSL',
  prodCompOpsAggregateLimit: '200,000 CSL',
  coverageForm: 'Occurrence',
  legalEntity: 'Individual',

  // Deductibles
  premOpsBI:    'No Deductible',
  prodCompOpsBI: '1,000 Per Occurrence',
  premOpsPD:    'No Deductible',
  prodCompOpsPD: 'No Deductible',
  premOpsBIandPD:    'No Deductible',
  prodCompOpsBIandPD: 'No Deductible',

  // Boolean flags
  governmentalSubdivision: false,
  limitedProductWithdrawal: false,
  sizeOfRiskRating: false,
  stopGapCoverage: false,
  medPayExclusion: false,
  cyberIncidentLiability: false,
  lossOfElectronicData: false,
  experienceRating: false,
  scheduleRating: false,
  tripTerminatesEarly: false,
  acceptTerrorismCoverage: false,
  compositeRating: false,
  limitedCoverageUnmannedAircraft: false,
  ndPesticideApplicator: false,

  // Premium to Reach Minimum
  premOpsMinimum: 0,
  prodCompOpsMinimum: 0,
  specialCombinedMinimum: 0,
  policyMinimum: 0,

  // Loss info
  lossRunYears: '5 Years',
  carrierLossRuns: 'ISO',
  carrierLossRunsReceived: 'Yes',
  liabilityClaimsOver1k: 0,
  liabilityClaimsOver100k: 0,
  liabilityMaxClaimsInYear: 0,
  liabilityOldestLossValuation: '02/27/2023',
  numberOfEmployees: 15,
  appetiteSignal: 'Standard',

  // Underwriting questions (Yes/No)
  uwQ_installationServiceRepair: false,
  uwQ_subcontractorsUsed: false,
  uwQ_operateAircraft: false,
  uwQ_explosivesBlasting: false,

  // Risk profile
  state: 'IL',
  estimatedAnnualRevenue: 1000000,
  oshaViolations: 0,
  repeatedViolations: 0,
  willfulViolations: 0,
  cspcProductRecalls: 0,
  fdaProductRecalls: 0,

  // Additional notes
  diligentEffortDocumentation: '',
  additionalTextForQuote: '',
  additionalCoverageDetail: '',
  additionalPolicyFee: 0,

  // Additional coverages
  additionalCoverages: [
    { id: 1, name: 'Primary And Noncontributory - Other Insurance Condition' },
  ],

  // Loss control override
  postBindLossControlOverride: 'Not Applicable',

  // State Schedule (Step 3)
  stateSchedule: [
    {
      id: 1,
      stateCode: 'IL',
      subline: 'Premises/Operations and Products/Completed Operations',
      isPrimary: true,
      locations: [],
    },
    {
      id: 2,
      stateCode: 'AL',
      subline: 'Premises/Operations and Products/Completed Operations',
      isPrimary: false,
      locations: [
        {
          id: 1,
          locationNumber: 1,
          name: 'Main Office',
          address: 'NE',
          address2: '',
          city: 'Bear Point',
          state: 'AL',
          zip: '35011',
          capindexCrimeScore: 5,
          litigationHazard: 'Average',
          mainOperations: 'Manufacturing',
          premOpsBI: 'No Deductible',
          premOpsPD: 'No Deductible',
          premOpsBIandPD: 'No Deductible',
          prodCompOpsBI: 'No Deductible',
          prodCompOpsPD: 'No Deductible',
          prodCompOpsBIandPD: 'No Deductible',
          premOpsTerritoryCode: '001',
          prodCompOpsTerritoryCode: '999',
          premium: 386.00,
          classifications: [
            {
              id: 1,
              classCode: '18078',
              classDescription: 'Ship Chandler Stores',
              classificationType: 'Mercantile',
              productCoverageOnly: false,
              highHazardCode: false,
              premiumBasis: 'Gross Sales',
              exposure: '1500000.00',
              premOpsPremium: 171.00,
              prodCompOpsPremium: 215.00,
              premOpsBIDeductible: '1,000 Per Occurrence',
              premOpsPDDeductible: 'No Deductible',
            },
          ],
        },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// SCHEDULE OF FORMS  (from Excel Input sheet)
// ---------------------------------------------------------------------------
export const scheduleForms = [
  { number: 'CG 00 01 04 13', name: 'Commercial General Liability Coverage Form - Occurrence',          type: 'c', premium: null  },
  { number: 'IL 00 17 11 98', name: 'Common Policy Conditions',                                          type: 'c', premium: null  },
  { number: 'CG 03 00 01 96', name: 'Deductible Liability Insurance',                                    type: 'c', premium: null  },
  { number: 'CG 21 06 12 23', name: 'Exclusion - Access Or Disclosure Of Confidential Or Personal Info', type: 'c', premium: null  },
  { number: 'CG 40 35 12 23', name: 'Exclusion - Cyber Incident',                                        type: 'c', premium: null  },
  { number: 'CG 00 69 12 23', name: 'Exclusion - Violation Of Law Addressing Data Privacy',              type: 'c', premium: null  },
  { number: 'CG 00 70 01 26', name: 'Exclusion - War',                                                   type: 'c', premium: null  },
  { number: 'CG 21 73 01 15', name: 'Exclusion Of Certified Acts Of Terrorism',                          type: 'o', premium: 100.00 },
  { number: 'IL 02 34 09 17', name: 'North Dakota Changes - Cancellation And Nonrenewal',                type: 'c', premium: null  },
  { number: 'IL 01 65 09 08', name: 'North Dakota Changes - Examination Of Your Books And Records',      type: 'c', premium: null  },
  { number: 'IL 00 21 09 08', name: 'Nuclear Energy Liability Exclusion Endorsement (Broad Form)',       type: 'c', premium: null  },
]

// ---------------------------------------------------------------------------
// RATING WORKSHEET  (from Excel Calculations sheet)
// ---------------------------------------------------------------------------
export const ratingWorksheet = {
  limits: {
    eachOccurrence: '100,000 CSL',
    generalAggregate: '200,000 CSL',
    personalAdvInjury: '100,000',
    prodCompOpsAggregate: '200,000 CSL',
  },
  certifiedTerrorismPremium: 100.00,
  locations: [
    {
      locationNumber: 1,
      classifications: [
        {
          classCode: '18078',
          classDescription: 'Ship Chandler Stores',
          premOpsTerritoryCode: '001',
          prodCompOpsTerritoryCode: '999',
          premOpsPremiumBasis: 'Gross Sales',
          prodCompOpsPremiumBasis: 'Gross Sales',
          premOpsILF: 1,
          prodCompOpsILF: 1,
          premOpsBIDeductible: '1,000 Per Occurrence',
          productsBIDeductible: 'No Deductible',
          premOpsHomogeneity: 'N/A',
          productsHomogeneity: 'N/A',
          premOpsILTable: '2',
          productsILTable: 'B',
          premOpsELP: 'Rate/Loss Cost Applies',
          productsELP: 'Rate/Loss Cost Applies',
          premOps: {
            lossCost: 0.115,
            lcm: 1,
            baseRate: 0.115,
            biDeductibleFactor: 0.011,
            pdDeductibleFactor: 0,
            finalDeductibleFactor: 0.011,
            cslIlf: 1,
            finalIlf: 0.989,
            packageModFactor: 1,
            expRatingMod: 1,
            expenseVariation: 1,
            modToUse: 1,
            finalRate: 0.114,
            exposure: 1500000,
            premium: 171.00,
          },
          prodCompOps: {
            lossCost: 0.143,
            lcm: 1,
            baseRate: 0.143,
            biDeductibleFactor: 0,
            pdDeductibleFactor: 0,
            finalDeductibleFactor: 0,
            cslIlf: 1,
            finalIlf: 1,
            packageModFactor: 1,
            expRatingMod: 1,
            expenseVariation: 1,
            modToUse: 1,
            finalRate: 0.143,
            exposure: 1500000,
            premium: 215.00,
          },
        },
      ],
    },
  ],
  totalPremium: 486.00,
}

// ---------------------------------------------------------------------------
// QUOTE
// ---------------------------------------------------------------------------
export const quote = {
  id: 'Q00-0014019-00',
  submissionNumber: 'SN129105',
  status: 'Offered',
  effectiveDate: '10/01/2026',
  expirationDate: '10/01/2027',
  basePremium: 386.00,
  certTerrorism: 100.00,
  totalTaxesFees: 0.00,
  totalOtherFees: 0.00,
  totalPremium: 486.00,
  documents: [
    { type: 'QuoteProposal',  name: 'QuoteProposal',  generatedBy: 'uiuxAdmin', generatedDate: '03/05/2026 06:24:50' },
    { type: 'RatingWorksheet', name: 'RatingWorksheet', generatedBy: 'uiuxAdmin', generatedDate: '03/05/2026 06:24:51' },
  ],
  diaryNotes: [],
  attachments: [],
}

// ---------------------------------------------------------------------------
// CLAIMS  (for SN129105)
// ---------------------------------------------------------------------------
export const claims = [
  {
    id: 'CLM-00291',
    submissionId: 'SN129105',
    date: '11/14/2025',
    type: 'Property Damage',
    status: 'Closed',
    reserve: 4200,
    paid: 3800,
    claimant: 'City of Chicago',
    description: 'Damage to city property during roofing work at adjacent building',
  },
  {
    id: 'CLM-00318',
    submissionId: 'SN129105',
    date: '01/22/2026',
    type: 'Bodily Injury',
    status: 'Open',
    reserve: 22500,
    paid: 0,
    claimant: 'Marcus D. Holt',
    description: 'Slip and fall at work site resulting in back injury',
  },
  {
    id: 'CLM-00341',
    submissionId: 'SN129105',
    date: '02/28/2026',
    type: 'Products Liability',
    status: 'In Investigation',
    reserve: 8000,
    paid: 0,
    claimant: 'Elena Voss',
    description: 'Alleged defective materials causing water intrusion damage',
  },
]

// ---------------------------------------------------------------------------
// LOOKUPS
// ---------------------------------------------------------------------------
export const deductibleOptions = [
  'No Deductible',
  '250 Per Claim',    '250 Per Occurrence',
  '500 Per Claim',    '500 Per Occurrence',
  '750 Per Claim',    '750 Per Occurrence',
  '1,000 Per Claim',  '1,000 Per Occurrence',
  '2,000 Per Claim',  '2,000 Per Occurrence',
  '3,000 Per Claim',  '3,000 Per Occurrence',
  '4,000 Per Claim',  '4,000 Per Occurrence',
  '5,000 Per Claim',  '5,000 Per Occurrence',
  '10,000 Per Claim', '10,000 Per Occurrence',
  '15,000 Per Claim', '15,000 Per Occurrence',
  '20,000 Per Claim', '20,000 Per Occurrence',
  '25,000 Per Claim', '25,000 Per Occurrence',
  '50,000 Per Claim', '50,000 Per Occurrence',
  '75,000 Per Claim', '75,000 Per Occurrence',
  '100,000 Per Claim','100,000 Per Occurrence',
]

export const usStates = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
]

export const assignees = ['uiuxAdmin', 'jsmith', 'adavis', 'mrodriguez']

export const agencies = [
  'Hawthorne Risk Advisors, LLC',
  'Pacific Crest Insurance',
  'Meridian Specialty Lines',
  'Apex Commercial Risk',
  'Greenfield Risk Partners',
  'Coastal Commercial Group',
]

export const lossRunYearsOptions = ['1 Year', '2 Years', '3 Years', '4 Years', '5 Years']
export const carrierLossRunOptions = ['ISO', 'AAIS', 'Company Specific', 'Not Available']
