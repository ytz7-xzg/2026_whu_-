import { Edit3, FileEdit, Folder, List, PieChart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Feature = {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export const coreFeatures: Feature[] = [
  {
    id: 1,
    title: "笔记列表",
    description:
      "展示笔记标题、内容、所属分类、创建时间、最后更新时间、操作（编辑/删除）。",
    icon: List,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: 2,
    title: "创建笔记",
    description: "用户输入标题、选择分类（支持多个分类）、编写正文内容，保存。",
    icon: Edit3,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    id: 3,
    title: "编辑笔记",
    description:
      "随时修改笔记的标题、分类或正文内容，保存后自动更新“最后更新时间”。",
    icon: FileEdit,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    id: 4,
    title: "分类管理",
    description:
      "支持分类的增删改查。维护分类基础信息：分类 ID、分类名称、创建时间。",
    icon: Folder,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
  },
  {
    id: 5,
    title: "数据统计",
    description:
      "按分类统计笔记数量，清晰展示分布情况（如：工作类 10 篇，生活类 5 篇）。",
    icon: PieChart,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
  },
];
