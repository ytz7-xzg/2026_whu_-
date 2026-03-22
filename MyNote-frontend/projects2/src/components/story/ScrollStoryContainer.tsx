import { CategorySection } from "./CategorySection";
import { NoteWorkflowSection } from "./NoteWorkflowSection";
import { StatisticsSection } from "./StatisticsSection";

export function ScrollStoryContainer() {
  return (
    <div className="relative z-20">
      <NoteWorkflowSection />
      <CategorySection />
      <StatisticsSection />
    </div>
  );
}
