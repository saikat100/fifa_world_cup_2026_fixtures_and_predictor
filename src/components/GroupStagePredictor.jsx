import React from "react";
import { usePredictions } from "../context/PredictionContext";
import { getGroupTeams, getAllGroups } from "../utils/bracketLogic";
import { getFlagUrl } from "../utils/flags";
import "./Prediction.css";

const GroupStagePredictor = () => {
  const { predictions, updateGroupPrediction, updateThirdPlaceQualifiers } =
    usePredictions();
  const groups = getAllGroups();

  const handleTeamSelect = (group, position, team) => {
    updateGroupPrediction(group, position, team);
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
          <div className="position-select">
            <label>1st Place:</label>
            <select
              value={groupPrediction.first || ""}
              onChange={(e) => handleTeamSelect(group, "first", e.target.value)}
              className="team-select"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div className="position-select">
            <label>2nd Place:</label>
            <select
              value={groupPrediction.second || ""}
              onChange={(e) =>
                handleTeamSelect(group, "second", e.target.value)
              }
              className="team-select"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option
                  key={team}
                  value={team}
                  disabled={team === groupPrediction.first}
                >
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div className="position-select">
            <label>3rd Place:</label>
            <select
              value={groupPrediction.third || ""}
              onChange={(e) => handleTeamSelect(group, "third", e.target.value)}
              className="team-select"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option
                  key={team}
                  value={team}
                  disabled={
                    team === groupPrediction.first ||
                    team === groupPrediction.second
                  }
                >
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div className="position-select">
            <label>4th Place:</label>
            <select
              value={groupPrediction.fourth || ""}
              onChange={(e) =>
                handleTeamSelect(group, "fourth", e.target.value)
              }
              className="team-select"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option
                  key={team}
                  value={team}
                  disabled={
                    team === groupPrediction.first ||
                    team === groupPrediction.second ||
                    team === groupPrediction.third
                  }
                >
                  {team}
                </option>
              ))}
            </select>
          </div>
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
