import React from "react";
import { getFlagUrl } from "../utils/flags";
import "./Prediction.css";

const MatchPredictor = ({
  match,
  winner,
  onSelectWinner,
  disabled = false,
}) => {
  if (!match) return null;

  const { Team1, Team2, MatchNo, Location } = match;
  const isTeam1Selected = winner === Team1;
  const isTeam2Selected = winner === Team2;

  return (
    <div className={`match-predictor ${disabled ? "disabled" : ""}`}>
      <div className="match-info">
        <span className="match-number">Match #{MatchNo}</span>
        <span className="match-location">{Location}</span>
      </div>

      <div className="match-teams">
        <button
          className={`team-button ${isTeam1Selected ? "selected" : ""}`}
          onClick={() => !disabled && onSelectWinner(Team1)}
          disabled={disabled || !Team1}
        >
          <div className="team-content">
            {getFlagUrl(Team1) && (
              <img
                src={getFlagUrl(Team1)}
                alt={`${Team1} flag`}
                className="flag-icon"
              />
            )}
            <span className="team-name">{Team1 || "TBD"}</span>
          </div>
          {isTeam1Selected && <span className="winner-badge">✓</span>}
        </button>

        <div className="vs-divider">VS</div>

        <button
          className={`team-button ${isTeam2Selected ? "selected" : ""}`}
          onClick={() => !disabled && onSelectWinner(Team2)}
          disabled={disabled || !Team2}
        >
          <div className="team-content">
            {getFlagUrl(Team2) && (
              <img
                src={getFlagUrl(Team2)}
                alt={`${Team2} flag`}
                className="flag-icon"
              />
            )}
            <span className="team-name">{Team2 || "TBD"}</span>
          </div>
          {isTeam2Selected && <span className="winner-badge">✓</span>}
        </button>
      </div>
    </div>
  );
};

export default MatchPredictor;
