import { BarChart3, CircleDashed } from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const bars = [16, 22, 28, 36, 46, 57, 68, 80];

export function StatisticsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [chartReplayKey, setChartReplayKey] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 20%"],
  });
  const isSectionActive = useInView(sectionRef, {
    amount: 0.15,
    margin: "0px 0px -10% 0px",
  });

  useEffect(() => {
    if (isSectionActive) {
      setChartReplayKey((prev) => prev + 1);
    }
  }, [isSectionActive]);

  const sceneY = useTransform(scrollYProgress, [0, 1], [72, -58]);
  const textY = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [0.85, 1.2]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.25, 1], [0.3, 0.62, 0.3]);
  const trendY = useTransform(scrollYProgress, [0, 1], [48, -34]);

  return (
    <section id="chapter-statistics" ref={sectionRef} className="relative min-h-[104vh] scroll-mt-10 px-6 py-16 md:scroll-mt-12">
      <motion.div
        className="pointer-events-none absolute top-[22%] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-300/25 blur-[105px]"
        style={{ scale: glowScale, opacity: glowOpacity }}
      />
      <div className="pointer-events-none absolute right-[10%] bottom-[16%] h-72 w-72 rounded-full bg-fuchsia-300/16 blur-[96px]" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div style={{ y: textY }} className="space-y-6">
          <p className="text-sm tracking-[0.22em] text-slate-500 uppercase">Chapter 3</p>
          <h2 className="text-[clamp(2.1rem,4.3vw,3.8rem)] leading-[1.14] font-semibold text-slate-900">
            数据统计
            <span className="block text-slate-500">用更清晰的分布理解你的内容</span>
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-slate-600">
            统计并呈现各分类下的笔记数量，在柔和光感与轻量图形中突出趋势和重点，
            帮助团队更快读懂内容结构与优化方向。
          </p>
        </motion.div>

        <motion.div style={{ y: sceneY }} className="relative h-[540px]">
          <div className="absolute inset-0 rounded-[36px] border border-white/65 bg-white/52 p-8 shadow-[0_35px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-cyan-600">
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm tracking-wide font-semibold uppercase">分类分布洞察</span>
              </div>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-slate-500">
                最近 30 天
              </span>
            </div>

            <div
              key={chartReplayKey}
              className="relative flex h-56 items-end justify-between gap-4 rounded-3xl border border-white/65 bg-white/55 px-6 pb-6"
            >
              {bars.map((bar, index) => (
                <motion.div
                  key={`${bar}-${index}-${chartReplayKey}`}
                  initial={{ height: 12, opacity: 0 }}
                  animate={{ height: `${bar}%`, opacity: 1 }}
                  transition={{ delay: index * 0.06 + 0.12, duration: 0.62, ease: "easeOut" }}
                  className="w-8 rounded-t-2xl bg-gradient-to-t from-cyan-500/70 via-sky-400/60 to-violet-400/55 md:w-9"
                />
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "工作", value: "10 篇" },
                { label: "生活", value: "5 篇" },
                { label: "学习", value: "8 篇" },
                { label: "灵感", value: "6 篇" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/65 bg-white/65 px-4 py-3"
                >
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-lg font-semibold text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            style={{ y: trendY }}
            className="absolute top-[4.8rem] right-6 rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_18px_45px_rgba(6,182,212,0.16)] backdrop-blur-xl"
          >
            <motion.div
              key={`trend-${chartReplayKey}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56, duration: 0.5, ease: "easeOut" }}
            >
              <div className="mb-2 flex items-center gap-2 text-cyan-600">
                <CircleDashed className="h-4 w-4" />
                <span className="text-xs font-semibold tracking-wide uppercase">趋势提醒</span>
              </div>
              <p className="text-sm text-slate-600">工作类内容占比上升 18%</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

