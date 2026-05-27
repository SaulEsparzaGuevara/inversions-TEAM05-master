#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const TARGET_DIRS = [
  'backend/src/modules/audit',
  'backend/src/modules/analytics',
  'backend/src/routes/audit',
  'backend/src/observability',
  'frontend/src/features/audit',
];

const TARGET_EXTENSIONS = new Set(['.ts', '.tsx']);

function isFicLine(line) {
  return line.includes('FIC:');
}

function hasEmojiPrefix(line) {
  return line.includes('🧠 FIC:');
}

function hasLanguageTag(line) {
  return line.includes('(EN)') || line.includes('(ES)') || line.includes('(EN/ES)');
}

function isEN(line) {
  return line.includes('(EN)');
}

function isES(line) {
  return line.includes('(ES)');
}

function isENES(line) {
  return line.includes('(EN/ES)');
}

async function listFilesRecursive(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const output = [];

  for (const entry of entries) {
    const abs = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await listFilesRecursive(abs)));
      continue;
    }
    if (entry.isFile() && TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      output.push(abs);
    }
  }

  return output;
}

function findPair(lines, index, expectedTag) {
  const candidates = [index - 1, index + 1, index - 2, index + 2];
  for (const i of candidates) {
    if (i < 0 || i >= lines.length) continue;
    const line = lines[i];
    if (!hasEmojiPrefix(line)) continue;
    if (expectedTag === 'EN' && isEN(line)) return true;
    if (expectedTag === 'ES' && isES(line)) return true;
    if (isENES(line)) return true;
  }
  return false;
}

async function validateFile(absPath) {
  const relPath = path.relative(ROOT, absPath).replace(/\\/g, '/');
  const content = await fs.readFile(absPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    if (!isFicLine(line)) continue;

    if (!hasEmojiPrefix(line)) {
      issues.push(`${relPath}:${lineNumber} -> FIC comment must use emoji prefix '🧠 FIC:'`);
      continue;
    }

    if (!hasLanguageTag(line)) {
      issues.push(`${relPath}:${lineNumber} -> FIC comment must include language tag (EN), (ES), or (EN/ES)`);
      continue;
    }

    if (isEN(line) && !findPair(lines, i, 'ES')) {
      issues.push(`${relPath}:${lineNumber} -> EN FIC comment must have paired ES FIC comment nearby`);
    }

    if (isES(line) && !findPair(lines, i, 'EN')) {
      issues.push(`${relPath}:${lineNumber} -> ES FIC comment must have paired EN FIC comment nearby`);
    }
  }

  return issues;
}

async function main() {
  const allFiles = [];
  for (const relDir of TARGET_DIRS) {
    const absDir = path.join(ROOT, relDir);
    try {
      const stats = await fs.stat(absDir);
      if (!stats.isDirectory()) continue;
      allFiles.push(...(await listFilesRecursive(absDir)));
    } catch {
      // Directory may not exist in some branches; skip safely.
    }
  }

  const allIssues = [];
  for (const absPath of allFiles) {
    allIssues.push(...(await validateFile(absPath)));
  }

  if (allIssues.length > 0) {
    console.error('FIC comment convention validation failed:');
    for (const issue of allIssues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log(`FIC comment convention OK (${allFiles.length} files checked).`);
}

main().catch((error) => {
  console.error('Unexpected error while validating FIC comments:', error);
  process.exit(1);
});
