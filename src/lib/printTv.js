// Documents imprimables d'Epsilon TV : liste des chaînes, registre des codes, contrat d'abonnement,
// historique des paiements et reçus. Tout en tableaux, au format A4.
import { printReport, money, num, day } from "./printDoc";
import { fullName, shortId } from "./format";

const PLAN_LABEL = { bronze: "Bronze", argent: "Argent", platine: "Platine", or: "Or", sur_mesure: "Sur mesure" };
const planOf = (p) => PLAN_LABEL[p] || p || "—";
const active = (c) => c.status === "active" && c.paid_until && new Date(c.paid_until) > new Date();
const studioOn = (c) => c.studio_until && new Date(c.studio_until) > new Date();
const canal = (c) => (c.channel_no != null ? String(c.channel_no) : "—");
export const payLabel = (p) => (p.kind === "recharge" ? "Recharge de minutes"
  : p.kind === "studio" ? `Epsilon TV Studio · ${p.months} mois`
  : p.kind === "stockage" ? `Espace en plus · ${p.storage_gb} Go`
  : `Formule ${planOf(p.plan)} · ${p.months} mois`);
const payMinutes = (p) => (p.kind === "stockage" || p.kind === "studio" ? "—" : num(p.minutes));
const payMode = (p) => (p.pay_ref ? `Mobile Money · ${p.pay_ref}` : "Espèces (sans code)");

// Liste complète des chaînes (format paysage)
export function printChannelList(rows, plans) {
  const sorted = [...rows].sort((a, b) => (a.channel_no ?? 1e9) - (b.channel_no ?? 1e9));
  const nAct = rows.filter(active).length;
  return printReport({
    title: "Epsilon TV — Liste des chaînes",
    subtitle: `${rows.length} chaîne(s) · ${nAct} visible(s) · ${rows.filter((c) => c.is_private).length} privée(s)`,
    landscape: true,
    blocks: [{ table: {
      cols: ["Canal", "Chaîne", "Responsable", "Téléphone", "Formule", "Payée jusqu'au", "Studio jusqu'au", "Minutes utilisées / incluses", "Espace", "Accès", "Code privé", "État"],
      align: ["c", "", "", "", "", "c", "c", "r", "r", "c", "c", "c"],
      rows: sorted.map((c) => [
        canal(c), c.name, c.owner ? fullName(c.owner) : "aucun", c.owner?.phone, planOf(c.plan), day(c.paid_until),
        studioOn(c) ? day(c.studio_until) : "non abonné",
        `${num(c.used_minutes || 0)} / ${num(c.quota_minutes || 0)}`,
        `${(plans[c.plan]?.gb || 0) + Number(c.storage_extra_gb || 0)} Go`,
        c.is_private ? "Privée" : "Publique", c.is_private ? c.privCode || "en attente" : "—",
        c.status === "paused" ? "En pause" : active(c) ? "Visible" : "Non payée",
      ]),
    } }],
  });
}

// Registre des codes des chaînes privées
export function printCodesRegistry(rows) {
  const list = rows.filter((c) => c.is_private || c.privCode || c.privPending).sort((a, b) => (a.channel_no ?? 1e9) - (b.channel_no ?? 1e9));
  return printReport({
    title: "Registre des codes des chaînes privées",
    subtitle: "Document confidentiel — réservé au PDG. À ranger sous clé.",
    blocks: [
      { table: {
        cols: ["Canal", "Désignation", "Code de sécurité actif", "Code en attente", "Activé le", "Spectateurs autorisés", "État"],
        align: ["c", "", "c", "c", "c", "r", "c"],
        rows: list.map((c) => [canal(c), c.name, c.privCode, c.privPending, day(c.privActivatedAt), num(c.privViewers || 0), c.is_private ? "Privée" : "Publique"]),
      } },
      { note: "Seul le code actif débloque la chaîne. Un nouveau code validé remplace l'ancien : réimprimez alors ce registre." },
      { sign: ["Le PDG d'Epsilon"] },
    ],
  });
}

// Historique des paiements d'une chaîne
export function printPayments(c, payments) {
  const total = payments.reduce((s, p) => s + Number(p.amount_fcfa || 0), 0);
  return printReport({
    title: `Historique des paiements — ${c.name}`,
    subtitle: `Canal ${canal(c)} · responsable : ${c.owner ? `${fullName(c.owner)} (${c.owner.phone || "—"})` : "aucun"}`,
    blocks: [{ table: {
      cols: ["Date", "Objet", "Minutes", "Montant", "Paiement", "Note"],
      align: ["c", "", "r", "r", "", ""],
      rows: [...payments].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((p) => [day(p.created_at), payLabel(p), payMinutes(p), money(p.amount_fcfa), payMode(p), p.note]),
      foot: ["", `${payments.length} paiement(s)`, "", money(total), "", ""],
    } }],
  });
}

