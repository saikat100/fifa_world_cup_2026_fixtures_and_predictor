import { createRequire } from "module";
const require = createRequire(import.meta.url);
const xlsx = require("xlsx");
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(
  __dirname,
  "src",
  "assets",
  "champion_counter.xlsx"
);
const jsonPath = path.join(__dirname, "src", "data", "championHistory.json");

try {
  console.log("Reading file from:", excelPath);
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  console.log("Processed data:", data);

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log("Data written to:", jsonPath);
} catch (error) {
  console.error("Error processing excel file:", error);
}
