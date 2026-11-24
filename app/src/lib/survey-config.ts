export const SURVEY_VERSION = process.env.NEXT_PUBLIC_SURVEY_VERSION ?? "v1.0.0";
export const PRIVACY_NOTICE_VERSION = "v1.0.0";

export interface SurveyOption {
  value: string;
  label: string;
  exclusive?: boolean;
}

export interface SurveyStepMeta {
  index: number;
  id: string;
  shortLabel: string;
  title: string;
  description: string;
}

export const SURVEY_STEPS: SurveyStepMeta[] = [
  {
    index: 0,
    id: "background",
    shortLabel: "Background",
    title: "Professional background",
    description:
      "Help us understand your discipline, team size, and how often you pitch prospective clients.",
  },
  {
    index: 1,
    id: "workflow",
    shortLabel: "Workflow",
    title: "Current presentation workflow",
    description:
      "How you currently assemble, customize, and deliver portfolios or pitch decks.",
  },
  {
    index: 2,
    id: "pain-points",
    shortLabel: "Pain points",
    title: "Pain points and business impact",
    description:
      "Where presentation preparation costs the most time, effort, or lost opportunities.",
  },
  {
    index: 3,
    id: "solution",
    shortLabel: "Solution",
    title: "Solution validation",
    description:
      "Evaluate this concept based on your actual day-to-day needs, not simply whether it sounds interesting.",
  },
  {
    index: 4,
    id: "pricing",
    shortLabel: "Pricing",
    title: "Pricing and follow-up",
    description:
      "Realistic monthly pricing in Philippine Pesos (₱) and an optional follow-up opt-in.",
  },
];

export const Q01_PROFESSION_OPTIONS: SurveyOption[] = [
  { value: "architect", label: "Architect / Architectural firm" },
  { value: "engineer", label: "Civil / Structural / MEP Engineer" },
  { value: "interior_designer", label: "Interior Designer" },
  { value: "contractor", label: "Construction / Design-Build Contractor" },
  { value: "engineering_consultant", label: "Engineering / Technical Consultant" },
  { value: "creative_agency", label: "Creative / Marketing Agency" },
  { value: "it_consultant", label: "Software / IT Consultant" },
  { value: "other", label: "Other" },
];

export const Q02_WORK_SETUP_OPTIONS: SurveyOption[] = [
  { value: "solo", label: "Independent freelancer / Solo practitioner" },
  { value: "small_2_5", label: "Small firm (2–5 people)" },
  { value: "growing_6_20", label: "Growing firm (6–20 people)" },
  { value: "large_21_plus", label: "Larger firm (21+ people)" },
  { value: "employee_pitching", label: "Employee who participates in client pitches" },
];

export const Q03_ACQUISITION_OPTIONS: SurveyOption[] = [
  { value: "referrals", label: "Referrals / Word of mouth" },
  { value: "social_media", label: "Social media" },
  { value: "website_portfolio", label: "Website / Online portfolio" },
  { value: "professional_networks", label: "Professional networks" },
  { value: "online_marketplaces", label: "Online marketplaces" },
  { value: "direct_outreach", label: "Direct outreach" },
  { value: "bidding_tendering", label: "Bidding / Tendering" },
  { value: "other", label: "Other" },
];

export const Q04_PITCH_FREQ_OPTIONS: SurveyOption[] = [
  { value: "0", label: "0" },
  { value: "1_2", label: "1–2" },
  { value: "3_5", label: "3–5" },
  { value: "6_10", label: "6–10" },
  { value: "more_than_10", label: "More than 10" },
];

export const Q05_LAST_PRESENTED_OPTIONS: SurveyOption[] = [
  { value: "past_week", label: "Within the past week" },
  { value: "past_month", label: "Within the past month" },
  { value: "past_3_months", label: "Within the past 3 months" },
  { value: "more_than_3_months", label: "More than 3 months ago" },
  { value: "never", label: "Never" },
];

export const Q06_MATERIALS_OPTIONS: SurveyOption[] = [
  { value: "project_photos", label: "Photos of previous projects" },
  { value: "pdf_portfolio", label: "PDF portfolio" },
  { value: "slide_deck", label: "PowerPoint / Slide deck" },
  { value: "website_portfolio", label: "Website / Online portfolio" },
  { value: "social_media_pages", label: "Social media pages" },
  { value: "drawings_renderings", label: "Drawings / Plans / Renderings" },
  { value: "written_proposal", label: "Written proposal / Quotation" },
  { value: "other", label: "Other" },
];

export const Q07_TOOLS_OPTIONS: SurveyOption[] = [
  { value: "canva", label: "Canva" },
  { value: "powerpoint", label: "PowerPoint" },
  { value: "google_slides", label: "Google Slides" },
  { value: "figma", label: "Figma" },
  { value: "adobe_indesign_illustrator", label: "Adobe InDesign / Illustrator" },
  { value: "pdf_editor", label: "PDF editor" },
  { value: "website_builder", label: "Website builder" },
  { value: "no_dedicated_tools", label: "I don't use dedicated tools", exclusive: true },
  { value: "other", label: "Other" },
];

