import { readFileSync } from 'fs';
import { join } from 'path';

function loadJson(name: string) {
  const p = join(__dirname, name);
  return JSON.parse(readFileSync(p, 'utf-8'));
}

export const fixtureA = loadJson('fixture-A-nominal.json');
export const fixtureB = loadJson('fixture-B-stress-tail.json');
export const fixtureC = loadJson('fixture-C-low-liquidity.json');

export default { fixtureA, fixtureB, fixtureC };
