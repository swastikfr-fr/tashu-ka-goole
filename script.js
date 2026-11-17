const $ = s => document.querySelector(s), byId = Object.fromEntries(websites.map(s => [s.id, s]));
const { scores: PR, iterations } = computePageRank(websites, config), IN = computeInDegree(websites);
const allIds = websites.map(s => s.id), fmt = v => v.toFixed(4);
document.querySelectorAll(".logo span").forEach((s, i) => s.style.setProperty("--i", i));
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function count(el, to, dec) { // animated number
  const t0 = performance.now(); (function f(t) { const p = Math.min((t - t0) / 700, 1); el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec); if (p < 1) requestAnimationFrame(f); })(t0);
}
function card(id, rank, kind, other, delay) {
  const s = byId[id], isOld = kind === "old", diff = other - rank, changed = diff !== 0;
  const mv = isOld ? "" : `<span class="mv ${diff > 0 ? "up" : diff < 0 ? "dn" : "eq"}">${diff > 0 ? "▲ +" + diff : diff < 0 ? "▼ " + diff : "same rank"} vs Old</span>`;
  return `<li class="card ${rank === 1 ? "win" : ""} ${!isOld && changed ? "changed" : ""}" style="--d:${delay}">
    <div class="rk">${rank}</div><div><h3>${esc(s.name)}</h3><div class="u">https://${esc(s.url)}</div><p>${esc(s.description)}</p>${mv}</div>
    <div class="sc"><span data-v="${isOld ? PR[id] : IN[id]}" data-d="${isOld ? 4 : 0}">0</span><small>${isOld ? "PageRank" : "incoming links"}</small></div></li>`;
}
function search(q) {
  q = q.trim(); if (!q) return reset();
  $("#clear").hidden = false; $("#results").hidden = false; $("#loader").hidden = false;
  ["#stats", "#cols", "#why", "#empty"].forEach(s => $(s).hidden = true);
  setTimeout(() => { $("#loader").hidden = true; render(q); }, 650);
}
function render(q) {
  const m = matchSites(websites, q).map(s => s.id);
  $("#empty").hidden = m.length > 0; $("#cols").hidden = !m.length; $("#stats").hidden = !m.length; $("#why").hidden = !m.length;
  hit(m); if (!m.length) return;
  const old = rankIds(m, PR), nw = rankIds(m, IN), oR = id => old.indexOf(id) + 1, nR = id => nw.indexOf(id) + 1;
  const changed = m.filter(id => oR(id) !== nR(id)).length;
  $("#oldList").innerHTML = old.map((id, i) => card(id, i + 1, "old", 0, i)).join("");
  $("#newList").innerHTML = nw.map((id, i) => card(id, i + 1, "new", oR(id), i)).join("");
  document.querySelectorAll("[data-v]").forEach(e => count(e, +e.dataset.v, +e.dataset.d));
  $("#stats").innerHTML = [[m.length, "websites found for “" + esc(q) + "”"], [esc(byId[old[0]].name), "#1 under Old Google", 1], [esc(byId[nw[0]].name), "#1 under New Google", 1], [changed, "rankings changed"]]
    .map(([v, l, t]) => `<div class="stat"><b class="${t ? "t" : ""}">${v}</b><small>${l}</small></div>`).join("");
  const w = nw[0], ties = nw.filter(id => IN[id] === IN[w]).length > 1;
  $("#why").innerHTML = changed ? `<b>Why they differ:</b> PageRank rewards links from <em>important</em> pages; link popularity only counts links. Highlighted cards moved between the two lists.`
    : `<b>Same order here.</b> “${esc(byId[w].name)}” has ${IN[w]} incoming links and sits where PageRank also puts it. The two methods only split when a page has few links from strong pages, or many links from weak ones.${ties ? " Equal link counts keep dataset order." : ""}`;
}
function reset() { $("#q").value = ""; $("#clear").hidden = true; $("#results").hidden = true; hit([]); $("#q").focus(); }
$("#form").addEventListener("submit", e => { e.preventDefault(); search($("#q").value); });
$("#clear").addEventListener("click", reset);
document.addEventListener("keydown", e => { if (e.key === "/" && document.activeElement !== $("#q")) { e.preventDefault(); $("#q").focus(); } if (e.key === "Escape") reset(); });

