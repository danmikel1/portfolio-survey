import type { Metadata } from "next";
import { SurveyWizard } from "@/components/survey/SurveyWizard";

export const metadata: Metadata = {
  title: "Take the Survey — Client Presentation & Portfolio Workflow",
};

export default function SurveyPage() {
  return <SurveyWizard />;
}
