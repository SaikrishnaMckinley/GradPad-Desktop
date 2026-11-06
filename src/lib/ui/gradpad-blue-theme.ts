/** Grad Pad / Figma checkout blue — shared across donate & event registration. */

import type { CSSProperties } from "react";

export const GRADPAD_BLUE = {
  dark: "#0957a5",
  main: "#0b66c3",
  light: "#1a7fd4",
} as const;

export function gradPadBlueGradientStyle(): CSSProperties {
  return {
    background: `linear-gradient(135deg, ${GRADPAD_BLUE.dark} 0%, ${GRADPAD_BLUE.main} 55%, ${GRADPAD_BLUE.light} 100%)`,
  };
}

export const gradPadBlueProgressTrack = "#e8eef4";
