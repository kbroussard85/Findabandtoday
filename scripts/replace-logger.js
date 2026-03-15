const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      if (fullPath.replace(/\\/g, '/').includes('src/lib/logger.ts')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.match(/console\.(log|warn|error|info)/)) {
        const original = content;
        content = content.replace(/console\.log/g, "logger.info");
        content = content.replace(/console\.(warn|error|info)/g, "logger.$1");
        
        if (content !== original) {
          if (!content.includes("import { logger }")) {
            const importStmt = "import { logger } from '@/lib/logger';\n";
            const lastImportIndex = content.lastIndexOf("\nimport ");
            
            if (lastImportIndex !== -1) {
              const newlineIndex = content.indexOf("\n", lastImportIndex + 1);
              content = content.slice(0, newlineIndex + 1) + importStmt + content.slice(newlineIndex + 1);
            } else {
              if (content.startsWith("'use client'") || content.startsWith('"use client"')) {
                const newlineIndex = content.indexOf("\n");
                content = content.slice(0, newlineIndex + 1) + "\n" + importStmt + content.slice(newlineIndex + 1);
              } else {
                content = importStmt + content;
              }
            }
          }
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log("Updated: " + fullPath);
        }
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
