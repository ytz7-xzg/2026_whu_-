import {
  Archive,
  BarChart3,
  CalendarClock,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { WorkspacePrimaryView } from "../../data/notes";
import { getCategoryDotStyle, normalizeText } from "./workspaceHelpers";
import type { CategoryWithCount, PrimaryView, WorkspaceCounts } from "./workspaceTypes";

type SidebarProps = {
  userName: string;
  activeView: WorkspacePrimaryView;
  activeCategoryId: string | null;
  counts: WorkspaceCounts;
  categories: CategoryWithCount[];
  onNavigate: (view: PrimaryView) => void;
  onSelectCategory: (id: string) => void;
  onAddCategory: (name: string) => boolean | Promise<boolean>;
  onRenameCategory: (id: string, name: string) => boolean | Promise<boolean>;
  onDeleteCategory: (id: string) => void | Promise<void>;
};

const navItems: Array<{ key: PrimaryView; label: string; icon: typeof LayoutGrid }> = [
  { key: "overview", label: "概览", icon: BarChart3 },
  { key: "all", label: "全部笔记", icon: LayoutGrid },
  { key: "recent", label: "最近编辑", icon: CalendarClock },
  { key: "trash", label: "回收站", icon: Archive },
];

const countByView = (view: PrimaryView, counts: WorkspaceCounts) => {
  if (view === "all") return counts.all;
  if (view === "recent") return counts.recent;
  if (view === "trash") return counts.trash;
  return null;
};

export function Sidebar({
  userName,
  activeView,
  activeCategoryId,
  counts,
  categories,
  onNavigate,
  onSelectCategory,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: SidebarProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const submitCreateCategory = async () => {
    const name = normalizeText(newCategoryName);
    if (!name) return;
    if (await onAddCategory(name)) {
      setNewCategoryName("");
      setIsAddingCategory(false);
    }
  };

  const submitRename = async (id: string) => {
    const name = normalizeText(renameValue);
    if (!name) {
      setRenamingId(null);
      setRenameValue("");
      return;
    }

    if (await onRenameCategory(id, name)) {
      setRenamingId(null);
      setRenameValue("");
      setMenuOpenId(null);
    }
  };

  return (
    <aside className="workspace-column notes-sidebar">
      <div className="notes-sidebar__scroll">
        <section className="notes-sidebar__brand">
          <div className="notes-sidebar__logo">M</div>
          <div>
            <p className="notes-sidebar__brand-name">MyNote</p>
            <p className="notes-sidebar__brand-subtitle">欢迎回来，{userName}</p>
          </div>
        </section>

        <section className="notes-sidebar__section">
          <p className="notes-sidebar__section-title">导航</p>
          <nav className="notes-sidebar__nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const count = countByView(item.key, counts);
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`notes-nav-item ${activeView === item.key ? "is-active" : ""}`}
                  onClick={() => {
                    setMenuOpenId(null);
                    setRenamingId(null);
                    onNavigate(item.key);
                  }}
                >
                  <span className="notes-nav-item__main">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {count !== null ? <span className="notes-nav-item__count">{count}</span> : null}
                </button>
              );
            })}
          </nav>
        </section>

        <section className="notes-sidebar__section">
          <div className="notes-sidebar__section-head">
            <p className="notes-sidebar__section-title">分类管理</p>
            <button
              type="button"
              className="notes-icon-btn"
              onClick={() => {
                setIsAddingCategory(true);
                setMenuOpenId(null);
                setRenamingId(null);
              }}
              aria-label="新增分类"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="notes-category-list">
            {categories.map((category) => {
              const isActive = activeView === "category" && activeCategoryId === category.id;
              const isRenaming = renamingId === category.id;
              const menuOpen = menuOpenId === category.id;
              return (
                <div key={category.id} className={`notes-category-row ${isActive ? "is-active" : ""}`}>
                  {isRenaming ? (
                    <div className="notes-category-rename">
                      <input
                        type="text"
                        className="notes-inline-input"
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") void submitRename(category.id);
                          if (event.key === "Escape") {
                            setRenamingId(null);
                            setRenameValue("");
                          }
                        }}
                        autoFocus
                      />
                      <div className="notes-inline-actions">
                        <button
                          type="button"
                          className="notes-mini-btn"
                          onClick={() => void submitRename(category.id)}
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          className="notes-mini-btn ghost"
                          onClick={() => {
                            setRenamingId(null);
                            setRenameValue("");
                          }}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="notes-category-main"
                        onClick={() => {
                          setMenuOpenId(null);
                          onSelectCategory(category.id);
                        }}
                      >
                        <span className="notes-color-dot" style={getCategoryDotStyle(category.color)} />
                        <span className="notes-category-name">{category.name}</span>
                        <span className="notes-category-count">{category.count}</span>
                      </button>

                      <div className="notes-category-actions">
                        <button
                          type="button"
                          className="notes-icon-btn small"
                          onClick={() => setMenuOpenId((prev) => (prev === category.id ? null : category.id))}
                          aria-label="分类操作"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {menuOpen ? (
                          <div className="notes-category-menu">
                            <button
                              type="button"
                              onClick={() => {
                                setRenamingId(category.id);
                                setRenameValue(category.name);
                                setMenuOpenId(null);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              重命名
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => {
                                const confirmed = window.confirm(
                                  `删除分类“${category.name}”后，会从所有笔记中移除该标签。是否继续？`,
                                );
                                if (confirmed) {
                                  void onDeleteCategory(category.id);
                                  setMenuOpenId(null);
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              删除
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {isAddingCategory ? (
              <div className="notes-category-create">
                <input
                  type="text"
                  className="notes-inline-input"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void submitCreateCategory();
                    if (event.key === "Escape") {
                      setIsAddingCategory(false);
                      setNewCategoryName("");
                    }
                  }}
                  placeholder="输入分类名称"
                  autoFocus
                />
                <div className="notes-inline-actions">
                  <button type="button" className="notes-mini-btn" onClick={() => void submitCreateCategory()}>
                    添加
                  </button>
                  <button
                    type="button"
                    className="notes-mini-btn ghost"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName("");
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="notes-add-category"
                onClick={() => {
                  setIsAddingCategory(true);
                  setMenuOpenId(null);
                  setRenamingId(null);
                }}
              >
                <Plus className="h-4 w-4" />
                新增分类
              </button>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
