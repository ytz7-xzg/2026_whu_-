import { Check, NotebookPen, Trash2, Undo2 } from "lucide-react";
import type { CategoryRecord, NoteRecord, WorkspacePrimaryView } from "../../data/notes";
import { formatDateTime, getCategorySoftStyle } from "./workspaceHelpers";
import { TagSelector } from "./TagSelector";
import type { DraftState, OverviewMetrics, TrendSummary, WorkspaceCounts } from "./workspaceTypes";

type EditorPanelProps = {
  activeView: WorkspacePrimaryView;
  selectedNote: NoteRecord | null;
  draft: DraftState | null;
  categories: CategoryRecord[];
  recentEdited: NoteRecord[];
  counts: WorkspaceCounts;
  trend: TrendSummary;
  metrics: OverviewMetrics;
  onSelectRecent: (note: NoteRecord) => void;
  onDraftPatch: (patch: Partial<DraftState>) => void;
  onToggleDraftTag: (id: string) => void;
  onSave: () => void;
  onMoveToTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onDeleteForever: (id: string) => void;
};

export function EditorPanel({
  activeView,
  selectedNote,
  draft,
  categories,
  recentEdited,
  counts,
  trend,
  metrics,
  onSelectRecent,
  onDraftPatch,
  onToggleDraftTag,
  onSave,
  onMoveToTrash,
  onRestore,
  onDeleteForever,
}: EditorPanelProps) {
  if (activeView === "overview") {
    return (
      <section className="workspace-column notes-editor-panel">
        <header className="notes-panel-header">
          <div>
            <p className="notes-panel-title">概览详情</p>
            <p className="notes-panel-subtitle">右栏展示近期动态与趋势提示。</p>
          </div>
        </header>

        <div className="notes-editor-scroll notes-overview-right">
          <article className={`notes-overview-trend ${trend.delta >= 0 ? "positive" : "negative"}`}>
            <p>趋势提醒</p>
            <strong>{trend.label}</strong>
          </article>

          <div className="notes-overview-summary-tiles">
            <article>
              <span>全部笔记</span>
              <strong>{counts.all}</strong>
            </article>
            <article>
              <span>活跃分类</span>
              <strong>{metrics.activeCategoryCount}</strong>
            </article>
            <article>
              <span>未分类</span>
              <strong>{metrics.uncategorizedCount}</strong>
            </article>
            <article>
              <span>最活跃</span>
              <strong>{metrics.topCategoryName}</strong>
            </article>
          </div>

          <article className="notes-overview-recent">
            <div className="notes-overview-recent__head">
              <p>最近编辑</p>
              <span>{recentEdited.length} 条</span>
            </div>

            <div className="notes-overview-recent__list">
              {recentEdited.slice(0, 8).map((note) => (
                <button key={note.id} type="button" onClick={() => onSelectRecent(note)}>
                  <span>{note.title}</span>
                  <small>{formatDateTime(note.updatedAt)}</small>
                </button>
              ))}
            </div>
          </article>
        </div>
      </section>
    );
  }

  if (!selectedNote || !draft) {
    return (
      <section className="workspace-column notes-editor-panel">
        <header className="notes-panel-header">
          <div>
            <p className="notes-panel-title">Editor</p>
            <p className="notes-panel-subtitle">右栏是主编辑区，选择一条笔记后即可编辑。</p>
          </div>
        </header>

        <div className="notes-editor-scroll">
          <div className="notes-empty-state editor-empty">
            <h3>编辑器已就绪</h3>
            <p>请在中栏选择笔记，右栏将立即切换为可编辑详情。</p>
          </div>
        </div>
      </section>
    );
  }

  if (selectedNote.deleted) {
    return (
      <section className="workspace-column notes-editor-panel">
        <header className="notes-panel-header">
          <div>
            <p className="notes-panel-title">回收站笔记</p>
            <p className="notes-panel-subtitle">可恢复或永久删除。</p>
          </div>
        </header>

        <div className="notes-editor-scroll">
          <article className="notes-deleted-preview">
            <h3>{selectedNote.title}</h3>
            <p>{selectedNote.content}</p>
            <div className="notes-meta-grid">
              <span>创建于 {formatDateTime(selectedNote.createdAt)}</span>
              <span>更新于 {formatDateTime(selectedNote.updatedAt)}</span>
            </div>
          </article>

          <div className="notes-editor-actions">
            <button type="button" className="notes-btn notes-btn-secondary" onClick={() => onRestore(selectedNote.id)}>
              <Undo2 className="h-4 w-4" />
              还原笔记
            </button>
            <button
              type="button"
              className="notes-btn notes-btn-danger"
              onClick={() => onDeleteForever(selectedNote.id)}
            >
              <Trash2 className="h-4 w-4" />
              永久删除
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-column notes-editor-panel">
      <header className="notes-panel-header editor-head">
        <div>
          <p className="notes-panel-title">Editor</p>
          <p className="notes-panel-subtitle">编辑当前笔记内容并手动保存。</p>
        </div>

        <div className="notes-editor-actions inline">
          <button type="button" className="notes-btn notes-btn-primary" onClick={onSave}>
            <Check className="h-4 w-4" />
            保存
          </button>
          <button
            type="button"
            className="notes-btn notes-btn-danger"
            onClick={() => onMoveToTrash(selectedNote.id)}
          >
            <Trash2 className="h-4 w-4" />
            移入回收站
          </button>
        </div>
      </header>

      <div className="notes-editor-scroll">
        <label className="notes-field-block">
          <span>标题</span>
          <input
            type="text"
            className="notes-field"
            value={draft.title}
            onChange={(event) => onDraftPatch({ title: event.target.value })}
            placeholder="输入笔记标题"
          />
        </label>

        <div className="notes-field-block">
          <span>分类标签（多选）</span>
          <TagSelector categories={categories} tags={draft.tags} onToggle={onToggleDraftTag} />
        </div>

        <label className="notes-field-block notes-field-block--grow">
          <span>正文</span>
          <textarea
            className="notes-field notes-field--textarea"
            value={draft.content}
            onChange={(event) => onDraftPatch({ content: event.target.value })}
            placeholder="写下这条笔记..."
          />
        </label>

        <div className="notes-meta-grid">
          <span>创建于 {formatDateTime(selectedNote.createdAt)}</span>
          <span>最近更新 {formatDateTime(selectedNote.updatedAt)}</span>
        </div>

        <div className="notes-tag-hint">
          {draft.tags.length > 0
            ? draft.tags.map((tagId) => {
                const category = categories.find((item) => item.id === tagId);
                if (!category) return null;
                return (
                  <span key={tagId} style={getCategorySoftStyle(category.color)}>
                    {category.name}
                  </span>
                );
              })
            : [<span key="empty">当前未设置分类</span>]}
        </div>

        <button type="button" className="notes-btn notes-btn-secondary sticky-save" onClick={onSave}>
          <NotebookPen className="h-4 w-4" />
          保存这条笔记
        </button>
      </div>
    </section>
  );
}
