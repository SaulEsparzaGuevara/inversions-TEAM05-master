const fs = require('fs');
const path = '.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-tasks.md';
let content = fs.readFileSync(path, 'utf8');

const closedTasks = ["T030", "T054", "T106", "T107", "T108", "T109", "T110", "T111", "T112", "T113", "T114", "T115", "T116", "T117", "T118", "T119", "T120", "T121", "T173", "T185", "T186"];

for (const t of closedTasks) {
    const rx = new RegExp(`^- \\[ \\] (${t})`, 'm');
    content = content.replace(rx, '- [x] $1');
}

fs.writeFileSync(path, content, 'utf8');
