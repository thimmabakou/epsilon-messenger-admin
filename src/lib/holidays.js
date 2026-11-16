// COPIE de epsilon-messenger-app/src/lib/schoolHolidays.js (même calendrier que l'application) — modifier les deux ensemble.
// Calendrier de l'école : jours fériés légaux du pays (dates fixes, fêtes liées à Pâques et « n-ième jour du mois », calculées)
// et congés propres à l'école (vacances, fêtes musulmanes annoncées chaque année, journées pédagogiques).
// Règles : ["MM-JJ", clé] date fixe · ["E", décalage, clé] jours après Pâques · ["N", mois, jour de semaine (0 = dim.), rang (-1 = dernier), clé].
// Sources (vérifiées en novembre 2026) : Congo — Wikipédia « Public holidays in the Republic of the Congo », Le Petit Journal ;
// Côte d'Ivoire — décret n° 2001-22 du 18 janvier 2001 ; France — service-public.gouv.fr (F1251) ; Belgique — SPF Emploi
// (emploi.belgique.be) ; États-Unis — OPM (5 U.S.C. 6103) ; Canada — fêtes statutaires communes à toutes les provinces (HR Insider) ;
// RDC — vacances-scolaires-gouv.com ; Cameroun, Gabon, Tchad, Bénin, Burkina Faso, Mali, Niger — HolidayDB 2026 ; Sénégal — Le Petit Journal Dakar.
// Les fêtes musulmanes (et la fête du Vodoun au Bénin) changent de date chaque année : l'école les ajoute à la date annoncée.
const EASTER3 = [["E", 1, "easterMon"], ["E", 39, "ascension"], ["E", 50, "whitMon"]];
export const HOLIDAYS = {
  intl: { rules: [["01-01", "newYear"], ["05-01", "labour"], ["08-15", "assumption"], ["11-01", "allSaints"], ["12-25", "xmas"], ...EASTER3], intl: true },
  cg: { rules: [["01-01", "newYear"], ["05-01", "labour"], ["06-10", "recon"], ["08-15", "natCg"], ["11-01", "allSaints"], ["11-28", "republic"], ["12-25", "xmas"], ...EASTER3] },
  ci: { rules: [["01-01", "newYear"], ["05-01", "labour"], ["08-07", "indep"], ["08-15", "assumption"], ["11-01", "allSaints"], ["11-15", "peace"], ["12-25", "xmas"], ...EASTER3], islamic: true },
  cd: { rules: [["01-01", "newYear"], ["01-04", "martyrsCd"], ["01-16", "kabila"], ["01-17", "lumumba"], ["04-06", "kimbangu"], ["05-01", "labour"], ["05-17", "liberation"], ["06-30", "indep"], ["08-01", "parents"], ["08-02", "genocideCd"], ["12-25", "xmas"]] },
  cm: { rules: [["01-01", "newYear"], ["02-11", "youth"], ["E", -2, "goodFri"], ["05-01", "labour"], ["E", 39, "ascension"], ["05-20", "national"], ["08-15", "assumption"], ["12-25", "xmas"]], islamic: true },
  ga: { rules: [["01-01", "newYear"], ["04-17", "women"], ["05-01", "labour"], ["08-15", "assumption"], ["08-16", "indep"], ["08-17", "indep2"], ["08-30", "liberationGa"], ["11-01", "allSaints"], ["12-25", "xmas"], ...EASTER3], islamic: true },
  td: { rules: [["01-01", "newYear"], ["03-08", "womenDay"], ["E", 1, "easterMon"], ["05-01", "labour"], ["08-11", "indep"], ["11-01", "allSaints"], ["11-28", "republic"], ["12-01", "freedom"], ["12-25", "xmas"]], islamic: true },
  bj: { rules: [["01-01", "newYear"], ["05-01", "labour"], ["08-01", "indep"], ["08-15", "assumption"], ["11-01", "allSaints"], ["12-25", "xmas"], ...EASTER3], islamic: true, vodoun: true },
  bf: { rules: [["01-01", "newYear"], ["01-03", "uprising"], ["03-08", "womenDay"], ["E", 1, "easterMon"], ["05-01", "labour"], ["E", 39, "ascension"], ["05-15", "customs"], ["08-05", "national"], ["08-15", "assumption"], ["10-31", "martyrs"], ["11-01", "allSaints"], ["12-11", "indep"], ["12-25", "xmas"]], islamic: true },
  ml: { rules: [["01-01", "newYear"], ["01-20", "army"], ["03-26", "martyrs"], ["E", 1, "easterMon"], ["05-01", "labour"], ["05-25", "africa"], ["09-22", "indep"], ["12-25", "xmas"]], islamic: true },
  ne: { rules: [["01-01", "newYear"], ["03-26", "refoundation"], ["E", 1, "easterMon"], ["04-24", "concord"], ["05-01", "labour"], ["07-26", "cnsp"], ["08-03", "indep"], ["12-18", "republic"], ["12-25", "xmas"]], islamic: true },
  sn: { rules: [["01-01", "newYear"], ["04-04", "indep"], ["05-01", "labour"], ["08-15", "assumption"], ["11-01", "allSaints"], ["12-25", "xmas"], ...EASTER3], islamic: true },
  fr: { rules: [["01-01", "newYear"], ["05-01", "labour"], ["05-08", "victory45"], ["07-14", "national"], ["08-15", "assumption"], ["11-01", "allSaints"], ["11-11", "armistice"], ["12-25", "xmas"], ...EASTER3] },
  be: { rules: [["01-01", "newYear"], ["05-01", "labour"], ["07-21", "national"], ["08-15", "assumption"], ["11-01", "allSaints"], ["11-11", "armistice"], ["12-25", "xmas"], ...EASTER3] },
  us: { rules: [["01-01", "newYear"], ["N", 1, 1, 3, "mlk"], ["N", 2, 1, 3, "washington"], ["N", 5, 1, -1, "memorial"], ["06-19", "juneteenth"], ["07-04", "indep"], ["N", 9, 1, 1, "labourUs"], ["N", 10, 1, 2, "columbus"], ["11-11", "veterans"], ["N", 11, 4, 4, "thanksgiving"], ["12-25", "xmas"]] },
  ca: { rules: [["01-01", "newYear"], ["E", -2, "goodFri"], ["07-01", "canada"], ["N", 9, 1, 1, "labourUs"], ["12-25", "xmas"]] },
};
// Noms des fêtes propres à un pays (les fêtes communes sont dans schoolText → hol)
const NAMES = {
  newYear: ["Jour de l'An", "New Year's Day"], labour: ["Fête du Travail", "Labour Day"], recon: ["Fête de la Réconciliation", "Reconciliation Day"],
  natCg: ["Fête nationale (Indépendance)", "National Day (Independence)"], allSaints: ["Toussaint", "All Saints' Day"], republic: ["Proclamation de la République", "Republic Day"],
  xmas: ["Noël", "Christmas"], assumption: ["Assomption", "Assumption"], peace: ["Journée nationale de la Paix", "National Peace Day"], easterMon: ["Lundi de Pâques", "Easter Monday"],
  ascension: ["Ascension", "Ascension Day"], whitMon: ["Lundi de Pentecôte", "Whit Monday"],
  martyrsCd: ["Journée des Martyrs de l'indépendance", "Independence Martyrs' Day"], kabila: ["Assassinat de Laurent-Désiré Kabila", "Laurent-Désiré Kabila Day"],
  lumumba: ["Assassinat de Patrice Lumumba", "Patrice Lumumba Day"], kimbangu: ["Journée de Simon Kimbangu", "Simon Kimbangu Day"], liberation: ["Journée de la Libération", "Liberation Day"],
  indep: ["Fête de l'Indépendance", "Independence Day"], indep2: ["Lendemain de l'Indépendance", "Independence Day (2nd day)"], parents: ["Fête des Parents", "Parents' Day"],
  genocideCd: ["Journée du génocide congolais", "Congolese Genocide Day"], youth: ["Fête de la Jeunesse", "Youth Day"], goodFri: ["Vendredi saint", "Good Friday"],
  national: ["Fête nationale", "National Day"], women: ["Journée des droits de la femme", "Women's Rights Day"], liberationGa: ["Journée de la Libération", "Liberation Day"],
  womenDay: ["Journée internationale des femmes", "International Women's Day"], freedom: ["Journée de la Liberté et de la Démocratie", "Freedom and Democracy Day"],
  uprising: ["Soulèvement populaire du 3 janvier 1966", "Popular Uprising Day"], customs: ["Journée des coutumes et traditions", "Customs and Traditions Day"],
  martyrs: ["Journée des Martyrs", "Martyrs' Day"], army: ["Fête de l'Armée", "Army Day"], africa: ["Journée de l'Afrique", "Africa Day"],
  refoundation: ["Journée de la Refondation", "Refoundation Day"], concord: ["Fête de la Concorde", "Concord Day"], cnsp: ["Anniversaire du 26 juillet (CNSP)", "26 July anniversary (CNSP)"],
  victory45: ["Victoire 1945", "Victory in Europe Day"], armistice: ["Armistice 1918", "Armistice Day"], mlk: ["Martin Luther King Jr. Day", "Martin Luther King Jr. Day"],
  washington: ["Washington's Birthday (Presidents' Day)", "Washington's Birthday"], memorial: ["Memorial Day", "Memorial Day"], juneteenth: ["Juneteenth", "Juneteenth"],
  labourUs: ["Fête du Travail (Labor Day)", "Labor Day"], columbus: ["Columbus Day", "Columbus Day"], veterans: ["Veterans Day", "Veterans Day"],
  thanksgiving: ["Thanksgiving", "Thanksgiving Day"], canada: ["Fête du Canada", "Canada Day"],
};
export const holNames = (lang) => Object.fromEntries(Object.entries(NAMES).map(([k, [fr, en]]) => [k, lang === "fr" || lang === "es" ? fr : en]));
// Dimanche de Pâques (calendrier grégorien, algorithme de Meeus/Jones/Butcher)
export function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(y, mo - 1, da));
}
const iso = (d) => d.toISOString().slice(0, 10);
const plus = (d, n) => new Date(d.getTime() + n * 86400000);
// Jours fériés légaux d'une année : { "2026-08-15": "natCg", … }
export const holSet = (country) => (HOLIDAYS[country] && country !== "intl" ? country : "intl");
export function legalHolidays(country, y) {
  const H = HOLIDAYS[holSet(country)];
  const out = {};
  const e = easter(y);
  for (const r of H.rules) {
    if (r[0] === "E") out[iso(plus(e, r[1]))] = r[2];
    else if (r[0] === "N") {
      const [, mo, wd, n, k] = r;
      let d;
      if (n > 0) { const first = new Date(Date.UTC(y, mo - 1, 1)); d = plus(first, ((wd - first.getUTCDay() + 7) % 7) + (n - 1) * 7); }
      else { const last = new Date(Date.UTC(y, mo, 0)); d = plus(last, -((last.getUTCDay() - wd + 7) % 7)); }
      out[iso(d)] = k;
    } else out[`${y}-${r[0]}`] = r[1];
  }
  return out;
}
// Jours sans classe d'un mois : { jour: { kind: "ferie" | "conge", label } } — hol = noms des fêtes (textes), off = congés de l'école
export function offDays(country, off, y, m, hol) {
  const out = {}, n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const L = legalHolidays(country, y);
  for (let d = 1; d <= n; d++) {
    const k = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (L[k]) out[d] = { kind: "ferie", label: hol[L[k]] || L[k] };
    for (const o of off || []) {
      if (!o.from || k < o.from || k > (o.to || o.from)) continue;
      if (o.kind === "ouvert") { if (out[d]?.kind === "ferie" && L[k]) delete out[d]; continue; } // férié retiré : classe ce jour-là
      const kind = o.kind === "ferie" ? "ferie" : "conge";
      if (out[d]?.kind === "ferie" && kind !== "ferie") continue; // un jour férié reste férié pendant les vacances
      out[d] = { kind, label: o.label || "" };
    }
  }
  return out;
}
export const offOn = (country, off, day, hol) => { const [y, m, d] = day.split("-").map(Number); return offDays(country, off, y, m, hol)[d] || null; };

