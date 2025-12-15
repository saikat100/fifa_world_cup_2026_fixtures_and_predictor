import { matches } from "../data/matches";

// Get all teams in a specific group
export const getGroupTeams = (groupLetter) => {
  const groupMatches = matches.filter(
    (m) => m.Stage === `Group ${groupLetter}`
  );
  const teams = new Set();

  groupMatches.forEach((match) => {
    teams.add(match.Team1);
    teams.add(match.Team2);
  });

  return Array.from(teams);
};

// Get all group letters (A-L)
export const getAllGroups = () => {
  const groups = new Set();
  matches.forEach((match) => {
    if (match.Stage.startsWith("Group ")) {
      const letter = match.Stage.split(" ")[1];
      groups.add(letter);
    }
  });
  return Array.from(groups).sort();
};

// Calculate third-place qualifiers
// Top 4 third-place teams advance based on points (we'll use a simple selection for now)
export const calculateThirdPlaceQualifiers = (groupPredictions) => {
  const thirdPlaceTeams = [];

  Object.keys(groupPredictions).forEach((group) => {
    if (groupPredictions[group].third) {
      thirdPlaceTeams.push({
        group,
        team: groupPredictions[group].third,
      });
    }
  });

  // Return first 8 third-place teams (user can select which ones qualify)
  return thirdPlaceTeams.slice(0, 8);
};

// Map Round of 32 team codes to actual teams based on group predictions
export const resolveRoundOf32Team = (teamCode, groupPredictions) => {
  if (!teamCode) return null;

  // Handle group position codes like "1A", "2B", "3ABCD"
  if (teamCode.match(/^\d[A-L]$/)) {
    const position = teamCode[0];
    const group = teamCode[1];

    if (!groupPredictions[group]) return null;

    if (position === "1") return groupPredictions[group].first;
    if (position === "2") return groupPredictions[group].second;
    if (position === "3") return groupPredictions[group].third;
  }

  // Handle third-place qualifiers (e.g., "3ABCD")
  if (teamCode.startsWith("3")) {
    const groups = teamCode.substring(1).split("");
    // This would need user selection from available third-place teams
    return null; // Placeholder - will be selected by user
  }

  // If it's already a team name, return it
  return teamCode;
};

// Get the match data for a specific match number
export const getMatchByNumber = (matchNo) => {
  return matches.find((m) => m.MatchNo === matchNo);
};

// Get all matches for a specific stage
export const getMatchesByStage = (stage) => {
  return matches.filter((m) => m.Stage === stage);
};

// Determine next round match based on current match
export const getNextRoundMatch = (currentMatchNo) => {
  // Round of 32 (73-88) → Round of 16 (89-96)
  if (currentMatchNo >= 73 && currentMatchNo <= 88) {
    const r32Index = currentMatchNo - 73;
    return 89 + Math.floor(r32Index / 2);
  }

  // Round of 16 (89-96) → Quarterfinals (97-100)
  if (currentMatchNo >= 89 && currentMatchNo <= 96) {
    const r16Index = currentMatchNo - 89;
    return 97 + Math.floor(r16Index / 2);
  }

  // Quarterfinals (97-100) → Semifinals (101-102)
  if (currentMatchNo >= 97 && currentMatchNo <= 100) {
    const qfIndex = currentMatchNo - 97;
    return 101 + Math.floor(qfIndex / 2);
  }

  // Semifinals (101-102) → Final (104) or Third Place (103)
  if (currentMatchNo === 101 || currentMatchNo === 102) {
    return 104; // Final
  }

  return null;
};

// Check if all group predictions are complete
export const areGroupPredictionsComplete = (
  groupPredictions,
  thirdPlaceQualifiers
) => {
  const allGroups = getAllGroups();

  // Check if all groups have 1st and 2nd place selected
  const allFirstAndSecondSelected = allGroups.every(
    (group) => groupPredictions[group]?.first && groupPredictions[group]?.second
  );

  // Check if exactly 8 third-place qualifiers are selected
  const hasEightThirdPlaceQualifiers =
    thirdPlaceQualifiers && thirdPlaceQualifiers.length === 8;

  return allFirstAndSecondSelected && hasEightThirdPlaceQualifiers;
};
