import React, { useState, useEffect, useRef } from "react";
import { usePredictions } from "../context/PredictionContext";
import { areGroupPredictionsComplete } from "../utils/bracketLogic";
import GroupStagePredictor from "./GroupStagePredictor";
import BracketView from "./BracketView";
import winGif from "../assets/win.gif";
import trophyImg from "../assets/worldCup.png";
import { getFlagUrl } from "../utils/flags";
import "./Prediction.css";

const PredictionView = () => {
  const [currentStage, setCurrentStage] = useState("Group Stage");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showChampionModal, setShowChampionModal] = useState(false);
  const [championHistoryData, setChampionHistoryData] = useState([]);
  const isFirstMount = useRef(true);
  const { predictions, resetPredictions } = usePredictions();

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbx482wNxCV1OX4oEDneNsdh_5OVhLs7XDoqPFz5jWr4usaEeAMyJAc7g1Kfp6Zm1oALug/exec";

  // Fetch champion history on mount
  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setChampionHistoryData(data);
        } else {
          console.error("Invalid data format from Google Sheets:", data);
          // Fallback to local data if API fails?
          // For now, let's stick to API or empty to avoid confusion.
        }
      })
      .catch((err) => console.error("Failed to fetch champion history:", err));
  }, []);

  // Watch for champion selection
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (predictions.final) {
      setShowChampionModal(true);

      // Update the Google Sheet
      // Google Apps Script requires no-cors for simple posts usually, or specific headers.
      // However, standard fetch with CORS enabled on the script side (which we did by returning JSON) should work.
      // But standard POSTs to GAS often need to be text/plain or specific to avoid preflight issues if logic isn't perfect.
      // We'll try standard JSON POST first since we handled OPTIONS/CORS in the script (implicitly via Web App default behavior usually handling specific types).
      // Actually, standard fetch POST to GAS often triggers CORS issues unless content-type is text/plain.
      // Let's use text/plain and parse it in the script (which the script I gave supports).

      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({ team: predictions.final, action: "increment" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("Champion count updated:", data.newCount);
            // Refresh history
            fetch(GOOGLE_SCRIPT_URL)
              .then((res) => res.json())
              .then((history) => setChampionHistoryData(history));
          }
        })
        .catch((err) => console.error("Failed to update champion count:", err));
    }
  }, [predictions.final]);

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
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    resetPredictions();
    setCurrentStage("Group Stage");
    setShowResetConfirm(false);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
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
              {stage === "Final" && complete && predictions.final
                ? `🏆 Champion (${predictions.final})`
                : stage === "Third Place" && complete && predictions.thirdPlace
                ? `🥈 Third Place (${predictions.thirdPlace})`
                : stage}
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

      {/* Custom Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={cancelReset}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reset All Predictions?</h3>
            <p>
              Are you sure you want to reset all predictions? This action cannot
              be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={cancelReset}>
                Cancel
              </button>
              <button className="modal-btn confirm-btn" onClick={confirmReset}>
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Championship Modal */}
      {showChampionModal && predictions.final && (
        <div
          className="modal-overlay"
          onClick={() => setShowChampionModal(false)}
        >
          <div
            className="modal-content champion-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: "center", padding: "32px", maxWidth: "500px" }}
          >
            <h2 className="champion-title">🏆 Champion!</h2>
            <div className="champion-team">{predictions.final}</div>
            <div className="champion-media">
              <img src={winGif} alt="Celebration" className="champion-gif" />
              {/* <img
                src={trophyImg}
                alt="World Cup Trophy"
                className="champion-trophy"
              /> */}
            </div>
            <button
              className="modal-btn confirm-btn"
              onClick={() => setShowChampionModal(false)}
              style={{ marginTop: "24px", width: "100%" }}
            >
              Celebrate!
            </button>
          </div>
        </div>
      )}
      {predictions.final && (
        <div className="champion-history">
          <h2>
            Champion Predictions (Total Participants:{" "}
            {championHistoryData.reduce(
              (sum, item) => sum + (parseInt(item["Number of win"]) || 0),
              0
            )}
            )
          </h2>
          <div className="history-list">
            {(() => {
              const totalPredictions = championHistoryData.reduce(
                (sum, item) => sum + (parseInt(item["Number of win"]) || 0),
                0
              );

              return championHistoryData
                .filter((team) => team["Number of win"] > 0)
                .sort((a, b) => b["Number of win"] - a["Number of win"])
                .map((team) => {
                  const percentage =
                    totalPredictions > 0
                      ? (
                          (team["Number of win"] / totalPredictions) *
                          100
                        ).toFixed(1)
                      : 0;
                  return (
                    <div key={team["Team Name"]} className="history-item-bar">
                      <div
                        className="bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <div className="bar-content">
                        <div className="bar-left">
                          {getFlagUrl(team["Team Name"]) && (
                            <img
                              src={getFlagUrl(team["Team Name"])}
                              alt={team["Team Name"]}
                              className="history-flag"
                            />
                          )}
                          <span className="team-name">{team["Team Name"]}</span>
                        </div>
                        <div className="bar-right">
                          <span className="percentage">{percentage}%</span>
                        </div>
                      </div>
                    </div>
                  );
                });
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionView;