// Où vérifier chaque calendrier (affiché sur le site administrateur, onglet « Calendrier international »)
export const SOURCES = {
  intl: [["Wikipédia — jours fériés par pays", "https://fr.wikipedia.org/wiki/Jour_f%C3%A9ri%C3%A9"]],
  cg: [["Wikipédia — Public holidays in the Republic of the Congo", "https://en.wikipedia.org/wiki/Public_holidays_in_the_Republic_of_the_Congo"], ["Le Petit Journal Congo", "https://lepetitjournal.com/republique-congo/comprendre-congo/jours-feries-republique-congo-2025-375149"]],
  ci: [["Africarrières — décret n° 2001-22", "https://africarrieres.com/ivory-coast/en/guide/droit-du-travail/working-hours-leave"], ["AIP (annonces des fêtes musulmanes)", "https://www.aip.ci"]],
  cd: [["vacances-scolaires-gouv.com — RDC", "https://www.vacances-scolaires-gouv.com/jours-feries/republique-democratique-du-congo"], ["ACP (annonces officielles)", "https://acp.cd"]],
  cm: [["HolidayDB — Cameroun", "https://holidaydb.com/guides/public-holidays/cameroon/2026"]],
  ga: [["HolidayDB — Gabon", "https://holidaydb.com/guides/public-holidays/gabon/2026"]],
  td: [["HolidayDB — Tchad", "https://holidaydb.com/guides/public-holidays/chad/2026"]],
  bj: [["HolidayDB — Bénin", "https://holidaydb.com/guides/public-holidays/benin/2026"]],
  bf: [["HolidayDB — Burkina Faso", "https://holidaydb.com/guides/public-holidays/burkina-faso/2026"]],
  ml: [["HolidayDB — Mali", "https://holidaydb.com/guides/public-holidays/mali/2026"]],
  ne: [["HolidayDB — Niger", "https://holidaydb.com/guides/public-holidays/niger/2026"]],
  sn: [["Le Petit Journal Dakar", "https://lepetitjournal.com/dakar/jours-feries-senegal-295473"]],
  fr: [["Service-public.gouv.fr (officiel)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F1251"]],
  be: [["SPF Emploi (officiel)", "https://emploi.belgique.be/fr/themes/jours-feries-et-conges/jours-feries"]],
  us: [["OPM — Federal holidays (officiel)", "https://www.opm.gov/frequently-asked-questions/pay-and-leave-faq/pay-administration/what-are-federal-holidays/"]],
  ca: [["HR Insider — statutory holidays", "https://hrinsider.ca/2026-statutory-holidays-across-canada/"]],
};
