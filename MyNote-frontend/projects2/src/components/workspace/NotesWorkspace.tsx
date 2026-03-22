import { NotebookPen, Search, Settings2, UserCircle2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CategoryRecord, NoteRecord, WorkspacePrimaryView } from "../../data/notes";
import {
  createCategory as createCategoryRequest,
  createNote as createNoteRequest,
  deleteCategoryById,
  deleteNoteById,
  listCategories,
  listNotes,
  updateCategory as updateCategoryRequest,
  updateNote as updateNoteRequest,
} from "../../utils/api";
import { getErrorMessage } from "../../utils/request";
import { EditorPanel } from "./EditorPanel";
import { NotesListPanel } from "./NotesListPanel";
import { OverviewPanel } from "./OverviewPanel";
import { Sidebar } from "./Sidebar";
import { TagSelector } from "./TagSelector";
import { normalizeText } from "./workspaceHelpers";
import type {
  CategoryWithCount,
  DraftState,
  OverviewMetrics,
  PrimaryView,
  SortMode,
  TimeFilter,
  TrendSummary,
  WorkspaceCounts,
} from "./workspaceTypes";

type NotesWorkspaceProps = {
  userName: string;
  onSignOut?: () => void | Promise<void>;
};

type LoadWorkspaceOptions = {
  showLoader?: boolean;
  trashIds?: string[];
};

type TrashIdUpdater = string[] | ((previous: string[]) => string[]);

const EMPTY_DRAFT: DraftState = {
  title: "",
  content: "",
  tags: [],
};

const recentWindowMs = 7 * 24 * 60 * 60 * 1000;
const TRASH_STORAGE_KEY = "mynote.workspace.pending-trash";

const normalizeIdList = (ids: string[]) => Array.from(new Set(ids));

const areIdListsEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((id, index) => id === right[index]);

const readPendingTrashIds = () => {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(TRASH_STORAGE_KEY);
    if (!raw) {
      return [] as string[];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as string[];
    }

    return normalizeIdList(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return [] as string[];
  }
};

const writePendingTrashIds = (ids: string[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(normalizeIdList(ids)));
};

const haveSameTags = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((value, index) => value === sortedRight[index]);
};

