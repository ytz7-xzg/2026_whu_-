import type { CategoryWithCount, OverviewMetrics, TrendSummary, WorkspaceCounts } from "./workspaceTypes";
import { categoryPalette } from "./workspaceHelpers";

type OverviewPanelProps = {
  counts: WorkspaceCounts;
  metrics: OverviewMetrics;
  trend: TrendSummary;
  categoryStats: CategoryWithCount[];
};

export function OverviewPanel({ counts, metrics, trend, categoryStats }: OverviewPanelProps) {
  const maxCount = Math.max(1, ...categoryStats.map((category) => category.count));

  return (
    <section className="workspace-column notes-overview-panel">
      <header className="notes-panel-header">
        <div>
          <p className="notes-panel-title">概览</p>
          <p className="notes-panel-subtitle">概览是一个 view，不再作为首屏主舞台。</p>
        </div>
      </header>

      <div className="notes-overview-scroll">
        <div className="notes-overview-grid">
          <article className="notes-overview-stat">
            <p>全部笔记</p>
            <strong>{counts.all}</strong>
          </article>
          <article className="notes-overview-stat">
            <p>今日更新</p>
            <strong>{counts.today}</strong>
          </article>
          <article className="notes-overview-stat">
            <p>活跃分类</p>
            <strong>{metrics.activeCategoryCount}</strong>
          </article>
          <article className="notes-overview-stat">
            <p>回收站</p>
            <strong>{counts.trash}</strong>
          </article>
        </div>

        <article className={`notes-overview-trend ${trend.delta >= 0 ? "positive" : "negative"}`}>
          <p>最近 7 天趋势</p>
          <strong>{trend.label}</strong>
        </article>

        <article className="notes-overview-stat-group">
          <p className="notes-overview-stat-group__title">关键摘要</p>
          <div className="notes-overview-stat-group__items">
            <div>
              <span>最活跃分类</span>
              <strong>{metrics.topCategoryName}</strong>
            </div>
            <div>
              <span>未分类笔记</span>
              <strong>{metrics.uncategorizedCount}</strong>
            </div>
            <div>
              <span>最近编辑</span>
              <strong>{counts.recent}</strong>
            </div>
          </div>
        </article>

        <article className="notes-overview-bars">
          <p className="notes-overview-bars__title">分类分布</p>
          <div className="notes-overview-bars__list">
            {categoryStats.map((category) => {
              const width = category.count === 0 ? 6 : Math.max(10, (category.count / maxCount) * 100);
              return (
                <div key={category.id} className="notes-overview-bar-row">
                  <span className="notes-overview-bar-row__name">{category.name}</span>
                  <div className="notes-overview-bar-row__track">
                    <span
                      className="notes-overview-bar-row__fill"
                      style={{
                        width: `${width}%`,
                        background: categoryPalette[category.color].bar,
                      }}
                    />
                  </div>
                  <span className="notes-overview-bar-row__count">{category.count}</span>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
