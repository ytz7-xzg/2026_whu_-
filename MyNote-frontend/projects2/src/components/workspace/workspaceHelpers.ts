import type { CSSProperties } from "react";
import type { CategoryColorToken } from "../../data/notes";

type CategoryPalette = {
  dot: string;
  chipBackground: string;
  chipBorder: string;
  chipText: string;
  softBackground: string;
  softText: string;
  bar: string;
};

export const categoryPalette: Record<CategoryColorToken, CategoryPalette> = {
  indigo: {
    dot: "#6366f1",
    chipBackground: "rgba(99, 102, 241, 0.14)",
    chipBorder: "rgba(99, 102, 241, 0.3)",
    chipText: "#4338ca",
    softBackground: "rgba(99, 102, 241, 0.12)",
    softText: "#4338ca",
    bar: "linear-gradient(90deg, #818cf8 0%, #4f46e5 100%)",
  },
  sky: {
    dot: "#0ea5e9",
    chipBackground: "rgba(14, 165, 233, 0.14)",
    chipBorder: "rgba(14, 165, 233, 0.3)",
    chipText: "#0369a1",
    softBackground: "rgba(14, 165, 233, 0.12)",
    softText: "#0369a1",
    bar: "linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)",
  },
  rose: {
    dot: "#f43f5e",
    chipBackground: "rgba(244, 63, 94, 0.14)",
    chipBorder: "rgba(244, 63, 94, 0.3)",
    chipText: "#be123c",
    softBackground: "rgba(244, 63, 94, 0.12)",
    softText: "#be123c",
    bar: "linear-gradient(90deg, #fb7185 0%, #f43f5e 100%)",
  },
  emerald: {
    dot: "#10b981",
    chipBackground: "rgba(16, 185, 129, 0.14)",
    chipBorder: "rgba(16, 185, 129, 0.3)",
    chipText: "#047857",
    softBackground: "rgba(16, 185, 129, 0.12)",
    softText: "#047857",
    bar: "linear-gradient(90deg, #34d399 0%, #10b981 100%)",
  },
  amber: {
    dot: "#f59e0b",
    chipBackground: "rgba(245, 158, 11, 0.16)",
    chipBorder: "rgba(245, 158, 11, 0.34)",
    chipText: "#b45309",
    softBackground: "rgba(245, 158, 11, 0.12)",
    softText: "#b45309",
    bar: "linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)",
  },
  violet: {
    dot: "#8b5cf6",
    chipBackground: "rgba(139, 92, 246, 0.14)",
    chipBorder: "rgba(139, 92, 246, 0.3)",
    chipText: "#6d28d9",
    softBackground: "rgba(139, 92, 246, 0.12)",
    softText: "#6d28d9",
    bar: "linear-gradient(90deg, #a78bfa 0%, #8b5cf6 100%)",
  },
  cyan: {
    dot: "#06b6d4",
    chipBackground: "rgba(6, 182, 212, 0.14)",
    chipBorder: "rgba(6, 182, 212, 0.3)",
    chipText: "#0e7490",
    softBackground: "rgba(6, 182, 212, 0.12)",
    softText: "#0e7490",
    bar: "linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%)",
  },
};

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

export const truncateText = (value: string, max = 90) =>
  value.length > max ? `${value.slice(0, max)}...` : value;

export const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim();

export const createUid = (prefix: "note" | "cat") => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getCategoryDotStyle = (token: CategoryColorToken): CSSProperties => ({
  backgroundColor: categoryPalette[token].dot,
});

export const getCategoryChipStyle = (
  token: CategoryColorToken,
  active = true,
): CSSProperties => {
  const palette = categoryPalette[token];
  if (active) {
    return {
      backgroundColor: palette.chipBackground,
      borderColor: palette.chipBorder,
      color: palette.chipText,
    };
  }

  return {
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderColor: "rgba(203, 213, 225, 0.85)",
    color: "#475569",
  };
};

export const getCategorySoftStyle = (token: CategoryColorToken): CSSProperties => ({
  backgroundColor: categoryPalette[token].softBackground,
  color: categoryPalette[token].softText,
});
