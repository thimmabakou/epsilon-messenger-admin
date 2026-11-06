// Guide de vérification des papiers d'entreprise, par pays (site administrateur seulement).
// ⚠️ Les adresses marquées « à confirmer » doivent être vérifiées par l'équipe : dans plusieurs pays africains,
// il n'existe pas (encore) de recherche publique en ligne ; la vérification se fait auprès de l'organisme.

// — Contrôles automatiques des numéros (forme seulement : un numéro bien formé peut quand même être faux) —
const digits = (s) => String(s || "").replace(/\D/g, "");
const luhn = (d) => { let sum = 0; for (let i = 0; i < d.length; i++) { let n = +d[d.length - 1 - i]; if (i % 2) { n *= 2; if (n > 9) n -= 9; } sum += n; } return sum % 10 === 0; };
const CHECKS = {
  siren: { label: "SIREN (9 chiffres, clé de Luhn)", test: (s) => { const d = digits(s); return d.length === 9 && luhn(d); } },
  siret: { label: "SIRET (14 chiffres, clé de Luhn)", test: (s) => { const d = digits(s); return d.length === 14 && (luhn(d) || d.startsWith("356000000")); } },
  tvafr: { label: "TVA française (FR + clé + SIREN)", test: (s) => { const m = String(s || "").toUpperCase().replace(/\s/g, "").match(/^FR(\d{2})(\d{9})$/); return !!m && luhn(m[2]) && +m[1] === (12 + 3 * (+m[2] % 97)) % 97; } },
  bce: { label: "Numéro BCE (10 chiffres, clé modulo 97)", test: (s) => { const d = digits(s); return d.length === 10 && /^[01]/.test(d) && 97 - (+d.slice(0, 8) % 97) === +d.slice(8); } },
  ein: { label: "EIN (XX-XXXXXXX)", test: (s) => /^\d{2}-?\d{7}$/.test(String(s || "").trim()) },
  bn: { label: "Business Number canadien (9 chiffres, clé de Luhn ; + RT/RC/RP0001 possible)", test: (s) => { const d = digits(String(s || "").slice(0, 11)); return d.length >= 9 && luhn(d.slice(0, 9)); } },
  neq: { label: "NEQ du Québec (10 chiffres)", test: (s) => digits(s).length === 10 },
  rccm: { label: "RCCM OHADA (forme habituelle : pays-ville-…-année-…-numéro)", test: (s) => /^(RCCM\s*[:]?\s*)?[A-Z]{2}[-\s/]?[A-Z]{2,4}[-\s/].*(19|20)\d{2}.*[-\s/]\d{2,}$/i.test(String(s || "").trim()) },
};
// Quel contrôle appliquer à un document (selon son exigence « req »)
const CHECK_OF = { siret: "siret", tva: "tvafr", bce: "bce", ein: "ein", bn: "bn", neq: "neq", rccm: "rccm" };
export function checkNumber(country, req, number) {
  if (!number) return null;
  let key = CHECK_OF[req];
  if (country === "be" && req === "tva") key = "bce";
  if (country === "fr" && req === "siret") key = digits(number).length === 9 ? "siren" : "siret";
  const c = key && CHECKS[key];
  return c ? { label: c.label, ok: c.test(number) } : null;
}

// Signes d'un faux, communs à tous les pays
export const FAKE_SIGNS = [
  "Le nom, l'adresse ou le numéro ne correspondent pas exactement à ceux de la fiche de l'entreprise ou du registre officiel.",
  "Polices, alignements ou couleurs qui changent d'une ligne à l'autre ; chiffres « collés » ; zones floues autour du nom ou des dates (retouche).",
  "Capture d'écran ou photo d'écran au lieu du document original (PDF officiel ou photo nette de l'original).",
  "Cachet, signature ou timbre absent, flou, pixelisé ou identique au pixel près sur plusieurs documents différents.",
  "QR code ou code de vérification qui ne mène pas au site officiel de l'organisme (vérifier l'adresse du site !).",
  "Dates incohérentes : délivré avant la création de l'entreprise, un dimanche, ou document déjà expiré.",
  "Numéro qui échoue au contrôle automatique de format, ou introuvable dans le registre officiel.",
  "Document reçu d'une autre personne que le dirigeant, ou pression pour « valider vite ».",
];
export const GENERAL_STEPS = [
  "Ouvrir chaque document (📄) et vérifier qu'il est lisible, complet et au nom EXACT de l'entreprise.",
  "Comparer le numéro du document avec le registre officiel du pays (sites ci-dessous) ; le contrôle automatique de format aide mais ne suffit pas.",
  "Vérifier les dates de validité (ex. Kbis de moins de 3 mois en France) et que le document n'est pas expiré.",
  "En cas de doute : contacter directement l'organisme qui a délivré le document (téléphone ou courriel trouvés sur son site officiel, jamais ceux écrits sur le document).",
  "Si tout est conforme : « ✔ Papiers vérifiés ». Sinon : « ✖ Refuser la demande » et expliquer au dirigeant (Service client) ce qui manque.",
];

