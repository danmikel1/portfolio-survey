"use client";

import NextLink from "next/link";
import type { ReactNode } from "react";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { defaultThemeSlug, themes } from "@/astryx-themes";

interface AstryxRootProviderProps {
  children: ReactNode;
  mode?: "light" | "dark";
}

export function AstryxRootProvider({
  children,
  mode = "light",
}: AstryxRootProviderProps) {
  return (
    <LinkProvider component={NextLink}>
      <Theme theme={themes[defaultThemeSlug]} mode={mode}>
        {children}
      </Theme>
    </LinkProvider>
  );
}
