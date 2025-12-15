import React, { useMemo } from "react";
import { usePredictions } from "../context/PredictionContext";
import { getMatchesByStage } from "../utils/bracketLogic";
import { getResolvedMatch } from "../utils/teamResolver";
import MatchPredictor from "./MatchPredictor";
import "./Prediction.css";

const BracketView = ({ stage }) => {
  const { predictions, updateMatchPrediction, updateFinalPrediction } =
    usePredictions();

  const getStageKey = (stage) => {
    const stageMap = {
      "Round of 32": "roundOf32",
      "Round of 16": "roundOf16",
      Quarterfinals: "quarterfinals",
      Semifinals: "semifinals",
      "Third Place": "thirdPlace",
      Final: "final",
    };
    return stageMap[stage];
  };

  const handleMatchWinner = (matchNo, winner) => {
    const stageKey = getStageKey(stage);

    if (stage === "Final" || stage === "Third Place") {
      updateFinalPrediction(stageKey, winner);
    } else {
      updateMatchPrediction(stageKey, matchNo, winner);
    }
  };

  const getWinner = (matchNo) => {
    const stageKey = getStageKey(stage);

    if (stage === "Final") return predictions.final;
    if (stage === "Third Place") return predictions.thirdPlace;

    return predictions[stageKey]?.[matchNo];
  };

  const matches = getMatchesByStage(stage);

  const resolvedMatches = useMemo(() => {
    return matches.map((match) => getResolvedMatch(match, predictions));
  }, [matches, predictions]);

  if (!resolvedMatches || resolvedMatches.length === 0) {
    return (
      <div className="bracket-view">
        <div className="stage-header">
          <h2>{stage}</h2>
          <p className="stage-description">No matches found for this stage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bracket-view">
      <div className="stage-header">
        <h2>{stage}</h2>
        <p className="stage-description">
          {stage === "Final"
            ? "Select the World Cup champion!"
            : stage === "Third Place"
            ? "Select the third-place winner."
            : "Select the winner for each match to advance to the next round."}
        </p>
      </div>

      <div className="matches-grid">
        {resolvedMatches.map((match) => (
          <MatchPredictor
            key={match.MatchNo}
            match={match}
            winner={getWinner(match.MatchNo)}
            onSelectWinner={(winner) =>
              handleMatchWinner(match.MatchNo, winner)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default BracketView;
