// Statistiques : carte interactive et graphiques, à partir des vraies données de la base
import { useState } from "react";
import { rpc } from "../lib/supabase";
import { useLoad, Loading } from "../lib/admin";
import { CITY_COORDS, COUNTRY_COORDS } from "../lib/constants";
import { fmt } from "../lib/format";
import { ScreenTitle } from "../components/common";
import { BarChart, ColumnChart, LineChart, StatsMap, VizTable } from "../components/charts";

const PERIODS = { "7j": ["7 derniers jours", 7], "30j": ["30 derniers jours", 30], lancement: ["Depuis le lancement", 3650] };
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const p2 = (n) => String(n).padStart(2, "0");

// Construit une série continue (jours ou mois) à partir des inscriptions par jour
function buildSeries(daily, period, total) {
  const byDay = {};
  (daily || []).forEach((r) => { byDay[r.day] = r.n; });
  let labels = [], values = [];
  if (period === "lancement") {
    const byMonth = {};
    (daily || []).forEach((r) => { const k = r.day.slice(0, 7); byMonth[k] = (byMonth[k] || 0) + r.n; });
    const keys = Object.keys(byMonth).sort();
    if (keys.length) {
      let [y, m] = keys[0].split("-").map(Number);
      const now = new Date();
      while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth() + 1)) {
        const k = `${y}-${p2(m)}`;
        labels.push(MONTHS[m - 1] + (y !== now.getFullYear() ? " " + String(y).slice(2) : ""));
        values.push(byMonth[k] || 0);
        m++; if (m > 12) { m = 1; y++; }
      }
    }
  } else {
    const days = PERIODS[period][1];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
      labels.push(`${p2(d.getDate())}/${p2(d.getMonth() + 1)}`);
      values.push(byDay[key] || 0);
    }
  }
  const sum = values.reduce((a, b) => a + b, 0);
  let run = Math.max(0, total - sum);
  const cumul = values.map((v) => (run += v));
  return { labels, values, cumul };
}

