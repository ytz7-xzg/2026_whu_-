import { motion } from "motion/react";

type AnimatedLogoProps = {
  progress: number;
  viewport: {
    width: number;
    height: number;
  };
};

type StrokeSpec = {
  d: string;
  sequence: number[];
  times: number[];
};

const strokes: StrokeSpec[] = [
  {
    d: "M 20 80 Q 20 40 40 20 Q 55 40 70 80 Q 80 40 95 20 Q 110 50 110 80",
    sequence: [0, 1, 1, 0, 0],
    times: [0, 0.1875, 0.8, 0.9875, 1],
  },
  {
    d: "M 120 45 Q 125 70 135 70 Q 145 70 145 45 Q 145 70 145 90 Q 140 100 130 95",
    sequence: [0, 0, 1, 1, 0, 0],
    times: [0, 0.0625, 0.1875, 0.8, 0.925, 1],
  },
  {
    d: "M 160 80 L 160 20 L 200 80 L 200 20",
    sequence: [0, 0, 1, 1, 0, 0],
    times: [0, 0.125, 0.3125, 0.675, 0.8625, 1],
  },
  {
    d: "M 230 45 C 215 45 215 70 230 70 C 245 70 245 45 230 45 Z",
    sequence: [0, 0, 1, 1, 0, 0],
    times: [0, 0.1875, 0.2875, 0.7, 0.8, 1],
  },
  {
    d: "M 255 30 L 255 70 Q 255 75 265 70 M 245 45 L 265 45",
    sequence: [0, 0, 1, 1, 0, 0],
    times: [0, 0.225, 0.325, 0.6625, 0.7625, 1],
  },
  {
    d: "M 275 60 C 275 40 305 40 305 60 C 305 75 275 75 275 60 L 305 60",
    sequence: [0, 0, 1, 1, 0, 0],
    times: [0, 0.2625, 0.3625, 0.625, 0.725, 1],
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const lerp = (start: number, end: number, progress: number) => start + (end - start) * progress;

export function AnimatedLogo({ progress, viewport }: AnimatedLogoProps) {
  const safeProgress = clamp(progress, 0, 1);
  const width = Math.max(1, viewport.width);
  const height = Math.max(1, viewport.height);

  const safeMargin = width < 640 ? 12 : 20;
  const logoWidth = Math.min(width * 0.84, 640);
  const logoHeight = logoWidth * (100 / 320);

  const preferredEndScale = width < 640 ? 0.4 : 0.36;
  const widthBoundScale = (width - safeMargin * 2) / logoWidth;
  const heightBoundScale = (height - safeMargin * 2) / logoHeight;
  const endScale = clamp(Math.min(preferredEndScale, widthBoundScale, heightBoundScale), 0.32, 0.45);

  const initialLeft = (width - logoWidth) / 2;
  const initialTop = (height - logoHeight) / 2;

  const finalLeft = safeMargin;
  const finalTop = safeMargin;

  const minDeltaX = -initialLeft;
  const minDeltaY = -initialTop;
  const maxDeltaX = width - initialLeft - logoWidth * endScale;
  const maxDeltaY = height - initialTop - logoHeight * endScale;

  const targetDeltaX = clamp(finalLeft - initialLeft, minDeltaX, maxDeltaX);
  const targetDeltaY = clamp(finalTop - initialTop, minDeltaY, maxDeltaY);

  const translateX = lerp(0, targetDeltaX, safeProgress);
  const translateY = lerp(0, targetDeltaY, safeProgress);
  const scale = lerp(1, endScale, safeProgress);

  return (
    <motion.div
      className="pointer-events-none fixed z-50 flex w-[min(84vw,640px)] justify-center"
      style={{
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        className="w-full will-change-transform"
        style={{
          x: translateX,
          y: translateY,
          scale,
          transformOrigin: "top left",
        }}
      >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="w-full drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]"
      >
        <svg
          viewBox="0 0 320 100"
          className="h-auto w-full"
          fill="none"
          stroke="url(#gradient-MyNote)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="gradient-MyNote" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {strokes.map((stroke) => (
            <motion.path
              key={stroke.d}
              d={stroke.d}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: stroke.sequence }}
              transition={{
                duration: 8,
                ease: "easeInOut",
                repeat: Infinity,
                times: stroke.times,
              }}
            />
          ))}
        </svg>
      </motion.div>
      </motion.div>
    </motion.div>
  );
}
