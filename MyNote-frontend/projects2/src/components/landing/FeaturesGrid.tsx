import { motion } from "motion/react";
import type { Feature } from "../../data/features";

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: index * 0.1,
      }}
      className={`cursor-pointer rounded-[2rem] border border-white/60 bg-white/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl ${
        index === 4 ? "md:col-span-2 lg:col-span-1" : ""
      }`}
    >
      <div
        className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.iconBg}`}
      >
        <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
      </div>
      <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
      <p className="text-[15px] leading-relaxed text-gray-500">{feature.description}</p>
    </motion.article>
  );
}

export function FeaturesGrid({ features }: { features: Feature[] }) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => (
        <FeatureCard key={feature.id} feature={feature} index={index} />
      ))}
    </section>
  );
}
