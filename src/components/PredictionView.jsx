import React, { useState, useEffect } from "react";
import { usePredictions } from "../context/PredictionContext";
import { areGroupPredictionsComplete } from "../utils/bracketLogic";
import GroupStagePredictor from "./GroupStagePredictor";
import BracketView from "./BracketView";
import "./Prediction.css";

const PredictionView = () => {
  const [currentStage, setCurrentStage] = useState("Group Stage");
  const { predictions, resetPredictions } = usePredictions();

  const stages = [
    "Group Stage",
    "Round of 32",
    "Round of 16",
    "Quarterfinals",
    "Semifinals",
    "Third Place",
    "Final",
  ];

  // Check if a stage is complete
  const isStageComplete = (stage) => {
    switch (stage) {
      case "Group Stage":
        return areGroupPredictionsComplete(
          predictions.groupStage,
          predictions.thirdPlaceQualifiers
        );

      case "Round of 32":
        // Check if all 16 matches have winners
        const r32Matches = [
          73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88,
        ];
        return r32Matches.every((matchNo) => predictions.roundOf32?.[matchNo]);

      case "Round of 16":
        // Check if all 8 matches have winners
        const r16Matches = [89, 90, 91, 92, 93, 94, 95, 96];
        return r16Matches.every((matchNo) => predictions.roundOf16?.[matchNo]);

      case "Quarterfinals":
        // Check if all 4 matches have winners
        const qfMatches = [97, 98, 99, 100];
        return qfMatches.every(
          (matchNo) => predictions.quarterfinals?.[matchNo]
        );

      case "Semifinals":
        // Check if both matches have winners
        const sfMatches = [101, 102];
        return sfMatches.every((matchNo) => predictions.semifinals?.[matchNo]);

      case "Third Place":
        return !!predictions.thirdPlace;

      case "Final":
        return !!predictions.final;

      default:
        return false;
    }
  };

  // Check if a stage is unlocked (previous stage is complete)
  const isStageUnlocked = (stage) => {
    const stageIndex = stages.indexOf(stage);
    if (stageIndex === 0) return true; // Group stage always unlocked

    const previousStage = stages[stageIndex - 1];
    return isStageComplete(previousStage);
  };

  // Auto-advance to next stage when current is complete
  useEffect(() => {
    if (isStageComplete(currentStage)) {
      const currentIndex = stages.indexOf(currentStage);
      if (currentIndex < stages.length - 1) {
        const nextStage = stages[currentIndex + 1];
        // Small delay for better UX
        const timer = setTimeout(() => {
          setCurrentStage(nextStage);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [predictions, currentStage]);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all predictions?")) {
      resetPredictions();
      setCurrentStage("Group Stage");
    }
  };

  const handleStageClick = (stage) => {
    if (isStageUnlocked(stage)) {
      setCurrentStage(stage);
    }
  };

  return (
    <div className="prediction-view">
      <div className="prediction-header">
        <h1>Tournament Predictions</h1>
        <button className="reset-btn" onClick={handleReset}>
          Reset All Predictions
        </button>
      </div>

      <div className="stage-navigation">
        {stages.map((stage) => {
          const unlocked = isStageUnlocked(stage);
          const complete = isStageComplete(stage);

          return (
            <button
              key={stage}
              className={`stage-tab ${currentStage === stage ? "active" : ""} ${
                !unlocked ? "locked" : ""
              } ${complete ? "complete" : ""}`}
              onClick={() => handleStageClick(stage)}
              disabled={!unlocked}
              title={!unlocked ? "Complete previous stage to unlock" : ""}
            >
              {complete && <span className="check-icon">✓ </span>}
              {!unlocked && <span className="lock-icon">🔒 </span>}
              {stage}
            </button>
          );
        })}
      </div>

      <div className="stage-content">
        {currentStage === "Group Stage" ? (
          <GroupStagePredictor />
        ) : (
          <BracketView stage={currentStage} />
        )}
      </div>
    </div>
  );
};

export default PredictionView;