const OHADA_STEPS = [
  "RCCM : il est délivré par le greffe du tribunal de commerce (ou le guichet unique) de la ville indiquée dans le numéro. Vérifier que la ville du numéro correspond au siège de l'entreprise.",
  "Numéro fiscal : vérifier auprès de la Direction générale des impôts du pays (recherche en ligne si elle existe, sinon par téléphone ou courriel officiel).",
  "Pour les sociétés (SARL, SA, SAS) : les statuts doivent porter le nom exact de l'entreprise et la signature des associés.",
  "Si le pays publie un Journal officiel ou un journal d'annonces légales, la création de la société peut y apparaître.",
];
const g = (authority, sites, steps = OHADA_STEPS, notes = "") => ({ authority, sites, steps, notes });
export const GUIDE = {
  cg: g("ACPCE (Agence congolaise pour la création des entreprises, guichet unique) · Greffe du tribunal de commerce (Brazzaville, Pointe-Noire…) · Direction générale des impôts et des domaines (NIU)",
    [{ l: "Journal officiel de la République du Congo (SGG)", u: "https://www.sgg.cg" }], OHADA_STEPS,
    "Pas de recherche publique en ligne connue du RCCM ni du NIU : vérifier auprès de l'ACPCE ou du centre des impôts (adresse et téléphone officiels à noter ici par l'équipe)."),
  cd: g("GUCE (Guichet unique de création d'entreprise) · Greffe du tribunal de commerce · DGI (numéro impôt) · Ministère de l'Économie (Id. Nat.)",
    [{ l: "Guichet unique de création d'entreprise — à confirmer", u: "https://guichetunique.cd" }]),
  bj: g("APIEx — guichet unique « monentreprise.bj » · Direction générale des impôts (IFU)",
    [{ l: "Création d'entreprise en ligne (APIEx) — à confirmer", u: "https://monentreprise.bj" }, { l: "Direction générale des impôts", u: "https://impots.finances.gouv.bj" }]),
  bf: g("Maison de l'entreprise du Burkina Faso — CEFORE · Direction générale des impôts (IFU)",
    [{ l: "Maison de l'entreprise", u: "https://www.me.bf" }]),
  cm: g("CFCE (Centres de formalités de création d'entreprises) · Greffe · Direction générale des impôts (NIU, attestation de conformité fiscale)",
    [{ l: "Direction générale des impôts du Cameroun", u: "https://www.impots.cm" }]),
  ci: g("CEPICI (guichet unique) · Tribunal de commerce d'Abidjan · Direction générale des impôts (DFE, numéro de compte contribuable)",
    [{ l: "CEPICI", u: "https://www.cepici.gouv.ci" }, { l: "Impôts en ligne (e-impots)", u: "https://www.e-impots.gouv.ci" }, { l: "Service public ivoirien", u: "https://www.servicepublic.gouv.ci" }]),
  ga: g("ANPI-Gabon (guichet unique) · Greffe du tribunal de commerce · Direction générale des impôts (NIF)", []),
  ml: g("API-Mali (guichet unique) · Greffe du tribunal de commerce · Direction générale des impôts (NIF)", []),
  ne: g("Maison de l'entreprise du Niger (guichet unique) · Greffe · Direction générale des impôts (NIF)", []),
  sn: g("APIX (création d'entreprise) · Greffe du tribunal de commerce · ANSD (NINEA, service e-NINEA) · Direction générale des impôts et domaines",
    [{ l: "ANSD — NINEA — à confirmer", u: "https://www.ansd.sn" }]),
  td: g("ANIE — guichet unique · Greffe du tribunal de commerce · Direction générale des impôts (NIF)", []),
  fr: g("INSEE (SIREN/SIRET) · Greffe du tribunal de commerce / Infogreffe (Kbis) · INPI (RNE) · URSSAF",
    [{ l: "Annuaire des entreprises (État, gratuit)", u: "https://annuaire-entreprises.data.gouv.fr" },
      { l: "Avis de situation INSEE", u: "https://avis-situation-sirene.insee.fr" },
      { l: "Infogreffe (Kbis)", u: "https://www.infogreffe.fr" },
      { l: "TVA intracommunautaire (VIES, Commission européenne)", u: "https://ec.europa.eu/taxation_customs/vies/" },
      { l: "URSSAF — vérifier une attestation (code de sécurité)", u: "https://www.urssaf.fr" }],
    ["Taper le SIREN (9 premiers chiffres du SIRET) dans l'Annuaire des entreprises : nom, adresse, date de création et état « en activité » doivent correspondre.",
      "Kbis : il doit dater de moins de 3 mois ; comparer le numéro RCS, la dénomination et le dirigeant avec l'Annuaire des entreprises.",
      "TVA : la vérifier sur VIES (elle doit être « valide »).",
      "Attestation URSSAF : saisir le code de sécurité imprimé sur l'attestation sur le site de l'URSSAF.",
      "Professions réglementées : vérifier l'inscription à l'Ordre (experts-comptables, avocats, médecins…) sur l'annuaire de l'Ordre concerné."]),
  be: g("SPF Économie — Banque-Carrefour des Entreprises (BCE) · Moniteur belge · ONSS",
    [{ l: "BCE — recherche publique (KBO Public Search)", u: "https://kbopub.economie.fgov.be" },
      { l: "Moniteur belge (publications des sociétés)", u: "https://www.ejustice.just.fgov.be" },
      { l: "TVA (VIES)", u: "https://ec.europa.eu/taxation_customs/vies/" }],
    ["Taper le numéro BCE (10 chiffres) dans KBO Public Search : dénomination, adresse, statut « actif » et activités.",
      "TVA belge = BE + numéro BCE : la vérifier sur VIES.",
      "Sociétés : retrouver la publication des statuts au Moniteur belge.",
      "Métiers réglementés : la BCE indique les autorisations (accès à la profession)."]),
  us: g("Secretary of State de chaque État (création, Good Standing) · IRS (EIN) · ville / comté (Business License)",
    [{ l: "Liste des registres des 50 États (NASS) — à confirmer", u: "https://www.nass.org/business-services/corporate-registration" },
      { l: "IRS — organismes à but non lucratif (Tax Exempt Organization Search)", u: "https://apps.irs.gov/app/eos/" },
      { l: "OpenCorporates (agrégateur non officiel, pour orienter)", u: "https://opencorporates.com" }],
    ["Repérer l'État de création sur les Articles of Incorporation / Organization, puis chercher l'entreprise sur le site du Secretary of State de cet État (« Business Search ») : statut « Active » / « Good Standing ».",
      "Certificate of Good Standing : beaucoup d'États permettent de le vérifier en ligne avec son numéro ; il doit être récent.",
      "EIN : il n'existe pas de recherche publique ; vérifier que la lettre IRS (CP 575 ou 147C) porte le nom exact de l'entreprise et que le numéro a la bonne forme.",
      "Business License : vérifier auprès de la ville ou du comté indiqués sur la licence."]),
  ca: g("Corporations Canada (sociétés fédérales) · registres provinciaux (Registraire des entreprises du Québec, Ontario Business Registry…) · ARC / CRA (numéro d'entreprise BN)",
    [{ l: "Corporations Canada — recherche de sociétés fédérales", u: "https://ised-isde.canada.ca/cc/lgcy/fdrlCrpSrch.html" },
      { l: "Registraire des entreprises du Québec (NEQ) — à confirmer", u: "https://www.registreentreprises.gouv.qc.ca" },
      { l: "Ontario Business Registry", u: "https://www.ontario.ca/page/ontario-business-registry" },
      { l: "Registre de la TPS/TVH (ARC) — à confirmer", u: "https://www.canada.ca/fr/agence-revenu/services/services-electroniques/services-electroniques-entreprises/confirmer-numero-inscription-tps-tvh.html" }],
    ["Société fédérale : chercher le nom ou le numéro dans Corporations Canada (statut « Actif »). Société provinciale : registre de la province (au Québec, avec le NEQ).",
      "Numéro d'entreprise (BN, 9 chiffres) : il apparaît dans les registres ; pour la TPS/TVH, le confirmer sur le registre de l'ARC.",
      "Certificate of Status / certificat de conformité : il doit être récent et au nom exact de la société."]),
};
