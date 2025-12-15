// Map team names to ISO 3166-1 alpha-2 country codes
export const getCountryCode = (teamName) => {
  const countryMap = {
    Mexico: "MX",
    "South Africa": "ZA",
    "South Korea": "KR",
    Canada: "CA",
    "United States": "US",
    Paraguay: "PY",
    Qatar: "QA",
    Switzerland: "CH",
    Brazil: "BR",
    Morocco: "MA",
    Haiti: "HT",
    Scotland: "GB-SCT",
    Australia: "AU",
    Germany: "DE",
    Curacao: "CW",
    Netherlands: "NL",
    Japan: "JP",
    "Ivory Coast": "CI",
    Ecuador: "EC",
    Tunisia: "TN",
    Spain: "ES",
    "Cape Verde": "CV",
    Belgium: "BE",
    Egypt: "EG",
    "Saudi Arabia": "SA",
    Uruguay: "UY",
    Iran: "IR",
    "New Zealand": "NZ",
    France: "FR",
    Senegal: "SN",
    Norway: "NO",
    Argentina: "AR",
    Algeria: "DZ",
    Austria: "AT",
    Jordan: "JO",
    Portugal: "PT",
    England: "GB-ENG",
    Croatia: "HR",
    Ghana: "GH",
    Panama: "PA",
    Uzbekistan: "UZ",
    Colombia: "CO",
  };

  return countryMap[teamName] || null;
};

// Get flag URL using flagcdn.com API
export const getFlagUrl = (teamName) => {
  const code = getCountryCode(teamName);
  if (!code) return null;

  // Handle special cases for England and Scotland
  if (code === "GB-ENG") return "https://flagcdn.com/w40/gb-eng.png";
  if (code === "GB-SCT") return "https://flagcdn.com/w40/gb-sct.png";

  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};
