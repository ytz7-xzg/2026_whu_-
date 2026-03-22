import type { CategoryRecord, WorkspacePrimaryView } from "../../data/notes";

export type PrimaryView = Exclude<WorkspacePrimaryView, "category">;

export type SortMode = "updatedDesc" | "updatedAsc" | "createdDesc";
export type TimeFilter = "all" | "today" | "sevenDays";

export type DraftState = {
  title: string;
  content: string;
  tags: string[];
};

export type CategoryWithCount = CategoryRecord & {
  count: number;
};

export type WorkspaceCounts = {
  all: number;
  recent: number;
  trash: number;
  today: number;
};

export type TrendSummary = {
  delta: number;
  label: string;
};

export type OverviewMetrics = {
  activeCategoryCount: number;
  uncategorizedCount: number;
  topCategoryName: string;
};
