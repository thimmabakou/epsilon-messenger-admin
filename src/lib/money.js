// Fiches et contrats envoyés aux clients : les montants (écrits en FCFA dans les fiches) sont convertis
// dans la monnaie du pays du client, au taux du jour (même source que l'application : /api/rates).
//   • Congo et pays de la zone CFA : FCFA (rien ne change) ;
//   • RDC : francs congolais ET dollars ; France, Belgique : euros ; États-Unis : dollars ; Canada : dollars canadiens.
// Le pays du client vient de son compte (indicatif choisi à l'inscription).
const RATES_URL = "https://epsilon-messenger-app.pages.dev/api/rates";
const PEG = 655.957; // 1 € = 655,957 FCFA (fixe)

export const SYM = { XAF: "FCFA", CDF: "FC", EUR: "€", USD: "$ US", CAD: "$ CA" };
const NAME = { XAF: "francs CFA", CDF: "francs congolais", EUR: "euros", USD: "dollars américains", CAD: "dollars canadiens" };

// Pays → monnaies dans lesquelles écrire la fiche
export const CLIENT_ZONES = [
  { id: "XAF", label: "🇨🇬 Congo et zone franc CFA (FCFA)", curs: ["XAF"] },
  { id: "CDF", label: "🇨🇩 RDC (francs congolais + dollars)", curs: ["CDF", "USD"] },
  { id: "EUR", label: "🇫🇷 🇧🇪 France, Belgique, Europe (euros)", curs: ["EUR"] },
  { id: "USD", label: "🇺🇸 États-Unis (dollars)", curs: ["USD"] },
  { id: "CAD", label: "🇨🇦 Canada (dollars canadiens)", curs: ["CAD"] },
];
const BY_CC = { "243": "CDF", "33": "EUR", "32": "EUR", "1": "USD" };
const CCS = ["243", "33", "32", "1", "221", "223", "226", "227", "225", "237", "229", "235", "241"];
const LEN = { "243": 9, "33": 9, "32": 9, "1": 10, "221": 9, "223": 8, "226": 8, "227": 8, "225": 10, "237": 9, "229": 10, "235": 8, "241": 8 };

// Zone d'un client à partir de son compte (country_code, sinon le début de son numéro)
export function zoneOfProfile(p) {
  let cc = String(p?.country_code || "");
  if (!cc || cc === "242") {
    const d = String(p?.phone || "").replace(/\D/g, "");
    const hit = CCS.find((c) => d.startsWith(c) && d.length === c.length + LEN[c]);
    cc = hit || "242";
  }
  return BY_CC[cc] || "XAF";
}
export const zoneById = (id) => CLIENT_ZONES.find((z) => z.id === id) || CLIENT_ZONES[0];

// Taux du jour (unités pour 1 €) ; valeurs de secours du 15/10/2026
let rates = { EUR: 1, XAF: PEG, USD: 1.118, CAD: 1.59, CDF: 2597 };
let ratesDate = null;
let loading = null;
export function loadRates() {
  if (!loading) {
    loading = fetch(RATES_URL, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (j?.rates) {
        for (const k of ["USD", "CAD", "CDF"]) if (Number(j.rates[k]) > 0) rates[k] = Number(j.rates[k]);
        ratesDate = j.date || null;
      }
      return rates;
    }).catch(() => rates);
  }
  return loading;
}
export const ratesInfo = () => ({ rates: { ...rates }, date: ratesDate });

// Écriture d'un montant : 2 dec pour euro/dollar (4 si moins de 1 centime, ex. prix par minute), entier sinon
function fmt(v, cur) {
  const dec = cur === "XAF" || cur === "CDF" ? (v < 10 && v % 1 ? 2 : 0) : v < 0.1 ? 4 : 2;
  const s = v.toLocaleString("fr-FR", { minimumFractionDigits: dec && v % 1 ? Math.min(dec, 2) : 0, maximumFractionDigits: dec });
  return `${s} ${SYM[cur]}`;
}
export const fromFcfa = (fcfa, cur) => (fcfa / PEG) * rates[cur];

// Remplace chaque « 24 000 FCFA » d'un texte par son équivalent dans la (ou les) monnaie(s) du client
const AMOUNT = /(\d{1,3}(?:[   ]\d{3})+(?:,\d+)?|\d+(?:,\d+)?)\s?FCFA/g;
export function convertText(text, zoneId) {
  const z = zoneById(zoneId);
  if (typeof text !== "string" || z.id === "XAF") return text;
  return text.replace(AMOUNT, (_, num) => {
    const fcfa = Number(num.replace(/[   ]/g, "").replace(",", "."));
    const [a, b] = z.curs;
    const main = fmt(fromFcfa(fcfa, a), a);
    return b ? `${main} (${fmt(fromFcfa(fcfa, b), b)})` : main;
  });
}

// Toute une fiche (objet avec textes, tableaux…) convertie
export function convertDeep(obj, zoneId) {
  if (zoneById(zoneId).id === "XAF") return obj;
  if (typeof obj === "string") return convertText(obj, zoneId);
  if (Array.isArray(obj)) return obj.map((x) => convertDeep(x, zoneId));
  if (obj && typeof obj === "object") return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, k === "id" || k === "icon" ? v : convertDeep(v, zoneId)]));
  return obj;
}

// Phrase d'explication en tête d'une fiche convertie
export function conversionNote(zoneId) {
  const z = zoneById(zoneId);
  if (z.id === "XAF") return "";
  const per = (c) => (PEG / rates[c]).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  const parts = z.curs.map((c) => (c === "EUR" ? "1 € = 655,957 FCFA, taux fixe"
    : c === "CDF" ? `1 000 FC ≈ ${(1000 * PEG / rates.CDF).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA`
    : `1 ${SYM[c]} ≈ ${per(c)} FCFA`));
  const day = ratesDate ? new Date(ratesDate).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR");
  return `💱 Montants en ${z.curs.map((c) => NAME[c]).join(" et en ")}, au taux du ${day} (${parts.join(" ; ")}). Le prix de référence d'Epsilon est en francs CFA : le montant exact à payer est l'équivalent au taux du jour du paiement.`;
}
