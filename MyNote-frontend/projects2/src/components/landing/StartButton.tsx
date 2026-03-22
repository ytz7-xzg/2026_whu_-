import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";

export function StartButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="pt-16 flex justify-center"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group flex items-center gap-3 rounded-full bg-gray-900 px-8 py-4 text-lg font-semibold text-white shadow-[0_8px_20px_rgb(0,0,0,0.15)] transition-colors hover:bg-gray-800"
      >
        开始项目开发
        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </motion.button>
    </motion.div>
  );
}