export default function Stats() {
  const [period, setPeriod] = useState("30j");
  const [level, setLevel] = useState("afrique");
  const [city, setCity] = useState(null);
  const zoom = (lv, c) => { setLevel(lv); setCity(c || null); };

  const all = useLoad(() => rpc("stats_summary", { p_days: PERIODS[period][1] }), [period]);
  const zone = useLoad(() => city ? rpc("stats_summary", { p_days: PERIODS[period][1], p_city: city }) : Promise.resolve(null), [period, city]);
  if (!all.data) return (<><ScreenTitle eyebrow="TABLEAU DE BORD" title="Statistiques" /><Loading error={all.error} /></>);

  const s = all.data;
  const byCountry = s.by_country || [];
  const congoUsers = (byCountry.find((c) => c.country === "CG") || {}).users || 0;
  const z = level === "ville" && zone.data ? zone.data : s;
  const zoneName = level === "ville" ? city : level === "congo" ? "Congo" : "Toutes zones";
  const zoneTotal = level === "congo" ? congoUsers : z.total_users;

  const series = buildSeries(z.signups_daily, period, zoneTotal);
  const newUsers = z.new_users;
  const ages = ["18–24 ans", "25–34 ans", "35–44 ans", "45 ans et +"].map((r) => [r, ((z.by_age || []).find((a) => a.range === r) || {}).users || 0]);

  const countries = byCountry.map((c) => ({ key: c.country, name: COUNTRY_COORDS[c.country]?.name || c.country || "Inconnu", lon: COUNTRY_COORDS[c.country]?.lon, lat: COUNTRY_COORDS[c.country]?.lat, users: c.users }));
  const cities = (s.by_city || []).map((c) => ({ name: c.city, lon: CITY_COORDS[c.city]?.[0], lat: CITY_COORDS[c.city]?.[1], users: c.users }));
  const rank = level === "afrique" ? countries : cities;
  const maxRank = Math.max(1, ...rank.map((r) => r.users));

  return (
    <div className="stats-root">
      <ScreenTitle eyebrow="TABLEAU DE BORD" title="Statistiques" />
      <div className="stats-filters">
        <span className="label">Période</span>
        {Object.entries(PERIODS).map(([k, [l]]) => <button key={k} className={"pill" + (period === k ? " active" : "")} onClick={() => setPeriod(k)}>{l}</button>)}
      </div>
      <nav className="crumbs" aria-label="Zone">
        <button className={"crumb" + (level === "afrique" ? " current" : "")} onClick={() => zoom("afrique")}>Afrique</button>
        {level !== "afrique" && <><span>›</span><button className={"crumb" + (level === "congo" ? " current" : "")} onClick={() => zoom("congo")}>Congo</button></>}
        {level === "ville" && <><span>›</span><span className="crumb current">{city}</span></>}
      </nav>

      <section className="stats-hero">
        <div className="hero-card">
          <span className="k">Utilisateurs inscrits · {zoneName}</span>
          <span className="v">{fmt(zoneTotal)}</span>
          <span className="d">▲ +{fmt(newUsers)} sur la période</span>
        </div>
        <div className="tiles">
          <div className="tile"><span className="k">Nouveaux inscrits</span><span className="v">{fmt(newUsers)}</span><span className="d">{PERIODS[period][0].toLowerCase()}</span></div>
          <div className="tile"><span className="k">Utilisateurs actifs</span><span className="v">{fmt(z.active_users)}</span><span className="d">{z.total_users ? Math.round(z.active_users / z.total_users * 100) : 0} % des inscrits (7 jours)</span></div>
          <div className="tile"><span className="k">Appels au service client</span><span className="v">{fmt(s.support_calls)}</span><span className="d">sur la période</span></div>
          <div className="tile"><span className="k">Publications marketplace</span><span className="v">{fmt(s.market_products)}</span><span className="d">sur la période</span></div>
          <div className="tile"><span className="k">{level === "afrique" ? "Pays couverts" : "Villes actives"}</span><span className="v">{level === "afrique" ? countries.length : cities.length}</span><span className="d">{level === "afrique" ? "selon les inscriptions" : "au Congo"}</span></div>
          {level === "ville" && <div className="tile"><span className="k">Part du Congo</span><span className="v">{congoUsers ? Math.round(zoneTotal / congoUsers * 100) : 0} %</span><span className="d">des utilisateurs congolais</span></div>}
        </div>
      </section>

      <section className="map-layout">
        <div className="map-card">
          <h2>Où sont les utilisateurs ?</h2>
          <p className="viz-sub">{level === "afrique" ? "Cliquez sur le Congo pour zoomer" : level === "congo" ? "Cliquez sur une ville pour voir ses statistiques" : `Statistiques de ${city} — cliquez sur une autre ville ou revenez au Congo`}</p>
          <StatsMap level={level} city={city} countries={countries} cities={cities} onZoom={zoom} />
          <p className="map-hint">Carte simplifiée. Taille des cercles = nombre d'utilisateurs.</p>
        </div>
        <div className="map-card">
          <h2>{level === "afrique" ? "Utilisateurs par pays" : "Utilisateurs par ville"}</h2>
          <p className="viz-sub">{level === "afrique" ? "Cliquez sur un pays" : "Cliquez sur une ville"}</p>
          <div className="rank-list">
            {rank.length === 0 && <p className="reports-empty">Pas encore d'utilisateurs.</p>}
            {rank.map((r) => (
              <button key={r.name} className={"rank-row" + (level === "ville" && r.name === city ? " sel" : "")}
                onClick={() => level === "afrique" ? (r.key === "CG" && zoom("congo")) : zoom("ville", r.name)}>
                <span>{r.name}</span>
                <span className="rank-track"><span className="rank-fill" style={{ width: `${Math.max(2, r.users / maxRank * 100)}%` }} /></span>
                <span className="rank-val">{fmt(r.users)}</span>
              </button>
            ))}
          </div>
          {level === "afrique" && <p className="map-hint" style={{ marginTop: 10 }}>Le zoom détaillé est disponible pour le Congo. Les autres pays s'ajouteront quand l'application y sera lancée.</p>}
        </div>
      </section>

      <section className="viz-grid">
        <div className="viz-card">
          <div className="viz-head"><div><h2>Nouveaux inscrits</h2><p className="viz-sub">Par {period === "lancement" ? "mois" : "jour"} · {zoneName}</p></div></div>
          <ColumnChart labels={series.labels} values={series.values} name="nouveaux inscrits" />
          <VizTable headers={["Période", "Nouveaux inscrits"]} rows={series.labels.map((l, i) => [l, series.values[i]])} />
        </div>
        <div className="viz-card">
          <div className="viz-head"><div><h2>Évolution des utilisateurs</h2><p className="viz-sub">Inscrits au total</p></div></div>
          <LineChart labels={series.labels} series={[{ name: "Inscrits", color: "var(--s1)", values: series.cumul }]} />
          <VizTable headers={["Période", "Inscrits"]} rows={series.labels.map((l, i) => [l, series.cumul[i]])} />
        </div>
        <div className="viz-card">
          <div className="viz-head"><div><h2>Utilisateurs par tranche d'âge</h2><p className="viz-sub">{zoneName}</p></div></div>
          <BarChart items={ages} name="utilisateurs" height={180} />
          <VizTable headers={["Tranche d'âge", "Utilisateurs"]} rows={ages} />
        </div>
        <div className="viz-card">
          <div className="viz-head"><div><h2>Appels et contenus partagés</h2><p className="viz-sub">Messagerie de l'application</p></div></div>
          <p className="map-hint" style={{ padding: "30px 10px", textAlign: "center" }}>Ces graphiques s'afficheront quand l'application Epsilon Messenger enverra ses statistiques d'appels et de partages. Les conversations privées, elles, ne sont jamais lues.</p>
        </div>
      </section>
    </div>
  );
}
