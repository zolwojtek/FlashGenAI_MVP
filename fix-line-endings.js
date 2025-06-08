import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File to process
const filePath = path.join(__dirname, "src", "types.ts");

// Read the file
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }

  // Replace all CRLF (\r\n) with LF (\n)
  const fixedContent = data.replace(/\r\n/g, "\n");

  // Write the file back
  fs.writeFile(filePath, fixedContent, "utf8", (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`);
      return;
    }
    console.log(`Successfully fixed line endings in ${filePath}`);
  });
});
