-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL,
    "survey_version" VARCHAR(32) NOT NULL,
    "submitted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completion_seconds" INTEGER,
    "answers" JSONB NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_up_contacts" (
    "id" TEXT NOT NULL,
    "survey_version" VARCHAR(32) NOT NULL,
    "availability" VARCHAR(16) NOT NULL,
    "name" VARCHAR(160),
    "contact" VARCHAR(255) NOT NULL,
    "consent_given" BOOLEAN NOT NULL,
    "consent_timestamp" TIMESTAMPTZ(3) NOT NULL,
    "privacy_notice_version" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_up_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_events" (
    "id" TEXT NOT NULL,
    "session_token" VARCHAR(64) NOT NULL,
    "survey_version" VARCHAR(32) NOT NULL,
    "event_type" VARCHAR(32) NOT NULL,
    "step" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "survey_responses_survey_version_submitted_at_idx" ON "survey_responses"("survey_version", "submitted_at" DESC);

-- CreateIndex
CREATE INDEX "follow_up_contacts_created_at_idx" ON "follow_up_contacts"("created_at" DESC);

-- CreateIndex
CREATE INDEX "survey_events_survey_version_event_type_created_at_idx" ON "survey_events"("survey_version", "event_type", "created_at" DESC);

