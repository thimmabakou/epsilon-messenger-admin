// Epsilon Business — documents officiels exigés selon la LÉGISLATION DU PAYS DE L'ENTREPRISE.
// Ils ne servent qu'au badge de certification « ✔ Papiers vérifiés par Epsilon » : sans eux, l'entreprise
// fonctionne normalement (dans certains pays, ces papiers coûtent cher : personne n'y est obligé).
// req: true = exigé pour le badge (★) ; les autres renforcent la fiche. Les noms sont les noms OFFICIELS
// du pays (identiques dans toutes les langues de l'application). Listes à faire valider par un professionnel
// (expert-comptable, avocat) de chaque pays avant le lancement.
const RCCM = { k: "rccm", kind: "registre", name: "Extrait du RCCM (Registre du commerce et du crédit mobilier)", req: true };
const STATUTS = { k: "statuts", kind: "statuts", name: "Statuts de la société (sociétés uniquement)" };
const ohada = (tax, social) => [RCCM, { kind: "fiscal", req: true, ...tax }, { kind: "attestation", ...social }, STATUTS,
  { k: "licence", kind: "licence", name: "Agrément ou licence (activités réglementées)" }];

export const BIZ_COUNTRIES = [
  { c: "cg", cc: "242", flag: "🇨🇬", names: { fr: "Congo", en: "Congo", es: "Congo", zh: "刚果（布）" },
    docs: ohada({ k: "niu", name: "Carte NIU (Numéro d'Identification Unique)" }, { k: "cnss", name: "Attestation d'immatriculation CNSS" }) },
  { c: "cd", cc: "243", flag: "🇨🇩", names: { fr: "RDC", en: "DR Congo", es: "RD del Congo", zh: "刚果（金）" },
    docs: [RCCM, { k: "idnat", kind: "registre", name: "Identification nationale (Id. Nat.)", req: true }, { k: "nif", kind: "fiscal", name: "Numéro impôt (NIF / A)", req: true },
      { k: "cnss", kind: "attestation", name: "Attestation d'affiliation CNSS" }, STATUTS, { k: "licence", kind: "licence", name: "Agrément ou licence (activités réglementées)" }] },
  { c: "bj", cc: "229", flag: "🇧🇯", names: { fr: "Bénin", en: "Benin", es: "Benín", zh: "贝宁" },
    docs: ohada({ k: "ifu", name: "IFU (Identifiant Fiscal Unique)" }, { k: "cnss", name: "Attestation d'immatriculation CNSS" }) },
  { c: "bf", cc: "226", flag: "🇧🇫", names: { fr: "Burkina Faso", en: "Burkina Faso", es: "Burkina Faso", zh: "布基纳法索" },
    docs: ohada({ k: "ifu", name: "IFU (Identifiant Financier Unique)" }, { k: "cnss", name: "Attestation d'immatriculation CNSS" }) },
  { c: "cm", cc: "237", flag: "🇨🇲", names: { fr: "Cameroun", en: "Cameroon", es: "Camerún", zh: "喀麦隆" },
    docs: ohada({ k: "niu", name: "Carte de contribuable (NIU)" }, { k: "cnps", name: "Attestation d'immatriculation CNPS" }) },
  { c: "ci", cc: "225", flag: "🇨🇮", names: { fr: "Côte d'Ivoire", en: "Côte d'Ivoire", es: "Costa de Marfil", zh: "科特迪瓦" },
    docs: ohada({ k: "dfe", name: "Déclaration fiscale d'existence (DFE) — numéro de compte contribuable (NCC)" }, { k: "cnps", name: "Attestation d'immatriculation CNPS" }) },
  { c: "ga", cc: "241", flag: "🇬🇦", names: { fr: "Gabon", en: "Gabon", es: "Gabón", zh: "加蓬" },
    docs: ohada({ k: "nif", name: "Carte NIF (Numéro d'Identification Fiscale)" }, { k: "cnss", name: "Attestation d'immatriculation CNSS" }) },
  { c: "ml", cc: "223", flag: "🇲🇱", names: { fr: "Mali", en: "Mali", es: "Malí", zh: "马里" },
    docs: ohada({ k: "nif", name: "NIF (Numéro d'Identification Fiscale)" }, { k: "inps", name: "Attestation d'immatriculation INPS" }) },
  { c: "ne", cc: "227", flag: "🇳🇪", names: { fr: "Niger", en: "Niger", es: "Níger", zh: "尼日尔" },
    docs: ohada({ k: "nif", name: "NIF (Numéro d'Identification Fiscale)" }, { k: "cnss", name: "Attestation d'immatriculation CNSS" }) },
  { c: "sn", cc: "221", flag: "🇸🇳", names: { fr: "Sénégal", en: "Senegal", es: "Senegal", zh: "塞内加尔" },
    docs: ohada({ k: "ninea", name: "NINEA (Numéro d'Identification Nationale des Entreprises et Associations)" }, { k: "ipres", name: "Attestation IPRES / Caisse de Sécurité Sociale" }) },
  { c: "td", cc: "235", flag: "🇹🇩", names: { fr: "Tchad", en: "Chad", es: "Chad", zh: "乍得" },
    docs: ohada({ k: "nif", name: "NIF (Numéro d'Identification Fiscale)" }, { k: "cnps", name: "Attestation d'immatriculation CNPS" }) },
  { c: "fr", cc: "33", flag: "🇫🇷", names: { fr: "France", en: "France", es: "Francia", zh: "法国" },
    docs: [{ k: "kbis", kind: "registre", name: "Extrait Kbis (ou extrait du RNE) de moins de 3 mois", req: true },
      { k: "siret", kind: "fiscal", name: "Avis de situation INSEE (SIREN / SIRET)", req: true },
      { k: "tva", kind: "fiscal", name: "Numéro de TVA intracommunautaire" },
      { k: "urssaf", kind: "attestation", name: "Attestation de vigilance URSSAF" }, STATUTS,
      { k: "pro", kind: "licence", name: "Carte ou inscription professionnelle (professions réglementées)" }] },
  { c: "be", cc: "32", flag: "🇧🇪", names: { fr: "Belgique", en: "Belgium", es: "Bélgica", zh: "比利时" },
    docs: [{ k: "bce", kind: "registre", name: "Extrait de la Banque-Carrefour des Entreprises (numéro BCE)", req: true },
      { k: "moniteur", kind: "statuts", name: "Statuts publiés au Moniteur belge (sociétés)" },
      { k: "tva", kind: "fiscal", name: "Numéro de TVA (BE)", req: true },
      { k: "onss", kind: "attestation", name: "Attestation ONSS (employeurs)" },
      { k: "acces", kind: "licence", name: "Accès à la profession (métiers réglementés)" }] },
  { c: "us", cc: "1", flag: "🇺🇸", names: { fr: "États-Unis", en: "United States", es: "Estados Unidos", zh: "美国" },
    docs: [{ k: "articles", kind: "statuts", name: "Articles of Incorporation / Articles of Organization (LLC)", req: true },
      { k: "good", kind: "registre", name: "Certificate of Good Standing", req: true },
      { k: "ein", kind: "fiscal", name: "EIN — IRS letter CP 575 or 147C", req: true },
      { k: "license", kind: "licence", name: "Business License (city / county)" },
      { k: "dba", kind: "registre", name: "DBA — Doing Business As (trade name)" },
      { k: "sales", kind: "fiscal", name: "Sales Tax Permit" }] },
  { c: "ca", cc: "1", flag: "🇨🇦", names: { fr: "Canada", en: "Canada", es: "Canadá", zh: "加拿大" },
    docs: [{ k: "constitution", kind: "registre", name: "Certificat de constitution / Certificate of Incorporation (fédéral ou provincial)", req: true },
      { k: "bn", kind: "fiscal", name: "Numéro d'entreprise de l'ARC / CRA Business Number (BN)", req: true },
      { k: "neq", kind: "registre", name: "NEQ — Registraire des entreprises (Québec)" },
      { k: "status", kind: "attestation", name: "Certificat de conformité / Certificate of Status" },
      { k: "permis", kind: "licence", name: "Permis municipal / licence d'exploitation" }] },
];
// Pays sans liste précise (pas encore ouvert) : la base commune à presque tous les pays
const GENERIC = [{ k: "registre", kind: "registre", name: "Registration certificate / Certificat d'immatriculation", req: true },
  { k: "fiscal", kind: "fiscal", name: "Tax identification number / Numéro fiscal", req: true }, STATUTS];

// Pays de l'entreprise (code à 2 lettres). Anciennes fiches : indicatif téléphonique (242…).
export function bizCountry(code) {
  const c = String(code || "").toLowerCase();
  return BIZ_COUNTRIES.find((x) => x.c === c) || BIZ_COUNTRIES.find((x) => x.cc === c && x.c !== "ca") || null;
}
export const bizCountryName = (code, lang = "fr") => { const x = bizCountry(code); return x ? `${x.flag} ${x.names[lang] || x.names.fr}` : ""; };
// Pays de l'entreprise proposé au départ : celui du numéro de téléphone de la personne
export const defaultBizCountry = (cc) => (BIZ_COUNTRIES.find((x) => x.cc === String(cc || "")) || BIZ_COUNTRIES[0]).c;
export const legalDocs = (code) => bizCountry(code)?.docs || GENERIC;
// Les documents exigés (★) pour le badge sont-ils tous déposés ?
export function certifState(code, docs) {
  const list = legalDocs(code).map((d) => ({ ...d, doc: (docs || []).find((x) => x.req === d.k) || null }));
  const missing = list.filter((d) => d.req && !d.doc);
  return { list, missing, ready: missing.length === 0 };
}
