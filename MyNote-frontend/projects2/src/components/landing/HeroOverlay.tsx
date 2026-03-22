import { motion, type MotionValue } from "motion/react";
import { Sparkles, Users } from "lucide-react";
import { ShinyText } from "../effects/ShinyText";

type HeroOverlayProps = {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

export function HeroOverlay({ opacity, y }: HeroOverlayProps) {
  return (
    <motion.div className="fixed inset-0 z-10 pointer-events-none" style={{ opacity, y }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="absolute inset-0 mx-auto w-full max-w-5xl px-6"
      >
        <motion.div
          variants={itemVariants}
          className="absolute bottom-[calc(50%+80px)] left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/80 bg-white/60 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur-md pointer-events-auto md:bottom-[calc(50%+100px)]"
        >
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>项目需求文档</span>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="absolute top-[calc(50%+80px)] left-0 flex w-full flex-col items-center pointer-events-auto md:top-[calc(50%+100px)]"
        >
          <div className="mb-6 flex items-center justify-center gap-2 text-xl font-medium text-gray-500 md:text-2xl">
            <Users className="h-6 w-6" />
            <span>3人协作项目</span>
          </div>

          <div className="mx-auto max-w-3xl px-6 text-center md:px-16 lg:px-24">
            <p className="text-xl leading-relaxed font-medium text-gray-600 md:text-2xl">
              <ShinyText
                text="登录进来的用户可以创建、编辑、删除自己的文字笔记，支持简单的分类。"
                className="text-xl leading-relaxed font-medium md:text-2xl"
                color="#6b7280"
                shineColor="#ffffff"
                speed={2.6}
                spread={110}
                pauseOnHover
              />
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
