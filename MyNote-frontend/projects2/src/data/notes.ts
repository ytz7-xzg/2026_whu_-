export const CATEGORY_COLOR_TOKENS = [
  "indigo",
  "sky",
  "rose",
  "emerald",
  "amber",
  "violet",
  "cyan",
] as const;

export type CategoryColorToken = (typeof CATEGORY_COLOR_TOKENS)[number];

export type CategoryRecord = {
  id: string;
  name: string;
  color: CategoryColorToken;
};

export type WorkspacePrimaryView = "overview" | "all" | "recent" | "trash" | "category";

export type NoteRecord = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
};

export const defaultCategories: CategoryRecord[] = [
  { id: "cat-work", name: "工作", color: "indigo" },
  { id: "cat-life", name: "生活", color: "sky" },
  { id: "cat-study", name: "学习", color: "emerald" },
  { id: "cat-ideas", name: "灵感", color: "rose" },
  { id: "cat-todos", name: "待办", color: "amber" },
];

export const workspaceDescriptions = {
  overview: "查看今日节奏、分类分布和最近编辑动态。",
  all: "统一查看所有笔记，按搜索与筛选快速定位。",
  recent: "聚焦最近 7 天内更新的笔记，快速回到上下文。",
  trash: "这里存放已删除笔记，可还原或彻底清理。",
} as const;

export const mockNotes: NoteRecord[] = [
  {
    id: "note-001",
    title: "周一站会纪要：接口联调排期",
    content:
      "确认用户中心接口今日完成联调，周三开始提测。前端需要补充异常态提示，测试同学补一轮回归。",
    tags: ["cat-work", "cat-todos"],
    createdAt: "2026-03-02T09:10:00+08:00",
    updatedAt: "2026-03-06T09:25:00+08:00",
  },
  {
    id: "note-002",
    title: "三月健身计划",
    content:
      "每周三次有氧 + 两次力量，晚上 11:30 前睡觉。记录体重和睡眠质量，周末做一次总结。",
    tags: ["cat-life", "cat-todos"],
    createdAt: "2026-03-01T20:15:00+08:00",
    updatedAt: "2026-03-05T21:40:00+08:00",
  },
  {
    id: "note-003",
    title: "操作系统：进程调度复习提纲",
    content:
      "重点复习 FCFS、SJF、RR 的优缺点，对比不同场景下的响应时间与吞吐量，补充一个例题推演。",
    tags: ["cat-study", "cat-work"],
    createdAt: "2026-02-28T13:25:00+08:00",
    updatedAt: "2026-03-04T16:05:00+08:00",
  },
  {
    id: "note-004",
    title: "MyNote 工作台配色备忘",
    content:
      "主背景继续使用浅紫、浅蓝、浅粉过渡，主交互色偏靛蓝。卡片阴影减轻，信息密度提高。",
    tags: ["cat-ideas", "cat-work"],
    createdAt: "2026-03-03T10:18:00+08:00",
    updatedAt: "2026-03-06T11:10:00+08:00",
  },
  {
    id: "note-005",
    title: "本周待办清单",
    content:
      "1) 完成开放性创新实践展示页；2) 复习数据库事务；3) 整理下一阶段任务拆分；4) 提前准备答辩素材。",
    tags: ["cat-todos", "cat-study"],
    createdAt: "2026-03-04T08:05:00+08:00",
    updatedAt: "2026-03-06T08:45:00+08:00",
  },
  {
    id: "note-006",
    title: "用户访谈问题池",
    content:
      "围绕首次使用路径、搜索效率、分类习惯设计问题。控制在 20 分钟，重点收集真实痛点。",
    tags: ["cat-work"],
    createdAt: "2026-02-25T14:30:00+08:00",
    updatedAt: "2026-03-03T17:20:00+08:00",
  },
  {
    id: "note-007",
    title: "厨房补货清单",
    content:
      "牛奶、全麦面包、鸡蛋、番茄、燕麦。周末前把调味料补齐，避免临时外卖。",
    tags: ["cat-life"],
    createdAt: "2026-03-02T19:50:00+08:00",
    updatedAt: "2026-03-02T19:50:00+08:00",
  },
  {
    id: "note-008",
    title: "英语阅读摘录：产品写作",
    content:
      "优秀产品文案要让用户在 3 秒内看懂价值，再在 30 秒内看到具体收益。少形容，多动作。",
    tags: ["cat-study", "cat-ideas"],
    createdAt: "2026-02-20T11:12:00+08:00",
    updatedAt: "2026-03-01T09:36:00+08:00",
  },
  {
    id: "note-009",
    title: "灵感：沉浸式专注模式",
    content:
      "写作时隐藏侧栏，仅保留标题与正文；右上角显示专注计时。退出后自动生成本次专注摘要。",
    tags: ["cat-ideas"],
    createdAt: "2026-03-05T23:06:00+08:00",
    updatedAt: "2026-03-05T23:06:00+08:00",
  },
  {
    id: "note-010",
    title: "明日优先事项",
    content:
      "上午 10:00 完成课程作业提交；下午调试登录页与工作台切换；晚上整理会议汇报文档。",
    tags: ["cat-todos", "cat-work"],
    createdAt: "2026-03-05T18:40:00+08:00",
    updatedAt: "2026-03-06T07:55:00+08:00",
  },
  {
    id: "note-011",
    title: "临时草稿：废弃版流程",
    content:
      "这一版流程步骤过多，交互跳转不自然，先保留思路，后续回看时可对比新版。",
    tags: ["cat-work"],
    createdAt: "2026-02-18T09:32:00+08:00",
    updatedAt: "2026-02-19T10:15:00+08:00",
    deleted: true,
  },
];
