/**
 * Global Patch Script — Task Status Sync for Diana-Tracked Tasks.
 * ===============================================================
 *
 * Updates the task tracking file used by Diana (the project orchestration AI)
 * to reflect which tasks have been completed in the TEAM-05 implementation.
 *
 * This script reads the canonical task file at:
 *   .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-tasks.md
 *
 * And converts matching task IDs from unchecked [ ] to checked [x].
 *
 * The task IDs being patched are all TEAM-05 tasks:
 *   - T030: Broker integration (canonical)
 *   - T054: Strategy engine (canonical)
 *   - T106–T121: Institutional analysis and coverage strategies
 *   - T173: Strategy output standard (transversal)
 *   - T185–T186: Test suites
 *
 * Script de Parche Global — Sincronización de Estado de Tareas para Seguimiento por Diana.
 * =========================================================================================
 *
 * Actualiza el archivo de seguimiento de tareas usado por Diana (la IA de orquestación del proyecto)
 * para reflejar qué tareas se han completado en la implementación del TEAM-05.
 */

const fs = require('fs');

// Path to the Diana task tracking file
const path = '.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-tasks.md';

// Read the current file content
let content = fs.readFileSync(path, 'utf8');

// List of task IDs completed by TEAM-05 TurboPapus
const closedTasks = [
  "T030", "T054", "T106", "T107", "T108", "T109", "T110",
  "T111", "T112", "T113", "T114", "T115", "T116", "T117",
  "T118", "T119", "T120", "T121", "T173", "T185", "T186"
];

// For each task, find the unchecked entry and mark it as checked
for (const t of closedTasks) {
    const rx = new RegExp(`^- \\[ \\] (${t})`, 'm');
    content = content.replace(rx, '- [x] $1');
}

// Write the patched content back
fs.writeFileSync(path, content, 'utf8');
