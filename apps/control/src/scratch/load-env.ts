import * as fs from "fs";
import * as path from "path";

// Load .env file variables manually for standalone script execution
const envPath = path.resolve(__dirname, "../../../../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const firstEquals = trimmed.indexOf("=");
    if (firstEquals !== -1) {
      const key = trimmed.substring(0, firstEquals).trim();
      const value = trimmed.substring(firstEquals + 1).trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = value;
    }
  });
}
