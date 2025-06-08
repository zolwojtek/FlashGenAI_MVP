import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File to process
const filePath = path.join(__dirname, "src", "db", "database.types.ts");

// Read the file
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }

  // Replace all CRLF (\r\n) with LF (\n)
  let fixedContent = data.replace(/\r\n/g, "\n");

  // Fix the Json type declaration to be on a single line
  fixedContent = fixedContent.replace(
    /export type Json =\n\s*\|\s*string\n\s*\|\s*number\n\s*\|\s*boolean\n\s*\|\s*null\n\s*\|\s*{\s*\[key:\s*string\]:\s*Json\s*\|\s*undefined\s*}\n\s*\|\s*Json\[\]/g,
    "export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];"
  );

  // Write the file back
  fs.writeFile(filePath, fixedContent, "utf8", (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`);
      return;
    }
    console.log(`Successfully fixed line endings and format in ${filePath}`);
  });
});
