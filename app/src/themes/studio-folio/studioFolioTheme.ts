import { defineTheme } from "@astryxdesign/core/theme";
import { stoneTheme } from "@astryxdesign/theme-stone/built";

export const studioFolioTheme = defineTheme({
  name: "studio-folio",
  extends: stoneTheme,
  tokens: {
    // Primary surfaces (Raw Architectural Plaster #F5F4F0 light, Deep Carbon #121316 dark)
    "--color-background-body": ["#F5F4F0", "#121316"],
    "--color-background-surface": ["#FFFFFF", "#1B1D22"],
    "--color-background-card": ["#FFFFFF", "#1B1D22"],
    "--color-background-popover": ["#FFFFFF", "#23252C"],
    "--color-background-muted": ["#EAE8E1", "#23252C"],
    "--color-overlay-hover": ["rgba(24, 25, 28, 0.05)", "rgba(245, 244, 240, 0.06)"],
    "--color-overlay-pressed": ["rgba(24, 25, 28, 0.10)", "rgba(245, 244, 240, 0.12)"],

    // Structural Carbon Ink (#18191C light, Plaster #F5F4F0 dark)
    "--color-text-primary": ["#18191C", "#F5F4F0"],
    "--color-text-secondary": ["#555963", "#9B9FA8"],
    "--color-icon-primary": ["#18191C", "#F5F4F0"],
    "--color-icon-secondary": ["#555963", "#9B9FA8"],

    // Drafting Signal Orange (#C44114 accessible fill / #D94E1F architectural signal / #F06434 dark)
    "--color-accent": ["#C44114", "#D94E1F"],
    "--color-accent-muted": ["#FDEEE8", "rgba(240, 100, 52, 0.20)"],
    "--color-on-accent": ["#FFFFFF", "#FFFFFF"],
    "--color-text-accent": ["#C44114", "#F47B4F"],
    "--color-icon-accent": ["#D94E1F", "#F47B4F"],

    // Swiss hairline borders
    "--color-border": ["#D9D6CE", "#2D3038"],
    "--color-border-emphasized": ["#A8A49B", "#4B4F5B"],

    // Semantic statuses (harmonized with Concrete & Signal Orange)
    "--color-success": ["#16654B", "#16654B"],
    "--color-success-muted": ["#E2F2EC", "rgba(45, 184, 138, 0.16)"],
    "--color-text-success": ["#16654B", "#34D399"],
    "--color-error": ["#B91C1C", "#DC2626"],
    "--color-error-muted": ["#FEECEC", "rgba(248, 113, 113, 0.16)"],
    "--color-text-error": ["#B91C1C", "#F87171"],
    "--color-warning": ["#9A5B13", "#D97706"],
    "--color-warning-muted": ["#FAF0DC", "rgba(245, 158, 11, 0.16)"],
    "--color-text-warning": ["#9A5B13", "#FBBF24"],

    // Data visualization series
    "--color-data-categorical-blue": ["#D94E1F", "#F06434"],
    "--color-data-categorical-green": ["#16654B", "#34D399"],
    "--color-data-categorical-orange": ["#18191C", "#E2E0D8"],
    "--color-data-categorical-red": ["#B91C1C", "#F87171"],
    "--color-data-neutral": ["#555963", "#9B9FA8"],

    // Typography (self-hosted via next/font/google CSS vars with safe fallbacks)
    "--font-family-heading":
      'var(--font-space-grotesk, "Space Grotesk"), system-ui, -apple-system, sans-serif',
    "--font-family-body":
      'var(--font-ibm-plex-sans, "IBM Plex Sans"), system-ui, -apple-system, sans-serif',
    "--font-family-code":
      'var(--font-ibm-plex-mono, "IBM Plex Mono"), ui-monospace, monospace',
  },
});
