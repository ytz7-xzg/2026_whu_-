import { ChevronRight } from "lucide-react";
import { gsap } from "gsap";
import { useLayoutEffect, useRef } from "react";

type PillCtaButtonProps = {
  label: string;
  className?: string;
  onClick?: () => void;
};

export function PillCtaButton({ label, className = "", onClick }: PillCtaButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const circleRef = useRef<HTMLSpanElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const hoverLabelRef = useRef<HTMLSpanElement | null>(null);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const activeTweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const ease = "power3.easeOut";
    const button = buttonRef.current;
    if (!button) return;

    const layout = () => {
      const circle = circleRef.current;
      const normalLabel = labelRef.current;
      const hoverLabel = hoverLabelRef.current;
      const arrow = arrowRef.current;
      if (!button || !circle || !normalLabel || !hoverLabel) return;

      const rect = button.getBoundingClientRect();
      const { width: w, height: h } = rect;
      const radius = ((w * w) / 4 + h * h) / (2 * h);
      const diameter = Math.ceil(2 * radius) + 2;
      const delta = Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (w * w) / 4))) + 1;
      const originY = diameter - delta;

      circle.style.width = `${diameter}px`;
      circle.style.height = `${diameter}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`,
      });
      gsap.set(normalLabel, { y: 0 });
      gsap.set(hoverLabel, { y: h + 12, opacity: 0 });
      if (arrow) gsap.set(arrow, { x: 0, color: "#ffffff" });

      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });
      tl.to(
        circle,
        {
          scale: 1.2,
          xPercent: -50,
          duration: 2,
          ease,
          overwrite: "auto",
        },
        0,
      );
      tl.to(
        normalLabel,
        {
          y: -(h + 8),
          duration: 2,
          ease,
          overwrite: "auto",
        },
        0,
      );
      tl.to(
        hoverLabel,
        {
          y: 0,
          opacity: 1,
          duration: 2,
          ease,
          overwrite: "auto",
        },
        0,
      );
      if (arrow) {
        tl.to(
          arrow,
          {
            x: 6,
            color: "#0f172a",
            duration: 2,
            ease,
            overwrite: "auto",
          },
          0,
        );
      }

      tlRef.current = tl;
    };

    const ctx = gsap.context(() => {
      layout();
    }, button);

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    let isMounted = true;
    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (isMounted) layout();
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
      window.removeEventListener("resize", onResize);
      activeTweenRef.current?.kill();
      tlRef.current?.kill();
      ctx.revert();
    };
  }, []);

  const handleEnter = () => {
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease: "power3.easeOut",
      overwrite: "auto",
    });
  };

  const handleLeave = () => {
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(0, {
      duration: 0.2,
      ease: "power3.easeOut",
      overwrite: "auto",
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      className={`group relative inline-flex h-14 min-w-[16rem] items-center justify-center gap-3 overflow-hidden rounded-full border border-slate-800/15 bg-slate-900 px-8 text-lg font-semibold text-white shadow-[0_10px_26px_rgba(15,23,42,0.2)] ${className}`}
    >
      <span ref={circleRef} aria-hidden="true" className="pointer-events-none absolute left-1/2 rounded-full bg-white/92" />
      <span className="relative z-10 inline-flex items-center gap-3">
        <span className="relative block h-7 overflow-hidden leading-7">
          <span ref={labelRef} className="block whitespace-nowrap text-white">
            {label}
          </span>
          <span ref={hoverLabelRef} aria-hidden="true" className="absolute inset-x-0 top-0 block whitespace-nowrap text-slate-900">
            {label}
          </span>
        </span>
        <ChevronRight ref={arrowRef} className="h-5 w-5 text-white" />
      </span>
    </button>
  );
}
