// Graphiques et carte des statistiques (SVG dessiné à la taille réelle de la zone)
import { useEffect, useRef } from "react";
import { fmt } from "../lib/format";

const SVGNS = "http://www.w3.org/2000/svg";
function el(tag, attrs, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function niceStep(v) { const p = Math.pow(10, Math.floor(Math.log10(v || 1))); const m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
const stepOf = (v) => Math.max(1, niceStep(v / 4)); // comptages entiers : jamais de demi-graduation
function niceMax(v) { if (!(v > 0)) v = 4; v = Math.max(v, 4); const st = stepOf(v); return Math.ceil(v / st) * st; }
function niceTicks(max) { const st = stepOf(max); const out = []; for (let t = 0; t <= max + 1e-9; t += st) out.push(t); return out; }

function tip() { let t = document.getElementById("viz-tip"); if (!t) { t = document.createElement("div"); t.id = "viz-tip"; document.body.appendChild(t); } return t; }
export function showTip(x, y, title, rows) {
  const t = tip(); t.innerHTML = "";
  const h = document.createElement("div"); h.className = "t"; h.textContent = title; t.appendChild(h);
  rows.forEach((r) => {
    const row = document.createElement("div"); row.className = "r";
    const i = document.createElement("i"); i.style.background = r.color; row.appendChild(i);
    const b = document.createElement("b"); b.textContent = r.value; row.appendChild(b);
    if (r.name) { const sp = document.createElement("span"); sp.textContent = r.name; row.appendChild(sp); }
    t.appendChild(row);
  });
  t.style.display = "block";
  const w = t.offsetWidth, hh = t.offsetHeight;
  t.style.left = Math.min(window.innerWidth - w - 8, x + 14) + "px";
  t.style.top = Math.max(8, y - hh - 10) + "px";
}
export function hideTip() { const t = document.getElementById("viz-tip"); if (t) t.style.display = "none"; }

function drawLineChart(box, labels, series) {
  box.innerHTML = "";
  if (!labels.length) return;
  const W = box.clientWidth, H = box.clientHeight, m = { l: 46, r: 14, t: 12, b: 26 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const max = niceMax(Math.max(...series.flatMap((s) => s.values)));
  const svg = el("svg", { width: W, height: H, role: "img" }, box);
  const x = (i) => m.l + (labels.length === 1 ? iw / 2 : i * iw / (labels.length - 1));
  const y = (v) => m.t + ih - v / max * ih;
  niceTicks(max).forEach((v, k) => {
    const yy = y(v);
    el("line", { x1: m.l, x2: W - m.r, y1: yy, y2: yy, stroke: k ? "var(--viz-grid)" : "var(--viz-axis)", "stroke-width": 1 }, svg);
    el("text", { x: m.l - 8, y: yy + 4, "text-anchor": "end" }, svg).textContent = fmt(v);
  });
  const step = Math.ceil(labels.length / 6);
  labels.forEach((l, i) => {
    if (i % step === 0 || i === labels.length - 1) {
      if (i !== labels.length - 1 && labels.length - 1 - i < step / 2) return;
      el("text", { x: x(i), y: H - 6, "text-anchor": "middle" }, svg).textContent = l;
    }
  });
  series.forEach((s) => {
    el("path", { d: s.values.map((v, i) => (i ? "L" : "M") + x(i) + " " + y(v)).join(""), fill: "none", stroke: s.color, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    const li = s.values.length - 1;
    el("circle", { cx: x(li), cy: y(s.values[li]), r: 4, fill: s.color, stroke: "var(--white)", "stroke-width": 2 }, svg);
  });
  const cross = el("line", { y1: m.t, y2: m.t + ih, stroke: "var(--viz-axis)", "stroke-width": 1, visibility: "hidden" }, svg);
  const dots = series.map((s) => el("circle", { r: 4, fill: s.color, stroke: "var(--white)", "stroke-width": 2, visibility: "hidden" }, svg));
  const hit = el("rect", { x: m.l, y: m.t, width: iw, height: ih, fill: "transparent", tabindex: 0 }, svg);
  const at = (i) => {
    cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("visibility", "visible");
    dots.forEach((d, k) => { d.setAttribute("cx", x(i)); d.setAttribute("cy", y(series[k].values[i])); d.setAttribute("visibility", "visible"); });
    const r = box.getBoundingClientRect();
    showTip(r.left + x(i), r.top + Math.min(...series.map((s) => y(s.values[i]))), labels[i], series.map((s) => ({ color: s.color, value: fmt(s.values[i]), name: s.name })));
  };
  hit.addEventListener("pointermove", (e) => {
    const r = box.getBoundingClientRect(); const px = e.clientX - r.left;
    at(Math.max(0, Math.min(labels.length - 1, Math.round((px - m.l) / iw * (labels.length - 1)))));
  });
  hit.addEventListener("pointerleave", () => { cross.setAttribute("visibility", "hidden"); dots.forEach((d) => d.setAttribute("visibility", "hidden")); hideTip(); });
  hit.addEventListener("focus", () => at(labels.length - 1));
  hit.addEventListener("blur", hideTip);
}

function drawColumnChart(box, labels, values, color, name) {
  box.innerHTML = "";
  if (!labels.length) return;
  const W = box.clientWidth, H = box.clientHeight, m = { l: 46, r: 10, t: 18, b: 26 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const max = niceMax(Math.max(...values));
  const svg = el("svg", { width: W, height: H }, box);
  const y = (v) => m.t + ih - v / max * ih;
  niceTicks(max).forEach((v, k) => {
    const yy = y(v);
    el("line", { x1: m.l, x2: W - m.r, y1: yy, y2: yy, stroke: k ? "var(--viz-grid)" : "var(--viz-axis)", "stroke-width": 1 }, svg);
    el("text", { x: m.l - 8, y: yy + 4, "text-anchor": "end" }, svg).textContent = fmt(v);
  });
  const band = iw / values.length, bw = Math.max(2, Math.min(24, band - 2));
  const step = Math.ceil(labels.length / 6);
  const imax = values.indexOf(Math.max(...values));
  values.forEach((v, i) => {
    const cx = m.l + band * i + band / 2, top = y(v), bottom = m.t + ih, x0 = cx - bw / 2, rr = Math.max(0, Math.min(4, bw / 2, bottom - top));
    const bar = el("path", { d: `M${x0} ${bottom}V${top + rr}Q${x0} ${top} ${x0 + rr} ${top}H${x0 + bw - rr}Q${x0 + bw} ${top} ${x0 + bw} ${top + rr}V${bottom}Z`, fill: color }, svg);
    if (i === imax && v > 0) el("text", { x: cx, y: top - 5, "text-anchor": "middle", class: "lbl" }, svg).textContent = fmt(v);
    if ((i % step === 0 && !(i !== labels.length - 1 && labels.length - 1 - i < step / 2)) || i === labels.length - 1) el("text", { x: cx, y: H - 6, "text-anchor": "middle" }, svg).textContent = labels[i];
    const hit = el("rect", { x: m.l + band * i, y: m.t, width: band, height: ih, fill: "transparent", tabindex: 0 }, svg);
    const on = () => { bar.setAttribute("opacity", ".75"); const r = box.getBoundingClientRect(); showTip(r.left + cx, r.top + top, labels[i], [{ color, value: fmt(v), name }]); };
    const off = () => { bar.removeAttribute("opacity"); hideTip(); };
    hit.addEventListener("pointerenter", on); hit.addEventListener("pointerleave", off); hit.addEventListener("focus", on); hit.addEventListener("blur", off);
  });
}

function drawBarChart(box, items, color, name) {
  box.innerHTML = "";
  if (!items.length) return;
  const W = box.clientWidth, H = box.clientHeight, lw = 118, rw = 64;
  const iw = W - lw - rw, band = H / items.length, bh = Math.min(18, band - 8);
  const max = Math.max(1, ...items.map((i) => i[1]));
  const svg = el("svg", { width: W, height: H }, box);
  el("line", { x1: lw, x2: lw, y1: 0, y2: H, stroke: "var(--viz-axis)", "stroke-width": 1 }, svg);
  items.forEach(([label, v], i) => {
    const cy = band * i + band / 2, w = Math.max(3, v / max * iw), rr = Math.min(4, w);
    el("text", { x: lw - 10, y: cy + 4, "text-anchor": "end", class: "cat" }, svg).textContent = label;
    const bar = el("path", { d: `M${lw} ${cy - bh / 2}H${lw + w - rr}Q${lw + w} ${cy - bh / 2} ${lw + w} ${cy - bh / 2 + rr}V${cy + bh / 2 - rr}Q${lw + w} ${cy + bh / 2} ${lw + w - rr} ${cy + bh / 2}H${lw}Z`, fill: color }, svg);
    el("text", { x: lw + w + 8, y: cy + 4, class: "lbl" }, svg).textContent = fmt(v);
    const hit = el("rect", { x: 0, y: band * i, width: W, height: band, fill: "transparent", tabindex: 0 }, svg);
    const on = () => { bar.setAttribute("opacity", ".75"); const r = box.getBoundingClientRect(); showTip(r.left + lw + w, r.top + cy - 10, label, [{ color, value: fmt(v), name }]); };
    const off = () => { bar.removeAttribute("opacity"); hideTip(); };
    hit.addEventListener("pointerenter", on); hit.addEventListener("pointerleave", off); hit.addEventListener("focus", on); hit.addEventListener("blur", off);
  });
}

// Redessine quand les données changent ou quand la fenêtre change de taille
function useDraw(draw, deps) {
  const ref = useRef();
  useEffect(() => {
    const run = () => ref.current && draw(ref.current);
    run();
    let t; const onResize = () => { clearTimeout(t); t = setTimeout(run, 150); };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t); hideTip(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

const Empty = ({ show }) => show ? <p className="map-hint" style={{ textAlign: "center", marginTop: -90 }}>Pas encore de données</p> : null;

export function ColumnChart({ labels, values, name, height }) {
  const ref = useDraw((b) => drawColumnChart(b, labels, values, "var(--s1)", name), [JSON.stringify(labels), JSON.stringify(values)]);
  return <><div className="viz-chart" ref={ref} style={height ? { height } : undefined} /><Empty show={!values.some((v) => v > 0)} /></>;
}
export function LineChart({ labels, series }) {
  const ref = useDraw((b) => drawLineChart(b, labels, series), [JSON.stringify(labels), JSON.stringify(series)]);
  return <><div className="viz-chart" ref={ref} /><Empty show={!series.some((s) => s.values.some((v) => v > 0))} /></>;
}
export function BarChart({ items, name, height }) {
  const ref = useDraw((b) => drawBarChart(b, items, "var(--s1)", name), [JSON.stringify(items)]);
  return <><div className="viz-chart" ref={ref} style={{ height: height || 180 }} /><Empty show={!items.some((i) => i[1] > 0)} /></>;
}

export function VizTable({ headers, rows }) {
  return (
    <details className="viz-table"><summary>Voir le tableau</summary>
      <table><thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{j ? fmt(c) : c}</td>)}</tr>)}</tbody></table>
    </details>
  );
}

/* ---------- Carte : zoom fluide Afrique → Congo → ville ---------- */
const GEO = {
  africa: [[-5.9,35.8],[-1,35.1],[3,36.8],[10.3,36.9],[10.1,33.9],[13.2,32.9],[19,30.3],[20.1,32.1],[24,32],[29.9,31.2],[32.3,31.3],[34.2,28],[35,24],[37.2,21],[38.6,18],[39.7,15.5],[41.7,13.4],[43.3,12.5],[44.5,10.4],[51.2,11.8],[51,10.4],[49,6],[46,2],[42.5,-0.6],[40.2,-2.3],[39.2,-4.7],[39.3,-6.8],[40.4,-10.5],[40.6,-14.5],[34.8,-19.8],[35.5,-24],[32.9,-25.9],[32.4,-28.5],[31,-29.9],[28,-33],[25.6,-34],[20,-34.8],[18.4,-34.2],[17.9,-32],[15,-27],[14.5,-22.9],[11.8,-17.3],[12.3,-13],[13.2,-8.8],[12.2,-6],[11.8,-4.8],[9.3,-1.5],[9.4,0.4],[9.8,2.5],[9.6,3.9],[8.5,4.5],[6,4.3],[4.5,6.3],[2.4,6.4],[-2,4.8],[-4,5.2],[-7.5,4.4],[-9.5,5.5],[-12.5,7.5],[-13.3,9.5],[-15,11],[-16.7,12.5],[-17.4,14.7],[-16.5,16.5],[-16,19.5],[-17,21],[-14.5,26],[-12.5,28],[-9.8,29.5],[-9.6,31.5],[-8,33.6],[-6.8,34]],
  madagascar: [[49.3,-12],[50.4,-15.5],[48.8,-20],[47.1,-24.9],[45.2,-25.5],[43.7,-23],[44,-19.8],[44.3,-16.2],[46.3,-15.7],[48,-13.5]],
  congo: [[12.99,-4.78],[12.62,-4.44],[12.32,-4.61],[11.91,-5.04],[11.09,-3.98],[11.86,-3.43],[11.48,-2.77],[11.82,-2.51],[12.5,-2.39],[12.58,-1.95],[13.11,-2.43],[13.99,-2.47],[14.3,-1.99],[14.43,-1.33],[14.32,-0.56],[13.84,0.04],[14.28,1.2],[14.03,1.4],[13.28,1.31],[13.0,1.83],[13.08,2.27],[14.34,2.23],[15.15,1.96],[15.94,1.73],[16.01,2.27],[16.54,3.2],[17.13,3.73],[17.81,3.56],[18.45,3.5],[18.39,2.9],[18.09,2.37],[17.9,1.74],[17.77,0.86],[17.83,0.29],[17.66,-0.06],[17.64,-0.42],[17.52,-0.74],[16.87,-1.23],[16.41,-1.74],[15.97,-2.71],[16.01,-3.54],[15.75,-3.86],[15.17,-4.34],[14.58,-4.97],[14.21,-4.79],[14.14,-4.51],[13.6,-4.5],[13.26,-4.88]],
};
const VIEWBOXES = { afrique: [-19, -38, 74, 76], congo: [10.2, -4.4, 9.2, 10.4] };

export function StatsMap({ level, city, countries, cities, onZoom }) {
  const svgRef = useRef();
  const vbRef = useRef(null);
  const target = () => {
    if (level === "ville") { const c = cities.find((x) => x.name === city); if (c) return [c.lon - 1.7, -c.lat - 1.2, 3.4, 2.4]; }
    return VIEWBOXES[level === "ville" ? "congo" : level];
  };
  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    svg.innerHTML = "";
    const poly = (pts, attrs) => el("path", Object.assign({ d: pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + (-p[1])).join("") + "Z", "vector-effect": "non-scaling-stroke", "stroke-linejoin": "round" }, attrs), svg);
    poly(GEO.africa, { fill: "var(--map-land)", stroke: "var(--map-stroke)", "stroke-width": 1 });
    poly(GEO.madagascar, { fill: "var(--map-land)", stroke: "var(--map-stroke)", "stroke-width": 1 });
    const congo = poly(GEO.congo, { fill: "var(--map-focus)", stroke: "var(--map-focus-stroke)", "stroke-width": 1.5 });
    if (level === "afrique") { congo.style.cursor = "pointer"; congo.addEventListener("click", () => onZoom("congo")); }

    const items = (level === "afrique" ? countries : cities).filter((i) => i.lon != null && i.users > 0);
    const maxU = Math.max(1, ...items.map((i) => i.users));
    const marks = items.map((it) => {
      const g = el("g", { class: "map-bubble" + (level === "ville" && it.name === city ? " sel" : ""), tabindex: 0, role: "button", "aria-label": `${it.name} : ${fmt(it.users)} utilisateurs` }, svg);
      const c = el("circle", { class: "b", cx: it.lon, cy: -it.lat }, g);
      const showLabel = level === "afrique" ? it.key === "CG" : (it.users >= maxU * 0.4 || (level === "ville" && it.name === city));
      const t = showLabel ? el("text", { x: it.lon, y: -it.lat }, g) : null;
      if (t) t.textContent = it.name;
      const act = () => { hideTip(); if (level === "afrique") { if (it.key === "CG") onZoom("congo"); } else onZoom("ville", it.name); };
      g.addEventListener("click", act);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } });
      const tipIt = (e) => showTip(e.clientX, e.clientY, it.name, [{ color: "var(--s1)", value: fmt(it.users), name: "utilisateurs" }]);
      g.addEventListener("pointerenter", tipIt); g.addEventListener("pointermove", tipIt); g.addEventListener("pointerleave", hideTip);
      return { it, c, t, rpx: Math.max(6, (level === "afrique" ? 15 : 24) * Math.sqrt(it.users / maxU)) };
    });
    const apply = (vb) => {
      svg.setAttribute("viewBox", vb.join(" "));
      const r = svg.getBoundingClientRect(); const k = Math.min(r.width / vb[2], r.height / vb[3]) || 1;
      marks.forEach((mk) => {
        mk.c.setAttribute("r", mk.rpx / k); mk.c.setAttribute("stroke-width", 2);
        if (mk.t) { mk.t.setAttribute("font-size", 12 / k); mk.t.setAttribute("x", mk.it.lon + (mk.rpx + 5) / k); mk.t.setAttribute("y", -mk.it.lat + 4 / k); mk.t.style.strokeWidth = (3 / k) + "px"; }
      });
    };
    const to = target(), from = vbRef.current || to;
    const t0 = performance.now(), dur = from.join() === to.join() ? 0 : 650;
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    let raf;
    const frame = (now) => {
      const p = dur ? Math.min(1, (now - t0) / dur) : 1, e = ease(p);
      apply(from.map((f, i) => f + (to[i] - f) * e));
      if (p < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    vbRef.current = to;
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, city, JSON.stringify(countries), JSON.stringify(cities)]);
  return <svg className="map-svg" ref={svgRef} role="img" aria-label="Carte de la répartition des utilisateurs" />;
}
