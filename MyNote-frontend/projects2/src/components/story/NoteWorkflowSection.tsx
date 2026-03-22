import { Edit3, FileEdit, List } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function NoteWorkflowSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 20%"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [24, -28]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [70, -55]);
  const sceneOpacity = useTransform(scrollYProgress, [0.03, 0.2, 0.78], [0, 1, 1]);
  const floatingA = useTransform(scrollYProgress, [0, 1], [52, -86]);
  const floatingB = useTransform(scrollYProgress, [0, 1], [60, -68]);
  const entryEase = [0.22, 1, 0.36, 1] as const;

  return (
    <section id="chapter-workflow" ref={sectionRef} className="relative min-h-[106vh] px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[24%] left-[10%] h-64 w-64 rounded-full bg-indigo-300/20 blur-[80px]" />
        <div className="absolute right-[5%] bottom-[18%] h-72 w-72 rounded-full bg-cyan-300/20 blur-[90px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div style={{ y: titleY }} className="space-y-6">
          <p className="text-sm tracking-[0.22em] text-slate-500 uppercase">Chapter 1</p>
          <h2 className="text-[clamp(2.2rem,4.7vw,4rem)] leading-[1.12] font-semibold text-slate-900">
            笔记工作流
            <span className="block text-slate-500">从记录到迭代，一气呵成</span>
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-slate-600">
            用一个连续场景讲清“笔记列表 → 创建笔记 → 编辑笔记”。信息结构保持清晰，交互路径自然串联，
            在轻盈的玻璃层级中完成完整的内容生命周期。
          </p>
        </motion.div>

        <motion.div style={{ y: sceneY, opacity: sceneOpacity }} className="relative h-[580px]">
          <motion.div
            style={{ y: useTransform(scrollYProgress, [0, 1], [65, -45]) }}
            className="absolute inset-x-4 top-16 rounded-[36px] border border-white/65 bg-white/50 p-8 shadow-[0_35px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
          >
            <div className="mb-5 flex items-center gap-3 text-slate-700">
              <List className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium tracking-wide uppercase">笔记列表</span>
            </div>
            <div className="space-y-3">
              {["项目范围澄清", "竞品记录与洞察", "迭代计划（v2）", "用户访谈摘要"].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/65 px-4 py-3"
                  style={{ opacity: 1 - index * 0.08 }}
                >
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                  <span className="text-xs text-slate-400">更新于 2h 前</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16, y: 14 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ amount: 0.15, margin: "0px 0px -10% 0px", once: false }}
            transition={{ duration: 0.8, ease: entryEase, delay: 0.05 }}
            className="absolute top-1 -left-6 md:-left-7"
          >
            <motion.div
              style={{ y: floatingA }}
              className="w-64 rounded-3xl border border-emerald-100/80 bg-white/70 p-5 shadow-[0_18px_45px_rgba(16,185,129,0.18)] backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center gap-2 text-emerald-600">
                <Edit3 className="h-4 w-4" />
                <span className="text-sm font-semibold">创建笔记</span>
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="rounded-xl bg-white/70 px-3 py-2">标题：版本发布说明</div>
                <div className="rounded-xl bg-white/70 px-3 py-2">分类：产品 / 研发</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -16, y: -14 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ amount: 0.15, margin: "0px 0px -10% 0px", once: false }}
            transition={{ duration: 0.82, ease: entryEase, delay: 0.12 }}
            className="absolute top-[22.5rem] -right-6 md:-right-7"
          >
            <motion.div
              style={{ y: floatingB }}
              className="w-72 rounded-3xl border border-amber-100/80 bg-white/72 p-6 shadow-[0_20px_50px_rgba(245,158,11,0.18)] backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center gap-2 text-amber-600">
                <FileEdit className="h-4 w-4" />
                <span className="text-sm font-semibold">编辑笔记</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p>调整标题、分类与正文后保存</p>
                <p className="text-xs text-slate-400">系统自动刷新最后更新时间</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
