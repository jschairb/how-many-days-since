import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = process.argv[2];
if (!source) throw new Error('Pass the exported Rivalry Lab snapshot path as the first argument.');
const raw = readFileSync(resolve(source), 'utf8');
const snapshot = JSON.parse(raw);
if (snapshot.schemaVersion !== 'rivalry-lab-public-snapshot-v2') throw new Error('Source is not a supported public Rivalry Lab snapshot.');
if (!snapshot.ratings?.teamSeasons?.every((season) => season.teamId === 'ohio-state' || season.teamId === 'michigan')) throw new Error('Source snapshot includes teams outside the public contract.');
if (!Number.isInteger(snapshot.model?.simulationRunCount) || snapshot.model.simulationRunCount < 1) throw new Error('Source snapshot is missing the harness-selected simulation run count.');
if (!snapshot.simulationInputs || typeof snapshot.simulationInputs !== 'object') throw new Error('Source snapshot is missing the simulationInputs block.');
for (const [key, entry] of Object.entries(snapshot.simulationInputs)) {
  for (const field of ['possessionsPerGame', 'turnoverRatePerDrive', 'scoringRateMultiplier', 'touchdownShare']) {
    if (!Number.isFinite(entry?.[field])) throw new Error(`Source snapshot simulation input ${key}.${field} is not a finite number.`);
  }
}
if (!Array.isArray(snapshot.coverage)) throw new Error('Source snapshot is missing the coverage block.');
for (const privateKey of ['payload_json', 'source_identifier', 'sourceIdentifier', 'teamGameStats', 'game_drives']) {
  if (raw.includes(privateKey)) throw new Error(`Source snapshot leaks private warehouse data (${privateKey}).`);
}
writeFileSync('src/data/rivalry-lab-snapshot.json', `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Synced ${snapshot.ratings.teamSeasons.length} team-seasons at run count ${snapshot.model.simulationRunCount} from ${resolve(source)}.`);
