const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function main() {
  const repoRoot = path.join(__dirname, '..');
  console.log(`Repo Root: ${repoRoot}`);
  
  // Get tracked files via git
  const stdout = execSync('git ls-files', { cwd: repoRoot }).toString();
  const files = stdout.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  console.log(`Found ${files.length} tracked files to touch...`);

  for (const relativePath of files) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (!fs.existsSync(absolutePath)) continue;
    
    const stats = fs.statSync(absolutePath);
    if (stats.isDirectory()) continue;
    
    // Read file content
    const contentBuffer = fs.readFileSync(absolutePath);
    
    // We will append a space or newline depending on the file type
    let newContent;
    if (relativePath.endsWith('.ico') || relativePath.endsWith('.png')) {
      // For binary files, we can append a null byte or a space byte
      newContent = Buffer.concat([contentBuffer, Buffer.from([32])]); // space byte
    } else if (relativePath.endsWith('.js') || relativePath.endsWith('.mjs')) {
      newContent = Buffer.concat([contentBuffer, Buffer.from('\n// modified\n')]);
    } else if (relativePath.endsWith('.sql')) {
      newContent = Buffer.concat([contentBuffer, Buffer.from('\n-- modified\n')]);
    } else if (relativePath.endsWith('.svg')) {
      newContent = Buffer.concat([contentBuffer, Buffer.from('\n<!-- modified -->\n')]);
    } else {
      newContent = Buffer.concat([contentBuffer, Buffer.from(' ')]);
    }
    
    fs.writeFileSync(absolutePath, newContent);
    console.log(`Touched: ${relativePath}`);
  }
  
  console.log('All files touched successfully.');
}

main();

// modified

// modified

// modified

// modified
