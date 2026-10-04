import type { VisaCountry, VisaStatus } from "../types";

const common = ["Passport valid 6+ months with 2 blank pages", "Recent passport-size photograph (white background)", "Confirmed return ticket"];

export const visaCountries: VisaCountry[] = [
  { id: "uae", name: "United Arab Emirates", code: "ae", types: ["Tourist", "Business", "Transit"], processing: "3–5 working days", fromPrice: 95, validity: "30 / 60 days", requirements: [...common, "Hotel booking or host details", "Bank statement (3 months)"], popular: true },
  { id: "thailand", name: "Thailand", code: "th", types: ["Tourist", "Business", "Student"], processing: "5–7 working days", fromPrice: 65, validity: "60 days", requirements: [...common, "Proof of accommodation", "Bank statement (6 months)"], popular: true },
  { id: "malaysia", name: "Malaysia", code: "my", types: ["Tourist", "Business", "Transit"], processing: "2–4 working days", fromPrice: 45, validity: "30 days", requirements: [...common, "Flight itinerary"], popular: true },
  { id: "singapore", name: "Singapore", code: "sg", types: ["Tourist", "Business"], processing: "4–6 working days", fromPrice: 55, validity: "30 days", requirements: [...common, "Employment letter or NOC", "Bank statement (3 months)"], popular: true },
  { id: "turkey", name: "Türkiye", code: "tr", types: ["Tourist", "Business", "Student"], processing: "7–10 working days", fromPrice: 110, validity: "90 days", requirements: [...common, "Travel insurance", "Bank statement (6 months)"], popular: true },
  { id: "uk", name: "United Kingdom", code: "gb", types: ["Tourist", "Business", "Student", "Transit"], processing: "15–21 working days", fromPrice: 220, validity: "6 months", requirements: [...common, "Employment & income evidence", "Bank statement (6 months)", "Travel history"], popular: true },
  { id: "usa", name: "United States", code: "us", types: ["Tourist", "Business", "Student"], processing: "Interview-based", fromPrice: 260, validity: "Up to 10 years", requirements: [...common, "DS-160 confirmation", "Interview appointment", "Financial documents"], popular: true },
  { id: "canada", name: "Canada", code: "ca", types: ["Tourist", "Business", "Student", "Transit"], processing: "20–30 working days", fromPrice: 210, validity: "Up to 10 years", requirements: [...common, "Biometrics", "Proof of funds", "Purpose of travel letter"], popular: true },
  { id: "schengen", name: "Schengen Area", code: "eu", types: ["Tourist", "Business", "Student", "Transit"], processing: "10–15 working days", fromPrice: 180, validity: "Up to 90 days", requirements: [...common, "Schengen travel insurance (€30,000)", "Bank statement (6 months)", "Detailed itinerary"], popular: true },
  { id: "japan", name: "Japan", code: "jp", types: ["Tourist", "Business"], processing: "5–8 working days", fromPrice: 90, validity: "15–90 days", requirements: [...common, "Daily itinerary", "Bank statement (3 months)"], popular: false },
];

export const visaStatusFlow: VisaStatus[] = ["Submitted", "Under Review", "Processing", "Approved", "Completed"];

export const trackingSteps = [
  { key: "Submitted", label: "Application Submitted", desc: "We received your application and fee." },
  { key: "Documents Verified", label: "Documents Verified", desc: "Our visa desk checked every document." },
  { key: "Processing", label: "Processing", desc: "Your file has been lodged with the authority." },
  { key: "Embassy Review", label: "Embassy Review", desc: "The embassy or consulate is reviewing your case." },
  { key: "Decision", label: "Decision", desc: "A decision has been issued." },
  { key: "Completed", label: "Completed", desc: "Passport and visa returned to you." },
] as const;

/** Map an application status to how many tracking steps are complete. */
export function trackingProgress(status: VisaStatus): number {
  switch (status) {
    case "Submitted":
      return 1;
    case "Under Review":
    case "Documents Required":
      return 1;
    case "Processing":
      return 3;
    case "Approved":
    case "Rejected":
      return 5;
    case "Completed":
      return 6;
  }
}
