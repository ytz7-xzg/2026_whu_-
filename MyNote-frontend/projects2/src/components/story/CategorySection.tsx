import { Folder, Tag } from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const chips = ["工作", "生活", "学习", "灵感", "会议记录", "待办"];

export function CategorySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [chipsReplayKey, setChipsReplayKey] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 20%"],
  });
  const isSectionActive = useInView(sectionRef, {
    amount: 0.15,
    margin: "0px 0px -10% 0px",
  });

  const panelY = useTransform(scrollYProgress, [0, 1], [65, -52]);
  const chipsY = useTransform(scrollYProgress, [0, 1], [85, -62]);
  const textY = useTransform(scrollYProgress, [0, 1], [22, -24]);
  const opacity = useTransform(scrollYProgress, [0.03, 0.16], [0, 1]);

  useEffect(() => {
    if (isSectionActive) {
      setChipsReplayKey((prev) => prev + 1);
    }
  }, [isSectionActive]);

  return (
    <section id="chapter-category" ref={sectionRef} className="relative min-h-[102vh] px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[15%] right-[12%] h-72 w-72 rounded-full bg-violet-300/20 blur-[95px]" />
        <div className="absolute bottom-[12%] left-[12%] h-72 w-72 rounded-full bg-sky-300/20 blur-[95px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div style={{ y: panelY, opacity }} className="relative h-[530px]">
          <div className="absolute inset-0 rounded-[36px] border border-white/65 bg-white/52 shadow-[0_35px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl" />

          <div className="absolute top-8 left-8 right-8 space-y-4">
            <div className="mb-2 flex items-center gap-2 text-violet-600">
              <Folder className="h-5 w-5" />
              <span className="text-sm tracking-wide font-semibold uppercase">分类管理</span>
            </div>

            {[
              "分类 ID 自动生成并可追溯",
              "名称支持新增 / 编辑 / 删除",
              "分类创建时间统一记录",
            ].map((line) => (
              <div
                key={line}
                className="rounded-2xl border border-white/70 bg-white/68 px-4 py-3 text-sm text-slate-600"
              >
                {line}
              </div>
            ))}
          </div>

          <motion.div
            style={{ y: chipsY }}
            className="absolute -right-6 -bottom-6 grid grid-cols-2 gap-3"
          >
            {chips.map((chip, index) => (
              <motion.div
                key={`${chip}-${chipsReplayKey}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/72 px-4 py-2 text-sm text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              >
                <Tag className="h-3.5 w-3.5 text-violet-500" />
                {chip}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div style={{ y: textY }} className="space-y-6">
          <p className="text-sm tracking-[0.22em] text-slate-500 uppercase">Chapter 2</p>
          <h2 className="text-[clamp(2.1rem,4.3vw,3.8rem)] leading-[1.14] font-semibold text-slate-900">
            分类管理
            <span className="block text-slate-500">让信息有秩序，也有呼吸感</span>
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-slate-600">
            分类体系承接所有笔记内容，支持增删改查与基础信息维护。通过柔和的层级与标签浮层，
            把组织能力表达得更轻盈、更直观。
          </p>
        </motion.div>
      </div>
    </section>
  );
}
