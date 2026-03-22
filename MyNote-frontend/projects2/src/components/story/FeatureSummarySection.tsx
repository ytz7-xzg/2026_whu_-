import { gsap } from "gsap";
import { motion } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { PillCtaButton } from "../landing/PillCtaButton";
import type { Feature } from "../../data/features";

type FeatureSummarySectionProps = {
  features: Feature[];
  onStart?: () => void;
};

type SummaryCardProps = {
  feature: Feature;
  index: number;
  onCardMove: (event: React.MouseEvent<HTMLElement>) => void;
};

function SummaryCard({ feature, index, onCardMove }: SummaryCardProps) {
  return (
    <motion.article
      key={feature.id}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
      onMouseMove={onCardMove}
      className="final-chroma-card relative overflow-hidden rounded-[2rem] border border-white/65 bg-white/58 p-7 shadow-[0_18px_50px_rgba(15,23,42,0.09)] backdrop-blur-2xl"
    >
      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconBg}`}>
        <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
      </div>
      <h3 className="mb-2 text-2xl font-semibold text-slate-900">{feature.title}</h3>
      <p className="text-[15px] leading-relaxed text-slate-600">{feature.description}</p>
    </motion.article>
  );
}

export function FeatureSummarySection({ features, onStart }: FeatureSummarySectionProps) {
  const topRow = features.slice(0, 3);
  const bottomRow = features.slice(3);

  const chromaRootRef = useRef<HTMLDivElement | null>(null);
  const chromaOverlayRef = useRef<HTMLDivElement | null>(null);
  const setXRef = useRef<Function | null>(null);
  const setYRef = useRef<Function | null>(null);
  const posRef = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const root = chromaRootRef.current;
    const overlay = chromaOverlayRef.current;
    if (!root || !overlay) return;

    const center = () => {
      const rect = root.getBoundingClientRect();
      posRef.current = { x: rect.width / 2, y: rect.height / 2 };
      (setXRef.current as ((value: number) => void) | null)?.(posRef.current.x);
      (setYRef.current as ((value: number) => void) | null)?.(posRef.current.y);
    };

    const ctx = gsap.context(() => {
      setXRef.current = gsap.quickSetter(root, "--x", "px");
      setYRef.current = gsap.quickSetter(root, "--y", "px");
      center();
      gsap.set(overlay, { opacity: 0 });
    }, root);

    const onResize = () => center();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(posRef.current, {
      x,
      y,
      duration: 0.45,
      ease: "power3.out",
      overwrite: true,
      onUpdate: () => {
        (setXRef.current as ((value: number) => void) | null)?.(posRef.current.x);
        (setYRef.current as ((value: number) => void) | null)?.(posRef.current.y);
      },
    });
  };

  const handleGridMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const root = chromaRootRef.current;
    const overlay = chromaOverlayRef.current;
    if (!root || !overlay) return;

    const rect = root.getBoundingClientRect();
    moveTo(event.clientX - rect.left, event.clientY - rect.top);
    gsap.to(overlay, { opacity: 1, duration: 0.25, overwrite: true });
  };

  const handleGridLeave = () => {
    const overlay = chromaOverlayRef.current;
    if (!overlay) return;
    gsap.to(overlay, { opacity: 0, duration: 0.6, overwrite: true });
  };

  const handleCardMove = (event: React.MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section className="relative z-20 px-6 pt-28 pb-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[8%] left-[8%] h-64 w-64 rounded-full bg-indigo-300/20 blur-[85px]" />
        <div className="absolute right-[12%] bottom-[8%] h-72 w-72 rounded-full bg-pink-300/20 blur-[90px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55 }}
          className="mb-14 text-center"
        >
          <p className="mb-4 text-sm tracking-[0.2em] text-slate-500 uppercase">Final Chapter</p>
          <h2 className="mb-5 text-[clamp(2.2rem,4.4vw,3.8rem)] font-semibold text-slate-900">MyNote 功能全览</h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600">
            经过滚动叙事，你已经看到核心能力如何协同。这里汇总全部功能，作为完整落点与下一步行动入口。
          </p>
        </motion.div>

        <div
          ref={chromaRootRef}
          className="final-chroma-grid relative"
          onPointerMove={handleGridMove}
          onPointerLeave={handleGridLeave}
        >
          <div ref={chromaOverlayRef} className="final-chroma-overlay" />

          <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topRow.map((feature, index) => (
              <SummaryCard key={feature.id} feature={feature} index={index} onCardMove={handleCardMove} />
            ))}
          </div>

          <div className="relative z-10 mx-auto mt-6 grid w-full max-w-[56rem] grid-cols-1 gap-6 md:grid-cols-2">
            {bottomRow.map((feature, index) => (
              <SummaryCard key={feature.id} feature={feature} index={index + 3} onCardMove={handleCardMove} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-14 flex justify-center"
        >
          <PillCtaButton label="让我们开始吧！" onClick={onStart} />
        </motion.div>
      </div>
    </section>
  );
}
