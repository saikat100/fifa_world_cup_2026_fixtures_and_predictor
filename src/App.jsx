import { useState, useMemo } from "react";
import "./App.css";
import { matches } from "./data/matches";
import Controls from "./components/Controls";
import MatchTable from "./components/MatchTable";
import PredictionView from "./components/PredictionView";
import Footer from "./components/Footer";
import { PredictionProvider } from "./context/PredictionContext";

function App() {
  const [currentView, setCurrentView] = useState("schedule");
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [showIST, setShowIST] = useState(false);
  const [sortState, setSortState] = useState({ key: null, dir: 1 });

  // Compute unique filter options
  const stages = useMemo(
    () => [...new Set(matches.map((r) => r.Stage).filter(Boolean))].sort(),
    []
  );

  const locations = useMemo(
    () => [...new Set(matches.map((r) => r.Location).filter(Boolean))].sort(),
    []
  );

  // Filtering and Sorting
  const filteredMatches = useMemo(() => {
    let result = matches.filter((r) => {
      if (filterStage && r.Stage !== filterStage) return false;
      if (filterLocation && r.Location !== filterLocation) return false;
      if (search) {
        const s = (
          r.Team1 +
          " " +
          r.Team2 +
          " " +
          r.Location +
          " " +
          r.Stage
        ).toLowerCase();
        if (!s.includes(search.toLowerCase())) return false;
      }
      return true;
    });

    if (sortState.key) {
      const k = sortState.key;
      result.sort((a, b) => {
        let A, B;
        if (k === "DateTime") {
          A = showIST
            ? a.DateTimeIST || a.DateTimeEDT
            : a.DateTimeEDT || a.DateTimeIST;
          B = showIST
            ? b.DateTimeIST || b.DateTimeEDT
            : b.DateTimeEDT || b.DateTimeIST;
        } else {
          A = a[k] || "";
          B = b[k] || "";
        }

        const nA = Number(A);
        const nB = Number(B);

        if (!isNaN(nA) && !isNaN(nB)) return (nA - nB) * sortState.dir;
        return A.toString().localeCompare(B.toString()) * sortState.dir;
      });
    }

    return result;
  }, [search, filterStage, filterLocation, sortState, showIST]);

  const handleSort = (key) => {
    setSortState((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir * -1 };
      }
      return { key, dir: 1 };
    });
  };

  const handleReset = () => {
    setSearch("");
    setFilterStage("");
    setFilterLocation("");
    setShowIST(false);
    setSortState({ key: null, dir: 1 });
  };

  return (
    <PredictionProvider>
      <div className="app-container">
        <div className="view-tabs">
          <button
            className={`view-tab ${currentView === "schedule" ? "active" : ""}`}
            onClick={() => setCurrentView("schedule")}
          >
            📅 Schedule
          </button>
          <button
            className={`view-tab ${
              currentView === "predictions" ? "active" : ""
            }`}
            onClick={() => setCurrentView("predictions")}
          >
            🏆 Predictions
          </button>
        </div>

        {currentView === "schedule" ? (
          <div className="container">
            <div className="header">
              <div>
                <h1>FIFA Men's World Cup 2026 — Sortable Schedule</h1>
                <div className="small">
                  Interactive schedule generated from the uploaded spreadsheet.
                </div>
              </div>
              <Controls
                search={search}
                filterStage={filterStage}
                filterLocation={filterLocation}
                showIST={showIST}
                stages={stages}
                locations={locations}
                onSearch={setSearch}
                onFilterStage={setFilterStage}
                onFilterLocation={setFilterLocation}
                onToggleTZ={() => setShowIST((prev) => !prev)}
                onReset={handleReset}
              />
            </div>

            <MatchTable
              matches={filteredMatches}
              onSort={handleSort}
              sortState={sortState}
              showIST={showIST}
            />
          </div>
        ) : (
          <div className="container">
            <PredictionView />
          </div>
        )}
        <Footer />
      </div>
    </PredictionProvider>
  );
}

export default App;