/* ---- Network visualization ---- */
const svg = $("#net"), NS = "http://www.w3.org/2000/svg", pos = {}, W = 640, H = 400; let mode = "pr", matched = [];
websites.forEach((s, i) => { const a = i / websites.length * 2 * Math.PI - Math.PI / 2; pos[s.id] = [W / 2 + 230 * Math.cos(a), H / 2 + 140 * Math.sin(a)]; });
const radius = id => mode === "pr" ? 12 + PR[id] / Math.max(...Object.values(PR)) * 20 : 12 + IN[id] / Math.max(1, ...Object.values(IN)) * 20;
function mk(t, a, p) { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; }
function drawNet() {
  svg.innerHTML = '<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>';
  const g = mk("g", {}, svg), edges = [];
  websites.forEach(s => cleanGraph([s, ...websites.filter(x => x !== s)])[0].forEach(t => {
    const [x1, y1] = pos[s.id], [x2, y2] = pos[t], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    const r = radius(t) + 4, ex = x2 - dx / L * r, ey = y2 - dy / L * r;
    const e = mk("line", { class: "e", x1, y1, x2: ex, y2: ey, "marker-end": "url(#ar)", style: "color:var(--mute)" }, g); e.dataset.f = s.id; e.dataset.t = t; edges.push(e);
  }));
  websites.forEach((s, i) => {
    const n = mk("g", { class: "n", tabindex: 0, transform: `translate(${pos[s.id]})`, "aria-label": `${s.name}: ${IN[s.id]} incoming links, PageRank ${fmt(PR[s.id])}` }, g); n.dataset.id = s.id;
    mk("circle", { r: radius(s.id), fill: ["#4285f4", "#ea4335", "#fbbc05", "#34a853", "#7b61ff", "#ff8a3d"][i % 6] }, n);
    mk("text", { y: radius(s.id) + 15, "text-anchor": "middle" }, n).textContent = s.name;
    const on = () => { svg.classList.add("dim"); n.classList.add("hl"); edges.forEach(e => { if (e.dataset.t === s.id) { e.classList.add("hl"); g.querySelector(`.n[data-id="${e.dataset.f}"]`).classList.add("hl"); } });
      const t = $("#tip"); t.hidden = false; t.textContent = `${s.name} — ${IN[s.id]} incoming link${IN[s.id] === 1 ? "" : "s"} · PageRank ${fmt(PR[s.id])}`; };
    const off = () => { svg.classList.remove("dim"); g.querySelectorAll(".hl").forEach(x => x.classList.remove("hl")); $("#tip").hidden = true; };
    ["mouseenter", "focus"].forEach(v => n.addEventListener(v, on)); ["mouseleave", "blur"].forEach(v => n.addEventListener(v, off));
  });
  hit(matched);
}
function hit(ids) { matched = ids; svg.querySelectorAll(".n").forEach(n => n.classList.toggle("hit", ids.includes(n.dataset.id))); }
document.querySelectorAll(".seg").forEach(b => b.addEventListener("click", () => { mode = b.dataset.m; document.querySelectorAll(".seg").forEach(x => x.classList.toggle("on", x === b)); drawNet(); }));
drawNet();

/* ---- Developer checks ---- */
(function () {
  const top = rankIds(allIds, IN)[0], ok = top === expectedNewAlgorithmWinner, exists = !!byId[expectedNewAlgorithmWinner], msgs = [];
  if (!exists) msgs.push(`<p class="bad">⚠ expectedNewAlgorithmWinner "${esc(expectedNewAlgorithmWinner)}" is not in data.js.</p>`);
  else if (!ok) { msgs.push(`<p class="bad">⚠ Expected winner "${esc(expectedNewAlgorithmWinner)}" has ${IN[expectedNewAlgorithmWinner]} incoming links, but "${esc(top)}" ranks #1 with ${IN[top]}. Edit linksTo in data.js.</p>`); console.warn("Expected winner is not ranked first."); }
  else msgs.push(`<p class="ok">✔ "${esc(byId[top].name)}" is #1 under New Google, as expected.</p>`);
  const ties = allIds.filter(id => id !== top && IN[id] === IN[top]); if (ties.length) msgs.push(`<p class="bad">⚠ Tied for #1 with: ${ties.join(", ")}</p>`);
  msgs.push(`<p>PageRank converged in ${iterations} iterations (damping ${config.damping}). Sum of scores: ${Object.values(PR).reduce((a, b) => a + b).toFixed(4)}.</p>`);
  $("#dbg").innerHTML = msgs.join("");
})();
