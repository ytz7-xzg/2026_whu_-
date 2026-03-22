import type { CategoryRecord } from "../../data/notes";
import { getCategoryChipStyle, getCategoryDotStyle } from "./workspaceHelpers";

type TagSelectorProps = {
  categories: CategoryRecord[];
  tags: string[];
  onToggle: (id: string) => void;
  emptyText?: string;
};

export function TagSelector({
  categories,
  tags,
  onToggle,
  emptyText = "暂无分类，请先在左栏新增分类。",
}: TagSelectorProps) {
  if (categories.length === 0) {
    return <p className="notes-muted-text">{emptyText}</p>;
  }

  return (
    <div className="notes-tag-selector">
      {categories.map((category) => {
        const active = tags.includes(category.id);
        return (
          <button
            key={category.id}
            type="button"
            className="notes-tag-button"
            style={getCategoryChipStyle(category.color, active)}
            onClick={() => onToggle(category.id)}
          >
            <span className="notes-color-dot" style={getCategoryDotStyle(category.color)} />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
