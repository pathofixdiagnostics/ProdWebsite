export const BUSINESS_DETAILS = {
  name: "PATHOFIX DIAGNOSTICS",
  tagline: "Advanced Diagnostics in Krishnagiri",
  sub_tagline: "Cell is our Priority — Fast, Accurate & Affordable Lab Testing",
  location: "Krishnagiri, Tamil Nadu",
  address: "43 B, First Floor, State Bank Road, Co-operative Colony, Opp. to DK Samy School, Krishnagiri – 635 001",
  phone: "04343-356314",
  mobile: "7200883952",
  whatsapp: "917200883952",
  email: "pathofixdiagnostics@gmail.com",
  mapUrl: "https://maps.app.goo.gl/qiPC3oDfSWo3ZLf76",
  mapEmbedUrl: "https://www.google.com/maps?q=43+B+State+Bank+Road+Cooperative+Colony+Krishnagiri+635001+Tamil+Nadu&output=embed"
};

export const TEST_PACKAGES = [
  {
    id: "basic",
    name: "Basic Health Check",
    icon: "Activity",
    tests: ["Blood Glucose (Fasting & Post Meal)", "CBC", "Urine Routine", "Serum Electrolytes", "Thyroid Profile"]
  },
  {
    id: "heart",
    name: "Heart & Lipid Profile",
    icon: "Heart",
    tests: ["Total Cholesterol", "HDL", "LDL", "VLDL", "Cardiac Risk Markers", "Lipid Ratio Analysis"]
  },
  {
    id: "liver",
    name: "Liver Function Test",
    icon: "Filter",
    tests: ["Bilirubin", "SGOT", "SGPT", "Protein", "Albumin", "Globulin"]
  },
  {
    id: "thyroid",
    name: "Thyroid Function Tests",
    icon: "ActivitySquare",
    tests: ["T3", "T4", "TSH", "FT3", "FT4"]
  },
  {
    id: "renal",
    name: "Renal Function Test",
    icon: "Droplets",
    tests: ["Urea", "Creatinine", "Uric Acid", "Electrolytes"]
  },
  {
    id: "diabetic",
    name: "Diabetic Screening",
    icon: "Syringe",
    tests: ["Fasting Blood Sugar", "Post Prandial Sugar", "HbA1c", "GTT"]
  },
  {
    id: "full-body",
    name: "Full Body Checkup",
    icon: "UserCheck",
    tests: ["CBC", "RFT", "LFT", "Thyroid Panel", "Lipid Profile", "Blood Sugar"]
  },
  {
    id: "viral",
    name: "Viral & Special Tests",
    icon: "Microscope",
    tests: ["HIV", "HBsAg", "HCV", "VDRL", "PT", "APTT", "ESR", "RA Factor", "CRP", "Uric Acid"]
  },
  {
    id: "histopath",
    name: "Histopathology",
    icon: "Search",
    tests: ["Tissue Biopsy", "Histopath", "Cytology", "FNAC", "Semen Analysis"]
  }
];

