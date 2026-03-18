const fs = require("fs");
const path = require("path");

const rootDir = "./";

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // 🎯 ONLY exact replacements (safe)

  // text color
  content = content.replace(/text-\[#0f2d5e\]/g, "text-blue-50");

  // background
  content = content.replace(/bg-\[#0f2d5e\]/g, "bg-blue-50");

  // border
  content = content.replace(/border-\[#0f2d5e\]/g, "border-blue-50");

  fs.writeFileSync(filePath, content, "utf8");
  console.log("✔ Updated:", filePath);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(file)) return;
      walkDir(fullPath);
    } else {
      if (/\.(js|jsx|ts|tsx)$/.test(fullPath)) {
        processFile(fullPath);
      }
    }
  });
}

walkDir(rootDir);

console.log("\n✅ DONE: Only #0f2d5e replaced safely");