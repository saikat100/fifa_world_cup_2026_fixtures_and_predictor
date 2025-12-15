import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "module";
import * as path from "path";
import * as fs from "fs";

const require = createRequire(import.meta.url);
const xlsx = require("xlsx");

// Custom plugin to handle Excel updates
const championUpdater = () => ({
  name: "champion-updater",
  configureServer(server) {
    server.middlewares.use("/api/update-champion", async (req, res, next) => {
      console.log("Received request for /api/update-champion");
      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const { team } = JSON.parse(body);
            console.log(`Updating win count for team: ${team}`);

            // Use process.cwd() for reliable path resolution
            const filePath = path.resolve(
              process.cwd(),
              "src/assets/champion_counter.xlsx"
            );
            const jsonPath = path.resolve(
              process.cwd(),
              "src/data/championHistory.json"
            );

            console.log(`Target Excel Path: ${filePath}`);

            if (!fs.existsSync(filePath)) {
              throw new Error(`Excel file not found at ${filePath}`);
            }

            // Read the file
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet);

            // Update the count
            const teamIndex = data.findIndex(
              (row) => row["Team Name"] === team
            );
            if (teamIndex !== -1) {
              const newCount = (data[teamIndex]["Number of win"] || 0) + 1;
              data[teamIndex]["Number of win"] = newCount;
              console.log(`New count for ${team}: ${newCount}`);

              // Write back to Excel
              const newWorksheet = xlsx.utils.json_to_sheet(data);
              workbook.Sheets[sheetName] = newWorksheet;
              xlsx.writeFile(workbook, filePath);

              // Also update the JSON cache so the frontend sees it on reload
              fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: true,
                  newCount: newCount,
                })
              );
            } else {
              console.error(`Team ${team} not found via helper`);
              res.statusCode = 404;
              res.end(JSON.stringify({ error: "Team not found" }));
            }
          } catch (error) {
            console.error("Error in champion-updater:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else {
        next();
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), championUpdater()],
});
