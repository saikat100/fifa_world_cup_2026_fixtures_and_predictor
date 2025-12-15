import React from "react";
import { getFlagUrl } from "../utils/flags";

const MatchTable = ({ matches, onSort, sortState, showIST }) => {
  const formatDate = (match) => {
    return showIST
      ? match.DateTimeIST || match.DateTimeEDT
      : match.DateTimeEDT || match.DateTimeIST;
  };

  const getSortClass = (key) => {
    if (sortState.key === key) {
      return sortState.dir === 1 ? "sort-asc" : "sort-desc";
    }
    return "";
  };

  return (
    <div className="table-wrap">
      <table id="matches">
        <thead>
          <tr>
            <th
              data-key="Stage"
              className={getSortClass("Stage")}
              onClick={() => onSort("Stage")}
            >
              Stage
            </th>
            <th
              data-key="DateTime"
              className={getSortClass("DateTime")}
              onClick={() => onSort("DateTime")}
            >
              Date & Time
            </th>
            <th
              data-key="Team1"
              className={getSortClass("Team1")}
              onClick={() => onSort("Team1")}
            >
              Team 1
            </th>
            <th
              data-key="Team2"
              className={getSortClass("Team2")}
              onClick={() => onSort("Team2")}
            >
              Team 2
            </th>
            <th
              data-key="MatchNo"
              className={getSortClass("MatchNo")}
              onClick={() => onSort("MatchNo")}
            >
              Match #
            </th>
            <th
              data-key="Location"
              className={getSortClass("Location")}
              onClick={() => onSort("Location")}
            >
              Location
            </th>
            <th
              data-key="DayIST"
              className={getSortClass("DayIST")}
              onClick={() => onSort("DayIST")}
            >
              Day (IST)
            </th>
            <th
              data-key="Period"
              className={getSortClass("Period")}
              onClick={() => onSort("Period")}
            >
              Period
            </th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.MatchNo}>
              <td title={match.Stage}>{match.Stage}</td>
              <td title={formatDate(match)}>{formatDate(match)}</td>
              <td title={match.Team1}>
                <div className="team-cell">
                  {getFlagUrl(match.Team1) && (
                    <img
                      src={getFlagUrl(match.Team1)}
                      alt={`${match.Team1} flag`}
                      className="flag-icon"
                    />
                  )}
                  <span>{match.Team1}</span>
                </div>
              </td>
              <td title={match.Team2}>
                <div className="team-cell">
                  {getFlagUrl(match.Team2) && (
                    <img
                      src={getFlagUrl(match.Team2)}
                      alt={`${match.Team2} flag`}
                      className="flag-icon"
                    />
                  )}
                  <span>{match.Team2}</span>
                </div>
              </td>
              <td title={match.MatchNo}>{match.MatchNo}</td>
              <td title={match.Location}>{match.Location}</td>
              <td title={match.DayIST}>{match.DayIST}</td>
              <td title={match.Period}>{match.Period || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchTable;
