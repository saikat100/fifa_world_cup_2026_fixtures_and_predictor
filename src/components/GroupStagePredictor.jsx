import React from "react";
import { usePredictions } from "../context/PredictionContext";
import { getGroupTeams, getAllGroups } from "../utils/bracketLogic";
import { getFlagUrl } from "../utils/flags";
import "./Prediction.css";

const GroupStagePredictor = () => {
  const {
    predictions,
    updateGroupPrediction,
    swapGroupPositions,
    updateThirdPlaceQualifiers,
  } = usePredictions();
  const groups = getAllGroups();

  const handleTeamSelect = (group, position, team) => {
    updateGroupPrediction(group, position, team);

    // Auto-select the last team if 3 teams are selected
    if (team) {
      const currentGroup = predictions.groupStage[group] || {};
      // Simulate the new state
      const nextGroup = { ...currentGroup, [position]: team };

      const positions = ["first", "second", "third", "fourth"];
      const filledCount = positions.filter((pos) => nextGroup[pos]).length;

      if (filledCount === 3) {
        const teams = getGroupTeams(group);
        const selectedTeams = Object.values(nextGroup).filter(Boolean);
        const remainingTeam = teams.find((t) => !selectedTeams.includes(t));
        const remainingPosition = positions.find((pos) => !nextGroup[pos]);

        if (remainingTeam && remainingPosition) {
          updateGroupPrediction(group, remainingPosition, remainingTeam);
        }
      }
    }
  };

  const POSITIONS = [
    { key: "first", label: "1st Place" },
    { key: "second", label: "2nd Place" },
    { key: "third", label: "3rd Place" },
    { key: "fourth", label: "4th Place" },
  ];

  const handleSwap = (group, index, direction) => {
    const currentPosKey = POSITIONS[index].key;
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < POSITIONS.length) {
      const targetPosKey = POSITIONS[targetIndex].key;
      swapGroupPositions(group, currentPosKey, targetPosKey);
    }
  };

  const handleQualifierToggle = (team) => {
    const currentQualifiers = predictions.thirdPlaceQualifiers || [];

    if (currentQualifiers.includes(team)) {
      // Remove team
      updateThirdPlaceQualifiers(currentQualifiers.filter((t) => t !== team));
    } else if (currentQualifiers.length < 8) {
      // Add team
      updateThirdPlaceQualifiers([...currentQualifiers, team]);
    }
  };

  const renderGroupCard = (group) => {
    const teams = getGroupTeams(group);
    const groupPrediction = predictions.groupStage[group] || {};
    const selectedValues = Object.values(groupPrediction).filter(Boolean);

    const isOptionDisabled = (team, currentPosition) => {
      // Check if team is selected in any OTHER position
      // i.e. it is in selectedValues AND it is NOT the value of the current selector
      return (
        selectedValues.includes(team) &&
        team !== groupPrediction[currentPosition]
      );
    };

    return (
      <div key={group} className="group-card">
        <h3 className="group-title">Group {group}</h3>
        <div className="group-teams">
          {teams.map((team) => (
            <div key={team} className="team-item">
              {getFlagUrl(team) && (
                <img
                  src={getFlagUrl(team)}
                  alt={`${team} flag`}
                  className="flag-icon-small"
                />
              )}
              <span className="team-name">{team}</span>
            </div>
          ))}
        </div>

        <div className="position-selectors">
          {POSITIONS.map((pos, index) => (
            <div key={pos.key} className="position-select-row">
              <div className="position-select">
                <label>{pos.label}:</label>
                <select
                  value={groupPrediction[pos.key] || ""}
                  onChange={(e) =>
                    handleTeamSelect(group, pos.key, e.target.value)
                  }
                  className={`team-select ${
                    groupPrediction[pos.key] ? "has-value" : ""
                  }`}
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option
                      key={team}
                      value={team}
                      disabled={isOptionDisabled(team, pos.key)}
                    >
                      {team}
                    </option>
                  ))}
                </select>
              </div>
              <div className="swap-buttons">
                <button
                  className="swap-btn"
                  onClick={() => handleSwap(group, index, "up")}
                  disabled={index === 0}
                  title="Move Up"
                >
                  ▲
                </button>
                <button
                  className="swap-btn"
                  onClick={() => handleSwap(group, index, "down")}
                  disabled={index === POSITIONS.length - 1}
                  title="Move Down"
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
        </div>

        {groupPrediction.first && groupPrediction.second && (
          <div className="qualifiers-badge">
            ✓ {groupPrediction.first} & {groupPrediction.second} advance
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="group-stage-predictor">
      <div className="stage-header">
        <h2>Group Stage Predictions</h2>
        <p className="stage-description">
          Select the final standings for each group. Top 2 teams from each group
          advance, plus the best 8 third-place teams.
        </p>
      </div>

      <div className="groups-grid">
        {groups.map((group) => renderGroupCard(group))}
      </div>

      <div className="third-place-qualifiers">
        <h3>Third-Place Qualifiers</h3>
        <p className="qualifier-description">
          Select 8 third-place teams that will advance to the Round of 32 (
          {predictions.thirdPlaceQualifiers?.length || 0}/8 selected)
        </p>

        <div className="qualifier-grid">
          {groups.map((group) => {
            const thirdPlaceTeam = predictions.groupStage[group]?.third;
            const isSelected =
              predictions.thirdPlaceQualifiers?.includes(thirdPlaceTeam);
            const canSelect =
              predictions.thirdPlaceQualifiers?.length < 8 || isSelected;

            if (!thirdPlaceTeam) return null;

            return (
              <button
                key={group}
                className={`qualifier-button ${isSelected ? "selected" : ""}`}
                onClick={() => handleQualifierToggle(thirdPlaceTeam)}
                disabled={!canSelect && !isSelected}
              >
                <div className="qualifier-content">
                  {getFlagUrl(thirdPlaceTeam) && (
                    <img
                      src={getFlagUrl(thirdPlaceTeam)}
                      alt={`${thirdPlaceTeam} flag`}
                      className="flag-icon-small"
                    />
                  )}
                  <span className="team-name">{thirdPlaceTeam}</span>
                  <span className="group-badge">Group {group}</span>
                </div>
                {isSelected && <span className="check-mark">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GroupStagePredictor;
