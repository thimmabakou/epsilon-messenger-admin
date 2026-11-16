// Calendrier international : jours fériés communs, puis le calendrier légal de chaque pays d'Epsilon Business,
// avec les liens pour vérifier de temps en temps (même calendrier que les écoles dans l'application).
import { useState } from "react";
import { HOLIDAYS, SOURCES, legalHolidays, holNames } from "../lib/holidays";
import { BIZ_COUNTRIES } from "../lib/bizLegal";
import { Note, Pills, ScreenTitle } from "../components/common";

const N = holNames("fr");
const dt = (k) => new Date(k + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const COUNTRIES = Object.keys(HOLIDAYS).filter((c) => c !== "intl");
const nameOf = (c) => { const x = BIZ_COUNTRIES.find((b) => b.c === c); return x ? `${x.flag} ${x.names.fr}` : c.toUpperCase(); };

function Table({ country, year }) {
  const rows = Object.entries(legalHolidays(country, year)).sort();
  return (
    <table className="activity-table"><tbody>
      {rows.map(([k, h]) => <tr key={k}><td style={{ width: "45%", textTransform: "capitalize" }}>{dt(k)}</td><td><b>{N[h] || h}</b></td></tr>)}
    </tbody></table>
  );
}
function Links({ country }) {
  return (SOURCES[country] || []).map(([l, u]) => <div key={u} style={{ fontSize: 13, margin: "3px 0" }}>🔗 <a href={u} target="_blank" rel="noreferrer">{l}</a></div>);
}

export default function Calendar() {
  const y0 = new Date().getFullYear();
  const [year, setYear] = useState(y0);
  const [country, setCountry] = useState("cg");
  const H = HOLIDAYS[country];
  return (<>
    <ScreenTitle eyebrow="EPSILON BUSINESS · ÉCOLES" title="Calendrier international" />
    <Note icon="📅">Jours fériés utilisés par l'application (registre des présences des écoles, fiches individuelles). Pâques, l'Ascension, la Pentecôte, le Vendredi saint et les fêtes « n-ième lundi » (États-Unis, Canada) sont recalculés chaque année. Les fêtes musulmanes (et le Vodoun au Bénin) changent chaque année : chaque école les ajoute à la date annoncée. Vérifiez les liens de temps en temps ; une erreur se corrige dans le fichier src/lib/schoolHolidays.js de l'application (et sa copie src/lib/holidays.js ici).</Note>
    <Pills style={{ margin: "12px 0" }} value={year} onChange={setYear} options={[y0 - 1, y0, y0 + 1].map((y) => [y, String(y)])} />

    <h3 style={{ margin: "16px 0 6px" }}>🌍 Jours fériés communs — calendrier international ({year})</h3>
    <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>Utilisé pour tout pays dont la liste légale n'est pas encore dans Epsilon ; l'école retire ce qui n'est pas férié chez elle (« Classe ce jour-là »).</div>
    <Table country="intl" year={year} />

    <h3 style={{ margin: "22px 0 6px" }}>🗺️ Calendrier légal de chaque pays ({year})</h3>
    <Pills style={{ margin: "8px 0", flexWrap: "wrap" }} value={country} onChange={setCountry} options={COUNTRIES.map((c) => [c, nameOf(c)])} />
    <Table country={country} year={year} />
    {H?.islamic && <div style={{ fontSize: 13, margin: "6px 0" }}>☪️ Plus les fêtes musulmanes du pays (date annoncée chaque année par le gouvernement).</div>}
    {H?.vodoun && <div style={{ fontSize: 13, margin: "6px 0" }}>Plus la fête du Vodoun (janvier, date fixée chaque année).</div>}
    <div style={{ marginTop: 8 }}><b style={{ fontSize: 13 }}>Vérifier ce pays :</b><Links country={country} /></div>

    <h3 style={{ margin: "22px 0 6px" }}>🔗 Liens de vérification — tous les pays</h3>
    {["intl", ...COUNTRIES].map((c) => (
      <div key={c} style={{ margin: "8px 0" }}><b style={{ fontSize: 13 }}>{c === "intl" ? "🌍 Calendrier international" : nameOf(c)}</b><Links country={c} /></div>
    ))}
  </>);
}