// Reçu d'un paiement (avec souche à garder)
export function printReceipt(c, p) {
  const ref = `Reçu ${shortId(p.id, "TV")}`;
  const kv = [
    ["Date du paiement", day(p.created_at)],
    ["Chaîne", `${c.name} (canal ${canal(c)})`],
    ["Client (responsable)", c.owner ? `${fullName(c.owner)} · ${c.owner.phone || "—"}` : "—"],
    ["Objet", payLabel(p)],
    ["Minutes", payMinutes(p)],
    ["Montant reçu", money(p.amount_fcfa)],
    ["Mode de paiement", payMode(p)],
    ["Note", p.note || "—"],
  ];
  return printReport({
    title: "Reçu de paiement — Epsilon TV", ref,
    blocks: [
      { h: "Exemplaire du client" }, { kv }, { sign: ["Pour Epsilon (cachet et signature)"] },
      { text: "\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  ✂  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n" },
      { h: `Souche — à garder dans les archives d'Epsilon (${ref})` }, { kv }, { sign: ["Reçu par (Epsilon)", "Le client"] },
    ],
  });
}

// Contrat d'abonnement d'une chaîne : parties, formule en cours, tarifs, paiements, conditions, signatures
export function printContract(c, payments, { plans, pricePerMinute, studioPrice, storagePriceGb }) {
  const ref = `Contrat ${shortId(c.id, "TV")}`;
  const last = [...payments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).find((p) => !p.kind || p.kind === "formule");
  const gb = (plans[c.plan]?.gb || 0) + Number(c.storage_extra_gb || 0);
  return printReport({
    title: "Contrat d'abonnement — Epsilon TV", ref,
    subtitle: `Chaîne « ${c.name} » · canal ${canal(c)}`,
    blocks: [
      { h: "1. Les parties" },
      { kv: [
        ["Le prestataire", "Epsilon Messenger — service Epsilon TV"],
        ["Représenté par", "Le PDG d'Epsilon"],
        ["Le client (responsable de la chaîne)", c.owner ? fullName(c.owner) : "—"],
        ["Téléphone du client (compte Epsilon)", c.owner?.phone || "—"],
        ["Chaîne", `${c.name} — canal ${canal(c)}${c.is_private ? " (chaîne privée)" : ""}`],
        ["Date de création de la chaîne", day(c.created_at)],
      ] },
      { h: "2. Formule souscrite" },
      { kv: [
        ["Formule", planOf(c.plan)],
        ["Période payée jusqu'au", day(c.paid_until)],
        ["Dernière souscription", last ? `${day(last.created_at)} · ${payLabel(last)} · ${money(last.amount_fcfa)}` : "—"],
        ["Minutes regardées incluses (solde total)", num(c.quota_minutes || 0)],
        ["Minutes déjà utilisées", num(c.used_minutes || 0)],
        ["Espace pour les vidéos (différé)", `${gb} Go`],
        ["Epsilon TV Studio (gestion sur le site)", studioOn(c) ? `abonné jusqu'au ${day(c.studio_until)}` : "non abonné (gestion depuis le téléphone, gratuite)"],
      ] },
      { h: "3. Tarifs en vigueur" },
      { table: {
        cols: ["Formule", "Prix par mois", "Minutes incluses", "Stockage compris"],
        align: ["", "r", "r", "r"],
        rows: [
          ...Object.entries(plans).filter(([k]) => k !== "sur_mesure").map(([, v]) => [v.label, money(v.price), num(v.minutes), `${v.gb} Go`]),
          ["Sur mesure", `${String(pricePerMinute).replace(".", ",")} FCFA la minute`, "selon le pack", `${plans.sur_mesure?.gb || 10} Go`],
          ["Recharge", money(12000), "+ 10 000", "—"],
          ["Espace en plus", `${storagePriceGb} FCFA le Go par mois`, "—", "au choix"],
          ["Epsilon TV Studio", `${money(studioPrice)} par mois`, "—", "—"],
        ],
      } },
      { h: "4. Paiements enregistrés" },
      { table: {
        cols: ["Date", "Objet", "Montant", "Paiement"],
        align: ["c", "", "r", ""],
        rows: [...payments].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map((p) => [day(p.created_at), payLabel(p), money(p.amount_fcfa), payMode(p)]),
        foot: ["", "Total", money(payments.reduce((s, p) => s + Number(p.amount_fcfa || 0), 0)), ""],
      } },
      { h: "5. Conditions" },
      { text: [
        `• Le tarif de diffusion est de ${String(pricePerMinute).replace(".", ",")} FCFA par minute regardée (1 spectateur pendant 1 minute). Les minutes de la formule sont décomptées au fur et à mesure.`,
        "• La chaîne est visible dans Epsilon TV à partir de l'activation de la formule, une fois le paiement reçu (Mobile Money ou espèces), et jusqu'à la fin de la période payée. À la fin de cette période, elle disparaît toute seule jusqu'au renouvellement.",
        "• Le stockage des vidéos en différé est compris dans chaque formule (voir le tableau). L'espace en plus est valable jusqu'à la fin de la formule en cours.",
        "• Chaque paiement Mobile Money est enregistré avec son code de transaction ; un même code ne peut servir qu'une seule fois.",
        "• Le client publie sous sa responsabilité et respecte les Règles de communauté et les Conditions d'utilisation d'Epsilon. Epsilon peut retirer un contenu ou mettre la chaîne en pause en cas de manquement.",
        "• La gestion de la chaîne depuis le téléphone est gratuite ; Epsilon TV Studio (gestion sur le site) est un abonnement séparé.",
      ].join("\n") },
      { text: `Fait en deux exemplaires, le ${new Date().toLocaleDateString("fr-FR")}.` },
      { sign: ["Pour Epsilon — le PDG", "Le client — responsable de la chaîne (lu et approuvé)"] },
    ],
  });
}
