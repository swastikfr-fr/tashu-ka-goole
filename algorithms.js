/* Pure ranking logic (no DOM) — also testable in Node. */
function cleanGraph(sites) {
  const ids = new Set(sites.map(s => s.id));
  return sites.map(s => [...new Set(s.linksTo || [])].filter(t => ids.has(t) && t !== s.id));
}
/* OLD GOOGLE: iterative PageRank. PR(p) = (1-d)/N + d * sum(PR(q)/out(q)) over q linking to p.
   Dangling pages (no out-links) spread their rank evenly. */
function computePageRank(sites, { damping: d, maxIterations, tolerance }) {
  const n = sites.length, out = cleanGraph(sites), idx = new Map(sites.map((s, i) => [s.id, i]));
  let pr = Array(n).fill(1 / n), iterations = 0;
  for (; iterations < maxIterations; iterations++) {
    const next = Array(n).fill((1 - d) / n);
    let dangling = 0;
    out.forEach((links, i) => {
      if (!links.length) dangling += pr[i];
      else links.forEach(t => next[idx.get(t)] += d * pr[i] / links.length);
    });
    for (let i = 0; i < n; i++) next[i] += d * dangling / n;
    const delta = next.reduce((a, v, i) => a + Math.abs(v - pr[i]), 0);
    pr = next;
    if (delta < tolerance) { iterations++; break; }
  }
  return { scores: Object.fromEntries(sites.map((s, i) => [s.id, pr[i]])), iterations };
}
/* NEW GOOGLE: in-degree = number of distinct sites linking in. */
function computeInDegree(sites) {
  const deg = Object.fromEntries(sites.map(s => [s.id, 0]));
  cleanGraph(sites).forEach(l => l.forEach(t => deg[t]++));
  return deg;
}
function rankIds(ids, scores) { // descending; ties keep dataset order
  return ids.map((id, i) => ({ id, i })).sort((a, b) => scores[b.id] - scores[a.id] || a.i - b.i).map(x => x.id);
}
function matchSites(sites, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return sites.filter(s => {
    const hay = [s.name, s.description, s.category, ...(s.keywords || [])].join(" ").toLowerCase();
    return terms.every(t => hay.includes(t));
  });
}
if (typeof module !== "undefined") module.exports = { computePageRank, computeInDegree, rankIds, matchSites };