export function NotesWorkspace({ userName, onSignOut }: NotesWorkspaceProps) {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [pendingTrashIds, setPendingTrashIds] = useState<string[]>(() => readPendingTrashIds());
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<WorkspacePrimaryView>("all");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("updatedDesc");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editorDraft, setEditorDraft] = useState<DraftState | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<DraftState>(EMPTY_DRAFT);

  const syncPendingTrashIds = (nextValue: TrashIdUpdater) => {
    setPendingTrashIds((previous) => {
      const nextIds = normalizeIdList(typeof nextValue === "function" ? nextValue(previous) : nextValue);
      writePendingTrashIds(nextIds);
      return nextIds;
    });
  };

  const loadWorkspaceData = async ({ showLoader = true, trashIds = pendingTrashIds }: LoadWorkspaceOptions = {}) => {
    const normalizedTrashIds = normalizeIdList(trashIds);

    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const [nextCategories, nextNotes] = await Promise.all([
        listCategories(),
        listNotes(new Set(normalizedTrashIds)),
      ]);

      const validTrashIds = normalizedTrashIds.filter((id) => nextNotes.some((note) => note.id === id));
      if (!areIdListsEqual(validTrashIds, pendingTrashIds)) {
        syncPendingTrashIds(validTrashIds);
      }

      setCategories(nextCategories);
      setNotes(nextNotes);
      setWorkspaceError(null);

      return { nextCategories, nextNotes };
    } catch (error) {
      const message = getErrorMessage(error, "加载工作台数据失败，请检查后端服务是否可用。");
      setWorkspaceError(message);
      throw error;
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadWorkspaceData({ showLoader: true, trashIds: pendingTrashIds }).catch(() => undefined);
  }, []);

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const liveNotes = useMemo(() => notes.filter((note) => !note.deleted), [notes]);
  const trashNotes = useMemo(() => notes.filter((note) => note.deleted), [notes]);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  useEffect(() => {
    if (!selectedNoteId) return;
    const stillExists = notes.some((note) => note.id === selectedNoteId);
    if (!stillExists) {
      setSelectedNoteId(null);
      setEditorDraft(null);
    }
  }, [notes, selectedNoteId]);

  useEffect(() => {
    if (activeView === "category" && activeCategoryId && !categoryMap.has(activeCategoryId)) {
      setActiveView("all");
      setActiveCategoryId(null);
    }
  }, [activeCategoryId, activeView, categoryMap]);

  const sanitizeTags = (tags: string[]) => Array.from(new Set(tags)).filter((id) => categoryMap.has(id));

  const counts = useMemo<WorkspaceCounts>(() => {
    const now = Date.now();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return {
      all: liveNotes.length,
      recent: liveNotes.filter((note) => now - new Date(note.updatedAt).getTime() <= recentWindowMs).length,
      trash: trashNotes.length,
      today: liveNotes.filter((note) => new Date(note.updatedAt).getTime() >= start.getTime()).length,
    };
  }, [liveNotes, trashNotes]);

  const categoryStats = useMemo<CategoryWithCount[]>(
    () =>
      categories.map((category) => ({
        ...category,
        count: liveNotes.filter((note) => note.tags.includes(category.id)).length,
      })),
    [categories, liveNotes],
  );

  const trend = useMemo<TrendSummary>(() => {
    const now = Date.now();
    const current = liveNotes.filter((note) => now - +new Date(note.updatedAt) <= recentWindowMs).length;
    const previous = liveNotes.filter((note) => {
      const age = now - +new Date(note.updatedAt);
      return age > recentWindowMs && age <= recentWindowMs * 2;
    }).length;

    const delta = current - previous;
    const percent = previous === 0 ? (current > 0 ? 100 : 0) : Math.round((delta / previous) * 100);

    return {
      delta,
      label: `${delta >= 0 ? "提升" : "下降"} ${Math.abs(percent)}%`,
    };
  }, [liveNotes]);

  const overviewMetrics = useMemo<OverviewMetrics>(() => {
    const activeCategoryCount = categoryStats.filter((category) => category.count > 0).length;
    const uncategorizedCount = liveNotes.filter((note) => note.tags.length === 0).length;
    const topCategory = [...categoryStats].sort((a, b) => b.count - a.count)[0];

    return {
      activeCategoryCount,
      uncategorizedCount,
      topCategoryName: topCategory && topCategory.count > 0 ? topCategory.name : "暂无",
    };
  }, [categoryStats, liveNotes]);

  const recentEdited = useMemo(
    () => [...liveNotes].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [liveNotes],
  );

  const filteredNotes = useMemo(() => {
    const now = Date.now();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    let list: NoteRecord[];
    if (activeView === "all") {
      list = liveNotes;
    } else if (activeView === "recent") {
      list = liveNotes.filter((note) => now - +new Date(note.updatedAt) <= recentWindowMs);
    } else if (activeView === "trash") {
      list = trashNotes;
    } else if (activeView === "category" && activeCategoryId) {
      list = liveNotes.filter((note) => note.tags.includes(activeCategoryId));
    } else {
      list = liveNotes;
    }

    const keyword = normalizeText(searchText).toLowerCase();
    if (keyword) {
      list = list.filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(keyword));
    }

    if (timeFilter === "today") {
      list = list.filter((note) => +new Date(note.updatedAt) >= start.getTime());
    }

    if (timeFilter === "sevenDays") {
      list = list.filter((note) => now - +new Date(note.updatedAt) <= recentWindowMs);
    }

    const sorted = [...list];
    sorted.sort((left, right) => {
      if (sortMode === "updatedAsc") return +new Date(left.updatedAt) - +new Date(right.updatedAt);
      if (sortMode === "createdDesc") return +new Date(right.createdAt) - +new Date(left.createdAt);
      return +new Date(right.updatedAt) - +new Date(left.updatedAt);
    });

    return sorted;
  }, [activeCategoryId, activeView, liveNotes, searchText, sortMode, timeFilter, trashNotes]);

  const viewTitle =
    activeView === "all"
      ? "全部笔记"
      : activeView === "recent"
        ? "最近编辑"
        : activeView === "trash"
          ? "回收站"
          : activeView === "category"
            ? categoryMap.get(activeCategoryId ?? "")?.name ?? "分类笔记"
            : "全部笔记";

  const viewDescription =
    activeView === "all"
      ? "按搜索、排序与筛选快速定位你的笔记。"
      : activeView === "recent"
        ? "聚焦最近 7 天更新内容。"
        : activeView === "trash"
          ? "这里的笔记仅在前端暂存，确认永久删除后才会真正调用后端删除。"
          : activeView === "category"
            ? `当前分类：${categoryMap.get(activeCategoryId ?? "")?.name ?? "未命名分类"}`
            : "";

  const selectNote = (note: NoteRecord) => {
    setSelectedNoteId(note.id);
    setEditorDraft({
      title: note.title,
      content: note.content,
      tags: sanitizeTags(note.tags),
    });
  };

  const navigate = (view: PrimaryView) => {
    setActiveView(view);
    setActiveCategoryId(null);
  };

  const selectCategory = (id: string) => {
    setActiveView("category");
    setActiveCategoryId(id);
  };

  const addCategory = async (name: string) => {
    const normalized = normalizeText(name);
    if (!normalized) return false;

    const duplicated = categories.find(
      (category) => category.name.toLowerCase() === normalized.toLowerCase(),
    );
    if (duplicated) {
      setActiveView("category");
      setActiveCategoryId(duplicated.id);
      return true;
    }

    try {
      await createCategoryRequest(normalized);
      const { nextCategories } = await loadWorkspaceData({ showLoader: false, trashIds: pendingTrashIds });
      const newCategory = nextCategories.find((category) => category.name.toLowerCase() === normalized.toLowerCase());
      if (newCategory) {
        setActiveView("category");
        setActiveCategoryId(newCategory.id);
      }
      return true;
    } catch (error) {
      const message = getErrorMessage(error, "创建分类失败，请稍后重试。");
      setWorkspaceError(message);
      alert(message);
      return false;
    }
  };

  const renameCategory = async (id: string, name: string) => {
    const normalized = normalizeText(name);
    if (!normalized) return false;

    const duplicated = categories.find(
      (category) => category.id !== id && category.name.toLowerCase() === normalized.toLowerCase(),
    );

    if (duplicated) {
      setActiveView("category");
      setActiveCategoryId(duplicated.id);
      return true;
    }

    try {
      await updateCategoryRequest(id, normalized);
      setCategories((previous) =>
        previous.map((category) => (category.id === id ? { ...category, name: normalized } : category)),
      );
      setWorkspaceError(null);
      return true;
    } catch (error) {
      const message = getErrorMessage(error, "重命名分类失败，请稍后重试。");
      setWorkspaceError(message);
      alert(message);
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    const affectedNotes = notes.filter((note) => note.tags.includes(id));

    try {
      await deleteCategoryById(id);

      if (affectedNotes.length > 0) {
        await Promise.all(
          affectedNotes.map((note) =>
            updateNoteRequest({
              ...note,
              tags: note.tags.filter((tagId) => tagId !== id),
            }),
          ),
        );
      }

      await loadWorkspaceData({ showLoader: false, trashIds: pendingTrashIds });

      setCreateDraft((previous) => ({
        ...previous,
        tags: previous.tags.filter((tagId) => tagId !== id),
      }));

      setEditorDraft((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          tags: previous.tags.filter((tagId) => tagId !== id),
        };
      });

      if (activeView === "category" && activeCategoryId === id) {
        setActiveView("all");
        setActiveCategoryId(null);
      }
    } catch (error) {
      const message = getErrorMessage(error, "删除分类失败，请稍后重试。");
      setWorkspaceError(message);
      alert(message);
      void loadWorkspaceData({ showLoader: false, trashIds: pendingTrashIds }).catch(() => undefined);
    }
  };

  const openCreateModal = () => {
    const presetTags = activeView === "category" && activeCategoryId ? [activeCategoryId] : [];
    setCreateDraft({
      title: "",
      content: "",
      tags: presetTags,
    });
    setIsCreateModalOpen(true);
  };

  const toggleCreateTag = (id: string) => {
    setCreateDraft((previous) => ({
      ...previous,
      tags: previous.tags.includes(id)
        ? previous.tags.filter((tagId) => tagId !== id)
        : [...previous.tags, id],
    }));
  };

  const createNote = async () => {
    const title = normalizeText(createDraft.title) || "未命名笔记";
    const content = createDraft.content.trim() || "（暂无内容）";
    const tags = sanitizeTags(createDraft.tags);

    try {
      await createNoteRequest({ title, content, tags });
      const { nextNotes } = await loadWorkspaceData({ showLoader: false, trashIds: pendingTrashIds });
      const createdNote =
        [...nextNotes]
          .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
          .find((note) => !note.deleted && note.title === title && note.content === content && haveSameTags(note.tags, tags)) ??
        nextNotes.find((note) => !note.deleted) ??
        null;

      setActiveView("all");
      setActiveCategoryId(null);
      setIsCreateModalOpen(false);
      setCreateDraft(EMPTY_DRAFT);

      if (createdNote) {
        selectNote(createdNote);
      }
    } catch (error) {
      const message = getErrorMessage(error, "创建笔记失败，请稍后重试。");
      setWorkspaceError(message);
      alert(message);
    }
  };

  const onDraftPatch = (patch: Partial<DraftState>) => {
    setEditorDraft((previous) => (previous ? { ...previous, ...patch } : previous));
  };

  const toggleDraftTag = (id: string) => {
    setEditorDraft((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        tags: previous.tags.includes(id)
          ? previous.tags.filter((tagId) => tagId !== id)
          : [...previous.tags, id],
      };
    });
  };

  const saveDraft = async () => {
    if (!selectedNote || !editorDraft || selectedNote.deleted) return;

    const now = new Date().toISOString();
    const title = normalizeText(editorDraft.title) || "未命名笔记";
    const content = editorDraft.content.trim() || "（暂无内容）";
    const tags = sanitizeTags(editorDraft.tags);

    try {
      await updateNoteRequest({
        ...selectedNote,
        title,
        content,
        tags,
      });

      setNotes((previous) =>
        previous.map((note) =>
          note.id === selectedNote.id
            ? {
                ...note,
                title,
                content,
                tags,
                updatedAt: now,
                deleted: false,
              }
            : note,
        ),
      );

      setEditorDraft({
        title,
        content,
        tags,
      });

      setWorkspaceError(null);
    } catch (error) {
      const message = getErrorMessage(error, "保存笔记失败，请稍后重试。");
      setWorkspaceError(message);
      alert(message);
    }
  };

  const moveToTrash = (id: string) => {
    syncPendingTrashIds((previous) => (previous.includes(id) ? previous : [id, ...previous]));
    setNotes((previous) =>
      previous.map((note) =>
        note.id === id
          ? {
              ...note,
              deleted: true,
            }
          : note,
      ),
    );
  };

  const restore = (id: string) => {
    syncPendingTrashIds((previous) => previous.filter((item) => item !== id));
    setNotes((previous) =>
      previous.map((note) =>
        note.id === id
          ? {
              ...note,
              deleted: false,
            }
          : note,
      ),
    );

    if (activeView === "trash" && selectedNoteId === id) {
      setSelectedNoteId(null);
      setEditorDraft(null);
    }
  };

  const deleteForever = async (id: string) => {
    try {
      await deleteNoteById(id);
      syncPendingTrashIds((previous) => previous.filter((item) => item !== id));
      setNotes((previous) => previous.filter((note) => note.id !== id));
      setWorkspaceError(null);

      if (selectedNoteId === id) {
        setSelectedNoteId(null);
        setEditorDraft(null);
      }
    } catch (error) {
      const message = getErrorMessage(error, "删除笔记失败，请稍后重试。");
      setWorkspaceError(message);
      alert(message);
    }
  };

  if (isLoading) {
    return (
      <section className="notes-workspace">
        <div className="notes-workspace-main">
          <div className="workspace-column notes-editor-panel">
            <div className="notes-editor-scroll">
              <div className="notes-empty-state editor-empty">
                <h3>工作台加载中</h3>
                <p>正在同步分类与笔记数据...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (workspaceError && categories.length === 0 && notes.length === 0) {
    return (
      <section className="notes-workspace">
        <div className="notes-workspace-main">
          <div className="workspace-column notes-editor-panel">
            <div className="notes-editor-scroll">
              <div className="notes-empty-state editor-empty">
                <h3>暂时无法连接工作台</h3>
                <p>{workspaceError}</p>
                <button
                  type="button"
                  className="notes-btn notes-btn-primary"
                  onClick={() => void loadWorkspaceData({ showLoader: true, trashIds: pendingTrashIds }).catch(() => undefined)}
                >
                  重新加载
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="notes-workspace">
      <header className="notes-workspace-header">
        <div className="notes-workspace-header__title">
          <p>MyNote Workspace</p>
          <h1>三栏笔记工作台</h1>
          {workspaceError ? <p className="notes-panel-subtitle">{workspaceError}</p> : null}
        </div>

        <div className="notes-workspace-header__actions">
          <button type="button" className="notes-icon-btn" aria-label="搜索入口">
            <Search className="h-4 w-4" />
          </button>
          <button type="button" className="notes-icon-btn" aria-label="设置">
            <Settings2 className="h-4 w-4" />
          </button>

          <span className="notes-user-chip">
            <UserCircle2 className="h-4 w-4" />
            <span>{userName}</span>
          </span>

          {onSignOut ? (
            <button type="button" className="notes-btn notes-btn-secondary" onClick={() => void onSignOut?.()}>
              退出登录
            </button>
          ) : null}
        </div>
      </header>

      <div className="notes-workspace-main">
        <Sidebar
          userName={userName}
          activeView={activeView}
          activeCategoryId={activeCategoryId}
          counts={counts}
          categories={categoryStats}
          onNavigate={navigate}
          onSelectCategory={selectCategory}
          onAddCategory={addCategory}
          onRenameCategory={renameCategory}
          onDeleteCategory={deleteCategory}
        />

        {activeView === "overview" ? (
          <OverviewPanel
            counts={counts}
            metrics={overviewMetrics}
            trend={trend}
            categoryStats={categoryStats}
          />
        ) : (
          <NotesListPanel
            title={viewTitle}
            description={viewDescription}
            notes={filteredNotes}
            selectedNoteId={selectedNoteId}
            categoryMap={categoryMap}
            searchText={searchText}
            sortMode={sortMode}
            timeFilter={timeFilter}
            onSearchTextChange={setSearchText}
            onSortModeChange={setSortMode}
            onTimeFilterChange={setTimeFilter}
            onCreateNote={openCreateModal}
            onSelectNote={selectNote}
            onMoveToTrash={moveToTrash}
            onRestore={restore}
            onDeleteForever={deleteForever}
          />
        )}

        <EditorPanel
          activeView={activeView}
          selectedNote={selectedNote}
          draft={editorDraft}
          categories={categories}
          recentEdited={recentEdited}
          counts={counts}
          trend={trend}
          metrics={overviewMetrics}
          onSelectRecent={(note) => {
            setActiveView("recent");
            selectNote(note);
          }}
          onDraftPatch={onDraftPatch}
          onToggleDraftTag={toggleDraftTag}
          onSave={saveDraft}
          onMoveToTrash={moveToTrash}
          onRestore={restore}
          onDeleteForever={deleteForever}
        />
      </div>

      {isCreateModalOpen ? (
        <div className="notes-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="notes-modal" onClick={(event) => event.stopPropagation()}>
            <div className="notes-modal__head">
              <h2>新建笔记</h2>
              <button type="button" className="notes-icon-btn" onClick={() => setIsCreateModalOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="notes-field-block">
              <span>标题</span>
              <input
                type="text"
                className="notes-field"
                value={createDraft.title}
                onChange={(event) =>
                  setCreateDraft((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
                placeholder="输入笔记标题"
              />
            </label>

            <div className="notes-field-block">
              <span>分类标签（多选）</span>
              <TagSelector categories={categories} tags={createDraft.tags} onToggle={toggleCreateTag} />
            </div>

            <label className="notes-field-block">
              <span>内容</span>
              <textarea
                className="notes-field notes-field--textarea create"
                value={createDraft.content}
                onChange={(event) =>
                  setCreateDraft((previous) => ({
                    ...previous,
                    content: event.target.value,
                  }))
                }
                placeholder="写下这条笔记的内容..."
              />
            </label>

            <div className="notes-modal__actions">
              <button
                type="button"
                className="notes-btn notes-btn-secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                取消
              </button>
              <button type="button" className="notes-btn notes-btn-primary" onClick={() => void createNote()}>
                <NotebookPen className="h-4 w-4" />
                创建笔记
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
