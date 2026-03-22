import { motion } from "motion/react";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] h-[70vw] w-[70vw] rounded-full bg-gradient-to-br from-indigo-400/40 via-purple-400/30 to-transparent blur-[80px] mix-blend-multiply md:h-[50vw] md:w-[50vw] md:blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] -right-[10%] h-[60vw] w-[60vw] rounded-full bg-gradient-to-bl from-pink-400/40 via-rose-400/30 to-transparent blur-[80px] mix-blend-multiply md:h-[45vw] md:w-[45vw] md:blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, 50, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[20%] left-[20%] h-[60vw] w-[60vw] rounded-full bg-gradient-to-tr from-blue-400/40 via-cyan-400/30 to-transparent blur-[80px] mix-blend-multiply md:h-[40vw] md:w-[40vw] md:blur-[120px]"
      />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
    </div>
  );
}
