import type { RawResponseRecord } from "./analytics";
import { PRIVACY_NOTICE_VERSION, SURVEY_VERSION } from "./survey-config";
import type { SurveyAnswers } from "./validation";

export interface DemoContactRecord {
  id: string;
  surveyVersion: string;
  availability: string;
  name: string | null;
  contact: string;
  consentGiven: boolean;
  consentTimestamp: Date;
  privacyNoticeVersion: string;
  createdAt: Date;
}

interface DevDemoStore {
  responses: RawResponseRecord[];
  contacts: DemoContactRecord[];
}

const globalForDemo = globalThis as unknown as {
  devDemoStore: DevDemoStore | undefined;
};

function createSeededDemoStore(): DevDemoStore {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const profiles: Array<{
    weight: number;
    professions: string[];
    workSetup: string;
    acquisition: string[];
    pitches: string;
    lastPresented: string;
    materials: string[];
    tools: string[];
    delivery: string[];
    customize: string;
    prepTime: string;
    difficulties: string[];
    bottleneck: string;
    significance: number;
    workaround: string;
    impact: string;
    usefulness: number;
    capabilities: string[];
    barriers: string[];
    wtp: string;
    followup: string;
    completionSeconds: number;
  }> = [
    {
      weight: 16,
      professions: ["architect"],
      workSetup: "small_2_5",
      acquisition: ["referrals", "social_media", "website_portfolio"],
      pitches: "3_5",
      lastPresented: "past_week",
      materials: ["project_photos", "pdf_portfolio", "drawings_renderings", "written_proposal"],
      tools: ["canva", "adobe_indesign_illustrator", "powerpoint"],
      delivery: ["in_person", "video_call", "messaging_apps", "email_pdf"],
      customize: "always",
      prepTime: "1_3h",
      difficulties: ["recreating_decks", "organizing_files", "finding_projects", "sharing_large_files"],
      bottleneck: "recreating_decks",
      significance: 5,
      workaround: "Duplicate an old InDesign or Canva file and manually swap renders.",
      impact: "yes_multiple",
      usefulness: 5,
      capabilities: ["reusable_library", "one_click_presentations", "pdf_export"],
      barriers: ["too_much_setup", "limited_customization"],
      wtp: "php_400_699",
      followup: "yes",
      completionSeconds: 345,
    },
    {
      weight: 12,
      professions: ["architect", "interior_designer"],
      workSetup: "solo",
      acquisition: ["referrals", "social_media"],
      pitches: "1_2",
      lastPresented: "past_month",
      materials: ["project_photos", "pdf_portfolio", "drawings_renderings"],
      tools: ["canva", "pdf_editor"],
      delivery: ["messaging_apps", "in_person", "email_pdf"],
      customize: "often",
      prepTime: "30_60m",
      difficulties: ["organizing_files", "updating_portfolio", "client_view_tracking"],
      bottleneck: "organizing_files",
      significance: 4,
      workaround: "Keep Google Drive folders by year and paste screenshots into Canva.",
      impact: "yes_once",
      usefulness: 4,
      capabilities: ["reusable_library", "presentation_templates", "shareable_links"],
      barriers: ["too_expensive", "clients_prefer_pdf"],
      wtp: "php_200_399",
      followup: "yes",
      completionSeconds: 310,
    },
    {
      weight: 14,
      professions: ["engineer"],
      workSetup: "growing_6_20",
      acquisition: ["referrals", "bidding_tendering", "professional_networks"],
      pitches: "3_5",
      lastPresented: "past_week",
      materials: ["pdf_portfolio", "slide_deck", "drawings_renderings", "written_proposal"],
      tools: ["powerpoint", "pdf_editor"],
      delivery: ["in_person", "email_pdf", "video_call"],
      customize: "often",
      prepTime: "1_3h",
      difficulties: ["finding_projects", "recreating_decks", "team_collaboration", "sharing_large_files"],
      bottleneck: "finding_projects",
      significance: 4,
      workaround: "Ask project engineers over Viber to dig up past completion photos.",
      impact: "yes_multiple",
      usefulness: 4,
      capabilities: ["reusable_library", "one_click_presentations", "team_collaboration"],
      barriers: ["confidentiality", "too_much_setup"],
      wtp: "php_700_999",
      followup: "maybe",
      completionSeconds: 390,
    },
    {
      weight: 11,
      professions: ["interior_designer"],
      workSetup: "small_2_5",
      acquisition: ["social_media", "referrals", "website_portfolio"],
      pitches: "3_5",
      lastPresented: "past_week",
      materials: ["project_photos", "pdf_portfolio", "drawings_renderings", "social_media_pages"],
      tools: ["canva", "google_slides", "figma"],
      delivery: ["messaging_apps", "video_call", "shareable_link"],
      customize: "always",
      prepTime: "over_3h",
      difficulties: ["organizing_files", "recreating_decks", "mobile_presenting", "client_view_tracking"],
      bottleneck: "recreating_decks",
      significance: 5,
      workaround: "Rebuild moodboards and case studies in Canva for each residential inquiry.",
      impact: "yes_once",
      usefulness: 5,
      capabilities: ["reusable_library", "presentation_templates", "viewing_analytics"],
      barriers: ["limited_customization", "too_much_setup"],
      wtp: "php_400_699",
      followup: "yes",
      completionSeconds: 365,
    },
    {
      weight: 10,
      professions: ["contractor"],
      workSetup: "growing_6_20",
      acquisition: ["referrals", "bidding_tendering", "direct_outreach"],
      pitches: "6_10",
      lastPresented: "past_week",
      materials: ["project_photos", "pdf_portfolio", "written_proposal"],
      tools: ["powerpoint", "canva", "pdf_editor"],
      delivery: ["messaging_apps", "in_person", "email_pdf"],
      customize: "sometimes",
      prepTime: "30_60m",
      difficulties: ["sharing_large_files", "organizing_files", "professional_look"],
      bottleneck: "sharing_large_files",
      significance: 4,
      workaround: "Compress PDFs online and send via Viber or Google Drive links.",
      impact: "not_aware",
      usefulness: 4,
      capabilities: ["shareable_links", "pdf_export", "integrated_proposals"],
      barriers: ["clients_prefer_pdf", "existing_sufficient"],
      wtp: "php_200_399",
      followup: "maybe",
      completionSeconds: 295,
    },
    {
      weight: 7,
      professions: ["creative_agency"],
      workSetup: "small_2_5",
      acquisition: ["social_media", "referrals", "direct_outreach"],
      pitches: "6_10",
      lastPresented: "past_week",
      materials: ["slide_deck", "website_portfolio", "written_proposal"],
      tools: ["figma", "google_slides", "canva"],
      delivery: ["video_call", "shareable_link", "email_pdf"],
      customize: "always",
      prepTime: "1_3h",
      difficulties: ["recreating_decks", "client_view_tracking", "updating_portfolio"],
      bottleneck: "client_view_tracking",
      significance: 4,
      workaround: "Export Figma decks to PDF and follow up manually if clients read them.",
      impact: "yes_once",
      usefulness: 4,
      capabilities: ["one_click_presentations", "viewing_analytics", "shareable_links"],
      barriers: ["limited_customization", "existing_sufficient"],
      wtp: "php_1000_plus",
      followup: "yes",
      completionSeconds: 330,
    },
    {
      weight: 5,
      professions: ["engineering_consultant"],
      workSetup: "solo",
      acquisition: ["professional_networks", "referrals"],
      pitches: "1_2",
      lastPresented: "past_3_months",
      materials: ["pdf_portfolio", "written_proposal"],
      tools: ["powerpoint", "pdf_editor"],
      delivery: ["email_pdf", "in_person"],
      customize: "rarely",
      prepTime: "15_30m",
      difficulties: ["updating_portfolio", "finding_projects"],
      bottleneck: "updating_portfolio",
      significance: 3,
      workaround: "Send a static company profile PDF updated twice a year.",
      impact: "not_aware",
      usefulness: 3,
      capabilities: ["reusable_library", "pdf_export", "public_portfolio"],
      barriers: ["existing_sufficient", "too_expensive"],
      wtp: "php_1_199",
      followup: "no",
      completionSeconds: 260,
    },
    {
      weight: 3,
      professions: ["it_consultant"],
      workSetup: "solo",
      acquisition: ["online_marketplaces", "referrals", "website_portfolio"],
      pitches: "1_2",
      lastPresented: "past_month",
      materials: ["website_portfolio", "slide_deck", "written_proposal"],
      tools: ["google_slides", "website_builder"],
      delivery: ["video_call", "shareable_link"],
      customize: "sometimes",
      prepTime: "15_30m",
      difficulties: ["updating_portfolio", "recreating_decks"],
      bottleneck: "updating_portfolio",
      significance: 2,
      workaround: "Maintain a Notion page and copy links into proposal emails.",
      impact: "not_sure",
      usefulness: 3,
      capabilities: ["public_portfolio", "shareable_links", "ai_assisted_content"],
      barriers: ["existing_sufficient"],
      wtp: "free_only",
      followup: "no",
      completionSeconds: 245,
    },
  ];

  const responses: RawResponseRecord[] = [];
  let seq = 1;

  for (const p of profiles) {
    for (let i = 0; i < p.weight; i++) {
      const daysAgo = (seq * 3) % 14;
      const submittedAt = new Date(now - daysAgo * dayMs - (seq % 7) * 3600_000);
      const answers: Partial<SurveyAnswers> = {
        q01_profession: p.professions,
        q01_profession_other: "",
        q02_work_setup: p.workSetup,
        q03_client_acquisition: p.acquisition,
        q03_client_acquisition_other: "",
        q04_monthly_pitches: p.pitches,
        q05_last_presented: p.lastPresented,
        q06_materials_shown: p.materials,
        q06_materials_shown_other: "",
        q07_tools_used: p.tools,
        q07_tools_used_other: "",
        q08_delivery_methods: p.delivery,
        q08_delivery_methods_other: "",
        q09_customize_frequency: p.customize,
        q10_prep_time: p.prepTime,
        q11_difficulties: p.difficulties,
        q11_difficulties_other: "",
        q12_biggest_bottleneck_choice: p.bottleneck,
        q12_biggest_bottleneck_text: "",
        q13_problem_significance: p.significance,
        q14_current_workaround: p.workaround,
        q15_business_impact: p.impact,
        q16_concept_usefulness: p.usefulness,
        q17_top_capabilities: p.capabilities,
        q18_adoption_barriers: p.barriers,
        q18_adoption_barriers_other: "",
        q19_willingness_to_pay: p.wtp,
        q20_followup_opt_in: p.followup,
      };

      responses.push({
        id: `demo_resp_${String(seq).padStart(3, "0")}`,
        surveyVersion: SURVEY_VERSION,
        submittedAt,
        completionSeconds: p.completionSeconds + ((seq * 17) % 90) - 45,
        answers,
      });
      seq += 1;
    }
  }

  responses.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

  const demoContactsSeed: Array<[string | null, string, "yes" | "maybe", number]> = [
    ["Ar. Paolo Reyes", "paolo@reyesarch.ph", "yes", 1],
    ["Engr. Carla Mendoza", "Viber · +63 917 555 0142", "yes", 2],
    ["IDr. Bea Santos", "bea@ateliermanila.co", "yes", 3],
    ["Ar. Miguel Villanueva", "miguel@kubo-studio.ph", "yes", 4],
    ["Engr. Jerome Dizon", "jdizon@stratumeng.ph", "maybe", 5],
    ["Katrina Lim", "kat@limdesignbuild.com", "yes", 6],
    ["IDr. Camille Tan", "WhatsApp · +63 918 555 0198", "yes", 7],
    ["Marco Soriano", "marco@northlinecreative.ph", "yes", 8],
    ["Ar. Denise Aquino", "denise@aquinoarchitects.ph", "maybe", 10],
    ["Engr. Rafael Cruz", "rcruz@cruzstructural.ph", "yes", 11],
    ["Tricia Bautista", "tricia@bautistainteriors.ph", "maybe", 12],
    [null, "studio.inquiries@buildph.example", "yes", 13],
  ];

  const contacts: DemoContactRecord[] = demoContactsSeed.map(
    ([name, contact, availability, daysAgo], idx) => {
      const ts = new Date(now - daysAgo * dayMs);
      return {
        id: `demo_contact_${String(idx + 1).padStart(3, "0")}`,
        surveyVersion: SURVEY_VERSION,
        availability,
        name,
        contact,
        consentGiven: true,
        consentTimestamp: ts,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        createdAt: ts,
      };
    }
  );

  return { responses, contacts };
}

export function isDevDemoFallbackAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function getDevDemoStore(): DevDemoStore {
  if (!globalForDemo.devDemoStore) {
    globalForDemo.devDemoStore = createSeededDemoStore();
  }
  return globalForDemo.devDemoStore;
}
