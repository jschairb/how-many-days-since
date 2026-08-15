import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = process.argv[2];
if (!source) throw new Error('Pass the exported Rivalry Lab snapshot path as the first argument.');
const snapshot = JSON.parse(readFileSync(resolve(source), 'utf8'));
if (snapshot.schemaVersion !== 'rivalry-lab-public-snapshot-v1') throw new Error('Source is not a supported public Rivalry Lab snapshot.');
if (!snapshot.ratings?.teamSeasons?.every((season) => season.teamId === 'ohio-state' || season.teamId === 'michigan')) throw new Error('Source snapshot includes teams outside the public contract.');
writeFileSync('src/data/rivalry-lab-snapshot.json', `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Synced ${snapshot.ratings.teamSeasons.length} team-seasons from ${resolve(source)}.`);