// Detailed test catalog grouped by department/profile.
// A category has EITHER `tests` (flat list) OR `panels` (named sub-panels).
export const TEST_CATALOG = [
  {
    id: "hematology",
    name: "Hematology & Coagulation",
    icon: "Droplets",
    tests: [
      "Complete Blood Count (CBC)",
      "Peripheral Smear",
      "Absolute Eosinophil Count",
      "Absolute Neutrophil Count",
      "Absolute Lymphocyte Count",
      "Manual Platelet Count",
      "Reticulocyte Count",
      "Bleeding Time",
      "Clotting Time",
      "Coagulation Profile (PT, INR, APTT)",
      "Smear for MP / MF",
      "Erythrocyte Sedimentation Rate (ESR)",
      "Sickling Test",
      "Osmotic Fragility Test",
    ],
  },
  {
    id: "blood-sugar",
    name: "Blood Sugar Profile",
    icon: "Syringe",
    tests: [
      "Random Blood Sugar",
      "Fasting Blood Sugar",
      "Postprandial Blood Sugar",
      "HbA1c",
    ],
  },
  {
    id: "renal",
    name: "Renal Function Test",
    icon: "Filter",
    tests: ["Blood Urea", "Serum Creatinine", "Serum Uric Acid"],
  },
  {
    id: "liver",
    name: "Liver Function Test",
    icon: "Activity",
    tests: [
      "Total Bilirubin",
      "Direct / Indirect Bilirubin",
      "SGOT",
      "SGPT",
      "Alkaline Phosphatase (ALP)",
      "GGT",
      "Total Protein",
      "Serum Albumin",
      "Serum Globulin",
      "A/G Ratio",
    ],
  },
  {
    id: "urine",
    name: "Urine Analysis",
    icon: "TestTube",
    tests: ["Urine Routine", "Urine Complete Analysis"],
  },
  {
    id: "bone-health",
    name: "Bone Health Profile",
    icon: "Bone",
    tests: [
      "Serum Calcium",
      "Serum Phosphorus",
      "Serum Magnesium",
      "Serum Parathyroid Hormone (PTH)",
      "Serum 25-Hydroxyvitamin D",
    ],
  },
  {
    id: "thyroid",
    name: "Thyroid Profile",
    icon: "ActivitySquare",
    tests: [
      "Serum TSH",
      "Serum Total T3",
      "Serum Total T4",
      "Free T3",
      "Free T4",
    ],
  },
  {
    id: "infertility",
    name: "Infertility Panels",
    icon: "HeartPulse",
    panels: [
      {
        name: "Panel 1 (Male)",
        tests: ["FSH", "LH", "Testosterone", "TSH", "Semen Analysis"],
      },
      {
        name: "Panel 2",
        tests: [
          "FSH",
          "LH",
          "Prolactin",
          "Testosterone",
          "TSH",
          "Estradiol",
          "Anti-Müllerian Hormone (AMH)",
        ],
      },
      {
        name: "Panel 3",
        tests: ["TSH", "Prolactin", "Anti-Müllerian Hormone (AMH)"],
      },
      {
        name: "Panel 4",
        tests: ["FSH", "LH", "Prolactin", "Testosterone", "TSH"],
      },
    ],
  },
  {
    id: "cervical-cancer",
    name: "Cervical Cancer Screening",
    icon: "ShieldCheck",
    tests: [
      "Pap Smear (Conventional)",
      "Pap Smear (Liquid Based Cytology)",
      "Pap Smear with HPV DNA (14 Genotypes)",
    ],
  },
  {
    id: "anemia",
    name: "Anemia Profile",
    icon: "Droplet",
    panels: [
      {
        name: "Panel 1",
        tests: [
          "Complete Blood Count",
          "Peripheral Smear",
          "Serum Iron",
          "Serum Ferritin",
          "Total Iron Binding Capacity (TIBC)",
          "Serum Transferrin",
          "Transferrin Saturation",
          "Serum Total Protein",
          "C-Reactive Protein (CRP)",
        ],
      },
      {
        name: "Panel 2",
        tests: ["All Panel 1 tests", "Blood Lead"],
      },
    ],
  },
  {
    id: "histopathology",
    name: "Histopathology & Cytology",
    icon: "Microscope",
    tests: [
      "Biopsy — Small",
      "Biopsy — Medium",
      "Biopsy — Large",
      "Biopsy — Extra Large",
      "Cell Block",
      "Second Opinion Slides",
      "Immunohistochemistry (IHC)",
      "FNAC",
      "Fluid Cytology",
      "Semen Analysis",
    ],
  },
] as const;

export const FACILITIES = [
  {
    id: "auto-analyzer",
    title: "Fully Automated Analyzer",
    description: "State-of-the-art analyzers minimizing human error and ensuring highly precise results.",
    icon: "Cpu"
  },
  {
    id: "biochem",
    title: "Biochemistry Lab",
    description: "Comprehensive metabolic panel testing with rapid turnaround times.",
    icon: "TestTube2"
  },
  {
    id: "hematology",
    title: "Hematology Lab",
    description: "Advanced cell counters for precise blood profiling and disease detection.",
    icon: "Microscope"
  },
  {
    id: "immunology",
    title: "Immunology Testing",
    description: "Specialized assays for identifying immune system disorders and infectious diseases.",
    icon: "ShieldAlert"
  },
  {
    id: "histopath",
    title: "Histopathology & Cytology",
    description: "Expert microscopic evaluation of tissue and cell samples by qualified pathologists.",
    icon: "Search"
  },
  {
    id: "home-collection",
    title: "Home Sample Collection",
    description: "Convenient sample collection from the comfort of your home by trained phlebotomists.",
    icon: "Home"
  },
  {
    id: "digital",
    title: "Digital Reports",
    description: "Secure, online access to your test results via email and WhatsApp.",
    icon: "FileText"
  },
  {
    id: "quality",
    title: "Quality Assurance",
    description: "Strict adherence to quality control protocols conforming to the highest medical standards.",
    icon: "CheckCircle"
  }
];
