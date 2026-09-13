import React from "react";
import { AIEligibilityChecker } from "./AIEligibilityChecker";

export function EligibilityChecker({ onBookCounselor }: { onBookCounselor?: () => void }) {
  return <AIEligibilityChecker onBookCounselor={onBookCounselor} />;
}

export default EligibilityChecker;