export const Q08_DELIVERY_OPTIONS: SurveyOption[] = [
  { value: "in_person", label: "In-person meeting" },
  { value: "video_call", label: "Video call / Screen sharing" },
  { value: "email_pdf", label: "PDF sent through email" },
  { value: "messaging_apps", label: "Messenger / Viber / WhatsApp" },
  { value: "shareable_link", label: "Shareable website / Link" },
  { value: "printed_portfolio", label: "Printed portfolio" },
  { value: "other", label: "Other" },
];

export const Q09_CUSTOMIZE_OPTIONS: SurveyOption[] = [
  { value: "always", label: "Always" },
  { value: "often", label: "Often" },
  { value: "sometimes", label: "Sometimes" },
  { value: "rarely", label: "Rarely" },
  { value: "never", label: "Never" },
];

export const Q10_PREP_TIME_OPTIONS: SurveyOption[] = [
  { value: "under_15m", label: "Less than 15 minutes" },
  { value: "15_30m", label: "15–30 minutes" },
  { value: "30_60m", label: "30–60 minutes" },
  { value: "1_3h", label: "1–3 hours" },
  { value: "over_3h", label: "More than 3 hours" },
  { value: "dont_prepare", label: "I don't prepare presentations" },
];

export const Q11_DIFFICULTIES_OPTIONS: SurveyOption[] = [
  { value: "finding_projects", label: "Finding relevant past projects" },
  { value: "recreating_decks", label: "Repeatedly creating similar presentations" },
  { value: "updating_portfolio", label: "Keeping portfolio information updated" },
  { value: "professional_look", label: "Making presentations look professional" },
  { value: "organizing_files", label: "Organizing project photos and files" },
  { value: "team_collaboration", label: "Collaborating with team members" },
  { value: "sharing_large_files", label: "Sharing large files" },
  { value: "mobile_presenting", label: "Presenting on mobile devices" },
  { value: "client_view_tracking", label: "Knowing whether clients viewed my presentation" },
  { value: "no_difficulties", label: "No significant difficulties", exclusive: true },
  { value: "other", label: "Other" },
];

export const Q13_SIGNIFICANCE_SCALE: SurveyOption[] = [
  { value: "1", label: "1 — Not significant" },
  { value: "2", label: "2 — Slightly significant" },
  { value: "3", label: "3 — Moderately significant" },
  { value: "4", label: "4 — Very significant" },
  { value: "5", label: "5 — Extremely significant" },
];

export const Q15_IMPACT_OPTIONS: SurveyOption[] = [
  { value: "yes_multiple", label: "Yes, more than once" },
  { value: "yes_once", label: "Yes, once" },
  { value: "not_aware", label: "Not that I'm aware of" },
  { value: "not_sure", label: "Not sure" },
];

export const Q16_USEFULNESS_SCALE: SurveyOption[] = [
  { value: "1", label: "1 — Not useful" },
  { value: "2", label: "2 — Slightly useful" },
  { value: "3", label: "3 — Moderately useful" },
  { value: "4", label: "4 — Very useful" },
  { value: "5", label: "5 — Extremely useful" },
];

export const Q17_CAPABILITIES_OPTIONS: SurveyOption[] = [
  { value: "reusable_library", label: "Reusable project library" },
  { value: "one_click_presentations", label: "One-click client-specific presentations" },
  { value: "presentation_templates", label: "Professional presentation templates" },
  { value: "shareable_links", label: "Shareable presentation links" },
  { value: "pdf_export", label: "PDF export" },
  { value: "viewing_analytics", label: "Client viewing analytics" },
  { value: "integrated_proposals", label: "Integrated quotations / Proposals" },
  { value: "team_collaboration", label: "Team collaboration" },
  { value: "ai_assisted_content", label: "AI-assisted presentation content" },
  { value: "public_portfolio", label: "Public portfolio website" },
];

export const Q18_BARRIERS_OPTIONS: SurveyOption[] = [
  { value: "existing_sufficient", label: "Existing tools are sufficient" },
  { value: "too_expensive", label: "Too expensive" },
  { value: "too_much_setup", label: "Too much setup / Data entry" },
  { value: "confidentiality", label: "Concern about confidential project information" },
  { value: "limited_customization", label: "Limited design customization" },
  { value: "clients_prefer_pdf", label: "Clients prefer traditional PDFs" },
  { value: "connectivity", label: "Internet access / Connectivity" },
  { value: "other", label: "Other" },
];

export const Q19_WTP_OPTIONS: SurveyOption[] = [
  { value: "free_only", label: "I would only use a free version" },
  { value: "php_1_199", label: "₱1–₱199" },
  { value: "php_200_399", label: "₱200–₱399" },
  { value: "php_400_699", label: "₱400–₱699" },
  { value: "php_700_999", label: "₱700–₱999" },
  { value: "php_1000_plus", label: "₱1,000 or more" },
  { value: "not_sure", label: "Not sure" },
];

export const Q20_FOLLOWUP_OPTIONS: SurveyOption[] = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
];

export function optionLabelMap(options: SurveyOption[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}
