import { writeFileSync } from 'node:fs';

// The Internet Archive's `college-football-media-guides` collection holds
// scanned program media guides. Both rivalry programs are in it under a stable
// identifier shape — `ohio-state-football-2023-media-guide`, sometimes with a
// scan-revision suffix — so the season is read off the identifier rather than
// off the item's `date`, which records when the scan was uploaded.
const COLLECTION = 'college-football-media-guides';
const SEASON_PATTERN = /^(ohio-state|michigan)-football-(\d{4})-media-guide/;
const TEAM_IDS = { 'ohio-state': 'ohio-state', michigan: 'michigan' };
// The collection runs to a few thousand items, so each program is fetched on
// its own narrow identifier query. `michigan-football-` is anchored to keep
// Michigan State, which shares the prefix up to the hyphen, out of the results.
const QUERIES = ['identifier:ohio-state-football-*media-guide*', 'identifier:michigan-football-*media-guide*'];
const PAGE_SIZE = 200;

const search = async (query) => {
  const docs = [];
  for (let page = 1; ; page += 1) {
    const url = new URL('https://archive.org/advancedsearch.php');
    url.searchParams.set('q', `collection:${COLLECTION} AND mediatype:texts AND (${query})`);
    url.searchParams.append('fl[]', 'identifier');
    url.searchParams.append('fl[]', 'title');
    url.searchParams.set('rows', String(PAGE_SIZE));
    url.searchParams.set('page', String(page));
    url.searchParams.set('output', 'json');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Internet Archive search failed with ${response.status}.`);
    const body = await response.json();
    docs.push(...(body.response?.docs ?? []));
    if (docs.length >= (body.response?.numFound ?? 0) || !body.response?.docs?.length) return docs;
  }
};

const docs = (await Promise.all(QUERIES.map(search))).flat();
if (!docs.length) throw new Error('Internet Archive returned no items for the media guide collection.');

const guides = [];
for (const doc of docs) {
  const match = SEASON_PATTERN.exec(doc.identifier);
  if (!match) continue;
  guides.push({ teamId: TEAM_IDS[match[1]], season: Number(match[2]), identifier: doc.identifier, title: String(doc.title) });
}

// One guide per team-season. A reissued scan publishes a second identifier for
// a season already covered, and the pages only ever embed one.
const seen = new Set();
const deduped = guides
  .sort((a, b) => a.teamId.localeCompare(b.teamId) || a.season - b.season || a.identifier.localeCompare(b.identifier))
  .filter((guide) => {
    const key = `${guide.teamId}:${guide.season}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

if (!deduped.some((guide) => guide.teamId === 'ohio-state') || !deduped.some((guide) => guide.teamId === 'michigan')) {
  throw new Error('Internet Archive returned guides for only one program.');
}

writeFileSync('src/data/media-guides.json', `${JSON.stringify({ collection: COLLECTION, syncedAt: new Date().toISOString(), guides: deduped }, null, 2)}\n`);
const counts = deduped.reduce((totals, guide) => ({ ...totals, [guide.teamId]: (totals[guide.teamId] ?? 0) + 1 }), {});
console.log(`Synced ${deduped.length} media guides (Ohio State ${counts['ohio-state']}, Michigan ${counts.michigan}) from the ${COLLECTION} collection.`);
