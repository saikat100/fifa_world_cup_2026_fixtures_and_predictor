import React from "react";

const Controls = ({
  search,
  filterStage,
  filterLocation,
  showIST,
  stages,
  locations,
  onSearch,
  onFilterStage,
  onFilterLocation,
  onToggleTZ,
  onReset,
}) => {
  return (
    <div className="controls">
      <input
        id="search"
        className="input"
        placeholder="Search team or location"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <select
        id="filterStage"
        className="select"
        value={filterStage}
        onChange={(e) => onFilterStage(e.target.value)}
      >
        <option value="">All Stages</option>
        {stages.map((stage) => (
          <option key={stage} value={stage}>
            {stage}
          </option>
        ))}
      </select>
      <select
        id="filterLocation"
        className="select"
        value={filterLocation}
        onChange={(e) => onFilterLocation(e.target.value)}
      >
        <option value="">All Locations</option>
        {locations.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
      <button id="tzToggle" className="btn" onClick={onToggleTZ}>
        {showIST ? "Show EDT" : "Show IST"}
      </button>
      <button id="reset" className="btn" onClick={onReset}>
        Reset
      </button>
    </div>
  );
};

export default Controls;
