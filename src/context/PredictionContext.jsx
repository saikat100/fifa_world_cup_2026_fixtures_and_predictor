import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllGroups } from "../utils/bracketLogic";

const PredictionContext = createContext();

const STORAGE_KEY = "fifa2026_predictions";

// Initial state structure
const getInitialState = () => {
  const groups = getAllGroups();
  const initialGroupStage = {};

  groups.forEach((group) => {
    initialGroupStage[group] = {
      first: null,
      second: null,
      third: null,
      fourth: null,
    };
  });

  return {
    groupStage: initialGroupStage,
    thirdPlaceQualifiers: [], // Array of 8 third-place teams that advance
    roundOf32: {}, // { matchNo: winnerTeam }
    roundOf16: {},
    quarterfinals: {},
    semifinals: {},
    thirdPlace: null,
    final: null,
  };
};

export const PredictionProvider = ({ children }) => {
  const [predictions, setPredictions] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved predictions:", e);
      }
    }
    return getInitialState();
  });

  // Save to localStorage whenever predictions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
  }, [predictions]);

  // Update group stage prediction
  const updateGroupPrediction = (group, position, team) => {
    setPredictions((prev) => ({
      ...prev,
      groupStage: {
        ...prev.groupStage,
        [group]: {
          ...prev.groupStage[group],
          [position]: team,
        },
      },
    }));
  };

  // Swap two positions in a group
  const swapGroupPositions = (group, pos1, pos2) => {
    setPredictions((prev) => {
      const groupData = prev.groupStage[group];
      const team1 = groupData[pos1];
      const team2 = groupData[pos2];

      return {
        ...prev,
        groupStage: {
          ...prev.groupStage,
          [group]: {
            ...groupData,
            [pos1]: team2,
            [pos2]: team1,
          },
        },
      };
    });
  };

  // Update third-place qualifiers
  const updateThirdPlaceQualifiers = (qualifiers) => {
    setPredictions((prev) => ({
      ...prev,
      thirdPlaceQualifiers: qualifiers,
    }));
  };

  // Update knockout match prediction
  const updateMatchPrediction = (stage, matchNo, winner) => {
    setPredictions((prev) => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [matchNo]: winner,
      },
    }));
  };

  // Update final/third place
  const updateFinalPrediction = (matchType, winner) => {
    setPredictions((prev) => ({
      ...prev,
      [matchType]: winner,
    }));
  };

  // Reset all predictions
  const resetPredictions = () => {
    const initial = getInitialState();
    setPredictions(initial);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Get winner for a specific match
  const getMatchWinner = (stage, matchNo) => {
    if (stage === "final") return predictions.final;
    if (stage === "thirdPlace") return predictions.thirdPlace;
    return predictions[stage]?.[matchNo];
  };

  const value = {
    predictions,
    updateGroupPrediction,
    swapGroupPositions,
    updateThirdPlaceQualifiers,
    updateMatchPrediction,
    updateFinalPrediction,
    resetPredictions,
    getMatchWinner,
  };

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
};

export const usePredictions = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error("usePredictions must be used within PredictionProvider");
  }
  return context;
};
