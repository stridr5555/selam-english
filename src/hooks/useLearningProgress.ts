import { useEffect, useReducer } from "react";
import {
  learningReducer,
  loadProgress,
  saveProgress
} from "../state/learningStore";

export function useLearningProgress() {
  const [progress, dispatch] = useReducer(learningReducer, undefined, loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  return { progress, dispatch };
}
