import { motion } from "motion/react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ShinyText } from "../effects/ShinyText";
import { AnimatedLogo } from "../landing/AnimatedLogo";
import { CardNav, type CardNavItem } from "../landing/CardNav";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;

const fadeOut = (progress: number, start: number, end: number) => {
  if (progress <= start) return 1;
  if (progress >= end) return 0;
  return 1 - (progress - start) / (end - start);
};

type HeroSectionProps = {
  onDirectLogin?: () => void;
};

export function HeroSection({ onDirectLogin }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const scrollToSection = (sectionId: string) => () => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    const topOffset = 36;
    const y = target.getBoundingClientRect().top + window.scrollY - topOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  };

  useLayoutEffect(() => {
    let rafId: number | null = null;

    const updateProgress = () => {
      const section = sectionRef.current;
      if (!section) return;

      const viewportHeight = window.innerHeight;
      const sectionRect = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - viewportHeight, viewportHeight * 0.9);
      const sectionScroll = clamp(-sectionRect.top, 0, travel);
      setProgress(clamp(sectionScroll / travel, 0, 1));
    };

    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateProgress();
      });
    };

    const onResize = () => {
      updateViewport();
      updateProgress();
    };

    updateViewport();
    updateProgress();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const clampedProgress = clamp(progress, 0, 1);
  const easedProgress = easeOutCubic(clampedProgress);
  const heroScale = 1 - easedProgress * 0.06;
  const heroY = -70 * easedProgress;
  const heroBlur = 8 * easedProgress;
  const heroOpacity = fadeOut(clampedProgress, 0.2, 0.72);
  const navOpacity = fadeOut(clampedProgress, 0.08, 0.42);
  const descriptionOpacity = fadeOut(clampedProgress, 0.14, 0.58);
  const descriptionY = -10 * easedProgress;

  const navItems: CardNavItem[] = useMemo(
    () => [
      {
        label: "灵感速记",
        description: "随手记下课堂片段、待办想法和临时灵感，不让好点子在忙碌里消失。",
        bgColor:
          "linear-gradient(160deg, rgba(255,255,255,0.9), rgba(249,245,255,0.86) 58%, rgba(244,239,255,0.78))",
        textColor: "#474566",
        accentColor: "rgba(153,136,238,0.52)",
        links: [
          { label: "记录灵感与待办", href: "#", onClick: scrollToSection("chapter-workflow"), ariaLabel: "跳转到笔记工作流章节" },
          { label: "创建你的第一条笔记", onClick: onDirectLogin },
          { label: "用最轻的方式开始整理", href: "#", onClick: scrollToSection("chapter-category"), ariaLabel: "跳转到分类整理章节" },
        ],
      },
      {
        label: "分类整理",
        description: "把零散内容按主题归档，编辑与管理合并在同一路径里，回看时更有秩序。",
        bgColor:
          "linear-gradient(162deg, rgba(245,251,255,0.88), rgba(237,245,255,0.86) 56%, rgba(241,242,255,0.8))",
        textColor: "#3f4a67",
        accentColor: "rgba(130,183,255,0.5)",
        links: [
          { label: "支持分类管理", href: "#", onClick: scrollToSection("chapter-category"), ariaLabel: "跳转到分类整理章节" },
          { label: "编辑与整理更顺手", href: "#", onClick: scrollToSection("chapter-workflow"), ariaLabel: "跳转到笔记工作流章节" },
          { label: "让信息不再散落", href: "#", onClick: scrollToSection("chapter-category"), ariaLabel: "跳转到分类整理章节" },
        ],
      },
      {
        label: "数据统计",
        description: "查看笔记数量、近期动态与变化趋势，用概览视角持续优化你的记录习惯。",
        bgColor:
          "linear-gradient(148deg, rgba(245,242,255,0.94), rgba(235,238,255,0.9) 48%, rgba(251,232,246,0.88))",
        textColor: "#453e68",
        accentColor: "rgba(211,141,223,0.54)",
        links: [
          { label: "查看笔记数量与变化趋势", href: "#", onClick: scrollToSection("chapter-statistics"), ariaLabel: "跳转到数据统计章节" },
          { label: "快速回顾最近编辑内容", href: "#", onClick: scrollToSection("chapter-statistics"), ariaLabel: "跳转到数据统计章节" },
          { label: "用概览视角了解记录状态", href: "#", onClick: scrollToSection("chapter-statistics"), ariaLabel: "跳转到数据统计章节" },
        ],
      },
    ],
    [onDirectLogin],
  );

  return (
    <section ref={sectionRef} className="relative z-30 min-h-[116vh]">
      <AnimatedLogo progress={easedProgress} viewport={viewport} />

      <motion.div
        className="sticky top-0 h-screen px-6"
        style={{
          scale: heroScale,
          y: heroY,
          opacity: heroOpacity,
          filter: `blur(${heroBlur}px)`,
        }}
      >
        <motion.div
          className="pointer-events-auto absolute inset-x-0 top-11 z-40 md:top-12"
          style={{ opacity: navOpacity }}
        >
          <CardNav
            items={navItems}
            ctaLabel="直接登录"
            baseColor="linear-gradient(148deg, rgba(255,255,255,0.8), rgba(249,245,255,0.64) 50%, rgba(243,247,255,0.6))"
            menuColor="#71688f"
            buttonBgColor="linear-gradient(135deg, #8caaff, #a291f5 52%, #ee9fd1)"
            buttonTextColor="#ffffff"
            onCtaClick={onDirectLogin}
          />
        </motion.div>

        <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center text-center">
          <motion.p
            className="mt-[18rem] max-w-3xl text-[clamp(1.2rem,2.5vw,2rem)] leading-relaxed sm:mt-[20rem]"
            style={{ opacity: descriptionOpacity, y: descriptionY }}
          >
            <ShinyText
              text="登录进来的用户可以创建、编辑、删除自己的文字笔记，支持简单的分类。"
              color="#5e6676"
              shineColor="#ffffff"
              speed={2.8}
              spread={102}
              className="font-medium"
            />
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
