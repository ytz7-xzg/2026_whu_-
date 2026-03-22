import { ArrowUpDown, Filter, NotebookPen, Search, Trash2, Undo2 } from "lucide-react";
import type { CategoryRecord, NoteRecord } from "../../data/notes";
import { formatDateTime, getCategoryChipStyle, getCategoryDotStyle, truncateText } from "./workspaceHelpers";
import type { SortMode, TimeFilter } from "./workspaceTypes";

type NotesListPanelProps = {
  title: string;
  description: string;
  notes: NoteRecord[];
  selectedNoteId: string | null;
  categoryMap: Map<string, CategoryRecord>;
  searchText: string;
  sortMode: SortMode;
  timeFilter: TimeFilter;
  onSearchTextChange: (value: string) => void;
  onSortModeChange: (value: SortMode) => void;
  onTimeFilterChange: (value: TimeFilter) => void;
  onCreateNote: () => void;
  onSelectNote: (note: NoteRecord) => void;
  onMoveToTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onDeleteForever: (id: string) => void;
};

const tagIds = (tags: string[], categoryMap: Map<string, CategoryRecord>) =>
  tags.filter((id) => categoryMap.has(id));

export function NotesListPanel({
  title,
  description,
  notes,
  selectedNoteId,
  categoryMap,
  searchText,
  sortMode,
  timeFilter,
  onSearchTextChange,
  onSortModeChange,
  onTimeFilterChange,
  onCreateNote,
  onSelectNote,
  onMoveToTrash,
  onRestore,
  onDeleteForever,
}: NotesListPanelProps) {
  return (
    <section className="workspace-column notes-list-panel">
      <header className="notes-panel-header">
        <div>
          <p className="notes-panel-title">{title}</p>
          <p className="notes-panel-subtitle">{description}</p>
        </div>
      </header>

      <div className="notes-list-toolbar">
        <label className="notes-input-with-icon">
          <Search className="h-4 w-4" />
          <input
            type="text"
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder="搜索标题或正文"
          />
        </label>

        <label className="notes-select-with-icon">
          <ArrowUpDown className="h-4 w-4" />
          <select
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value as SortMode)}
          >
            <option value="updatedDesc">按最近更新</option>
            <option value="updatedAsc">按最早更新</option>
            <option value="createdDesc">按最近创建</option>
          </select>
        </label>

        <label className="notes-select-with-icon">
          <Filter className="h-4 w-4" />
          <select
            value={timeFilter}
            onChange={(event) => onTimeFilterChange(event.target.value as TimeFilter)}
          >
            <option value="all">全部时间</option>
            <option value="today">今天更新</option>
            <option value="sevenDays">最近 7 天</option>
          </select>
        </label>

        <button type="button" className="notes-btn notes-btn-primary" onClick={onCreateNote}>
          <NotebookPen className="h-4 w-4" />
          新建笔记
        </button>
      </div>

      <div className="notes-list-scroll">
        {notes.length === 0 ? (
          <div className="notes-empty-state">
            <h3>当前没有可显示的笔记</h3>
            <p>调整筛选条件，或者创建一条新笔记。</p>
            <button type="button" className="notes-btn notes-btn-primary" onClick={onCreateNote}>
              创建第一条笔记
            </button>
          </div>
        ) : (
          <div className="notes-card-list">
            {notes.map((note) => {
              const visibleTagIds = tagIds(note.tags, categoryMap);
              return (
                <article
                  key={note.id}
                  className={`notes-list-card ${selectedNoteId === note.id ? "is-selected" : ""}`}
                  onClick={() => onSelectNote(note)}
                >
                  <div className="notes-list-card__head">
                    <div className="notes-tag-group">
                      {visibleTagIds.length === 0 ? (
                        <span className="notes-tag-empty">未分类</span>
                      ) : (
                        visibleTagIds.slice(0, 3).map((id) => {
                          const category = categoryMap.get(id);
                          if (!category) return null;
                          return (
                            <span
                              key={id}
                              className="notes-tag-pill"
                              style={getCategoryChipStyle(category.color, true)}
                            >
                              <span
                                className="notes-color-dot"
                                style={getCategoryDotStyle(category.color)}
                              />
                              {category.name}
                            </span>
                          );
                        })
                      )}
                    </div>

                    <div className="notes-list-card__actions">
                      {note.deleted ? (
                        <>
                          <button
                            type="button"
                            className="notes-inline-action"
                            onClick={(event) => {
                              event.stopPropagation();
                              onRestore(note.id);
                            }}
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                            还原
                          </button>
                          <button
                            type="button"
                            className="notes-inline-action danger"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteForever(note.id);
                            }}
                          >
                            永久删除
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="notes-inline-action danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            onMoveToTrash(note.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          回收站
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="notes-list-card__title">{note.title}</h3>
                  <p className="notes-list-card__summary">{truncateText(note.content, 96)}</p>
                  <p className="notes-list-card__time">更新于 {formatDateTime(note.updatedAt)}</p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
