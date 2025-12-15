import { getMatchByNumber } from "./bracketLogic";

// FIFA 2026 third-place qualifier positions
// The 8 best third-place teams are ranked and assigned to specific matches
const THIRD_PLACE_POSITIONS = {
  "3ABCDF": 0, // Best 3rd place team
  "3CDFGH": 1, // 2nd best 3rd place team
  "3CEFHI": 2, // 3rd best 3rd place team
  "3EHIJK": 3, // 4th best 3rd place team
  "3AEHIJ": 4, // 5th best 3rd place team
  "3BEFIJ": 5, // 6th best 3rd place team
  "3EFGIJ": 6, // 7th best 3rd place team
  "3DEIJL": 7, // 8th best 3rd place team
};

export const resolveTeamFromGroupCode = (
  teamCode,
  groupPredictions,
  thirdPlaceQualifiers
) => {
  if (!teamCode) return null;

  // If it's already a team name (not a code), return it
  if (!teamCode.match(/^\d[A-L]$/) && !teamCode.startsWith("3")) {
    return teamCode;
  }

  // Handle single group position codes like "1A", "2B"
  if (teamCode.match(/^\d[A-L]$/)) {
    const position = teamCode[0];
    const group = teamCode[1];

    if (!groupPredictions[group]) return null;

    if (position === "1") return groupPredictions[group].first;
    if (position === "2") return groupPredictions[group].second;
  }

  // Handle third-place qualifiers (e.g., "3ABCDF", "3CDFGH")
  if (teamCode.startsWith("3")) {
    const position = THIRD_PLACE_POSITIONS[teamCode];

    if (
      position !== undefined &&
      thirdPlaceQualifiers &&
      thirdPlaceQualifiers[position]
    ) {
      return thirdPlaceQualifiers[position];
    }

    // Return null if not yet selected
    return null;
  }

  return null;
};

// Resolve team from winner code (e.g., "W73" -> winner of match 73)
export const resolveTeamFromWinnerCode = (teamCode, predictions) => {
  if (!teamCode) return null;

  // If it's already a team name, return it
  if (!teamCode.startsWith("W") && !teamCode.startsWith("L")) {
    return teamCode;
  }

  // Handle winner codes like "W73", "W89", etc.
  if (teamCode.startsWith("W")) {
    const matchNo = parseInt(teamCode.substring(1));

    // Determine which stage this match belongs to
    if (matchNo >= 73 && matchNo <= 88) {
      return predictions.roundOf32?.[matchNo] || null;
    } else if (matchNo >= 89 && matchNo <= 96) {
      return predictions.roundOf16?.[matchNo] || null;
    } else if (matchNo >= 97 && matchNo <= 100) {
      return predictions.quarterfinals?.[matchNo] || null;
    } else if (matchNo >= 101 && matchNo <= 102) {
      return predictions.semifinals?.[matchNo] || null;
    }
  }

  // Handle loser codes like "L101", "L102" for third place match
  if (teamCode.startsWith("L")) {
    const matchNo = parseInt(teamCode.substring(1));

    // For third place match, we need to find the loser of semifinals
    if (matchNo === 101 || matchNo === 102) {
      const match = getMatchByNumber(matchNo);
      const winner = predictions.semifinals?.[matchNo];

      if (!winner || !match) return null;

      // Resolve the two teams in the semifinal
      const team1 = resolveTeamFromWinnerCode(match.Team1, predictions);
      const team2 = resolveTeamFromWinnerCode(match.Team2, predictions);

      // Return the loser (the team that didn't win)
      if (team1 === winner) return team2;
      if (team2 === winner) return team1;
    }
  }

  return null;
};

// Get resolved teams for a match
export const getResolvedMatch = (match, predictions) => {
  if (!match) return null;

  const { Team1, Team2, Stage } = match;

  let resolvedTeam1 = Team1;
  let resolvedTeam2 = Team2;

  // Round of 32: Resolve from group predictions
  if (Stage === "Round of 32") {
    resolvedTeam1 =
      resolveTeamFromGroupCode(
        Team1,
        predictions.groupStage,
        predictions.thirdPlaceQualifiers
      ) || Team1;
    resolvedTeam2 =
      resolveTeamFromGroupCode(
        Team2,
        predictions.groupStage,
        predictions.thirdPlaceQualifiers
      ) || Team2;
  }

  // Round of 16 and beyond: Resolve from previous round winners
  else if (
    Stage === "Round of 16" ||
    Stage === "Quarterfinals" ||
    Stage === "Semifinals" ||
    Stage === "Final" ||
    Stage === "Third Place"
  ) {
    resolvedTeam1 = resolveTeamFromWinnerCode(Team1, predictions) || Team1;
    resolvedTeam2 = resolveTeamFromWinnerCode(Team2, predictions) || Team2;
  }

  return {
    ...match,
    Team1: resolvedTeam1,
    Team2: resolvedTeam2,
    OriginalTeam1: Team1,
    OriginalTeam2: Team2,
  };
};
