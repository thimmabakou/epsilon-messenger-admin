// Listes fixes du site (textes validés sur la maquette)

export const NAV_ITEMS = [
  { key: "overview", label: "Vue d'ensemble", icon: "📋" },
  { key: "users", label: "Utilisateurs", icon: "👥" },
  { key: "calls", label: "Appels", icon: "📞" },
  { key: "marketplace", label: "Marketplace", icon: "🛍️" },
  { key: "support", label: "Service client", icon: "🎧" },
  { key: "reports", label: "Signalements", icon: "🚩" },
  { key: "stats", label: "Statistiques", icon: "📊" },
  { key: "documents", label: "Documents", icon: "📄" },
  { key: "admins", label: "Administrateurs", icon: "🔑" },
  { key: "versions", label: "Versions", icon: "🧩" },
  { key: "requests", label: "Demandes au PDG", icon: "✉️" },
  { key: "security", label: "Sécurité", icon: "🛡️" },
  { key: "settings", label: "Paramètres", icon: "⚙️" },
];

// Permission nécessaire pour voir chaque écran (null = tout le monde, "PDG" = PDG seulement)
export const SECTION_PERMS = {
  overview: null, users: "users.list", calls: "calls.view", marketplace: "market.manage", support: "support.inbox",
  reports: "mod.view", stats: "stats.view", documents: "docs.prepare", admins: "admins.manage", versions: "ver.prepare",
  security: "PDG", settings: "settings.modules", requests: null,
};

export const FEATURES = [
  { icon: "💬", label: "Messages" }, { icon: "📞", label: "Appels audio & vidéo" },
  { icon: "✨", label: "Statuts" }, { icon: "📎", label: "Fichiers" }, { icon: "🛍️", label: "Marketplace" },
];

// Identifiants des documents dans la base
export const DOCUMENT_LINKS = [
  { icon: "📜", label: "Règles de communauté", doc: "regles-communaute" },
  { icon: "🛡️", label: "Politique de confidentialité", doc: "confidentialite" },
  { icon: "📄", label: "Conditions d'utilisation", doc: "conditions" },
  { icon: "🛍️", label: "Politique marketplace", doc: "politique-marketplace" },
  { icon: "❓", label: "FAQ", doc: "faq" },
  { icon: "🎧", label: "Contact support" },
];

export const VIOLATION_RULES = [
  "Nudité et contenu sexuel", "Harcèlement / intimidation", "Menaces et violence", "Discours haineux",
  "Fausses informations", "Arnaque / fraude", "Usurpation d'identité", "Faux compte trompeur",
  "Contenu choquant ou violent", "Vente de produits interdits", "Spam", "Autre",
];
export const DURATIONS = ["24 heures", "7 jours", "30 jours", "Définitive"];

export const PERMISSION_GROUPS = [
  { title: "Service client", items: [
    { key: "support.reply", label: "Répondre aux messages des clients" },
    { key: "support.inbox", label: "Voir la boîte de réception" }] },
  { title: "Modération", items: [
    { key: "mod.view", label: "Voir les signalements" },
    { key: "mod.remove", label: "Retirer un contenu" },
    { key: "mod.warn", label: "Avertir un utilisateur" },
    { key: "mod.suspend", label: "Suspendre un compte" },
    { key: "mod.cancel", label: "Annuler ou modifier une sanction", sensitive: true }] },
  { title: "Appels", items: [
    { key: "calls.view", label: "Voir les appels du service client" },
    { key: "calls.listen", label: "Écouter les appels enregistrés", sensitive: true }] },
  { title: "Utilisateurs", items: [
    { key: "users.list", label: "Voir la liste des comptes" },
    { key: "users.detail", label: "Voir la fiche détaillée d'un utilisateur" }] },
  { title: "Marketplace", items: [{ key: "market.manage", label: "Gérer les boutiques et les produits" }] },
  { title: "Statistiques", items: [{ key: "stats.view", label: "Voir les statistiques (lecture seule)" }] },
  { title: "Documents publics", items: [
    { key: "docs.prepare", label: "Préparer une modification (brouillon)" },
    { key: "docs.publish", label: "Publier un document", ownerOnly: true }] },
  { title: "Versions de l'application", items: [
    { key: "ver.prepare", label: "Préparer une version" },
    { key: "ver.test", label: "Envoyer une version aux testeurs" },
    { key: "ver.publish", label: "Publier une version pour tous", sensitive: true }] },
  { title: "Gestion des administrateurs", items: [{ key: "admins.manage", label: "Créer et gérer les autres administrateurs", sensitive: true }] },
  { title: "Paramètres", items: [
    { key: "settings.modules", label: "Gérer les modules" },
    { key: "settings.backups", label: "Gérer les sauvegardes" },
    { key: "settings.maintenance", label: "Activer le mode maintenance", sensitive: true },
    { key: "security.freeze", label: "Gel d'urgence de la plateforme", ownerOnly: true }] },
];

export const PROFILE_PRESETS = {
  "Service client": ["support.reply", "support.inbox", "calls.view", "users.list"],
  "Modération": ["support.inbox", "mod.view", "mod.remove", "mod.warn", "mod.suspend", "users.list", "users.detail"],
  "Statistiques": ["stats.view"],
};

export const FEATURE_LIST = [
  { key: "messaging", label: "Messagerie", desc: "Discussions privées et de groupe" },
  { key: "calls", label: "Appels audio et vidéo", desc: "Appels entre utilisateurs" },
  { key: "statuses", label: "Statuts", desc: "Publications éphémères publiques" },
  { key: "marketplace", label: "Marketplace", desc: "Boutiques et produits" },
  { key: "support", label: "Service client", desc: "Contact épinglé, messages et appels" },
  { key: "reports", label: "Système de signalement", desc: "Signaler un contenu ou un profil" },
];

export const VERSION_STEPS = ["Brouillon", "Test", "Validation", "Déploiement"];
export const STAGE_INDEX = { brouillon: 0, test: 1, validation: 2, production: 4, archivee: 4 };
export const KIND_LABEL = { majeure: "Majeure", mineure: "Mineure", securite: "Sécurité" };
export const KIND_KEY = { Majeure: "majeure", Mineure: "mineure", "Sécurité": "securite" };

export const CONTENT_TYPES = { statut: "Statut", video: "Vidéo", image: "Image", commentaire: "Commentaire", profil: "Profil", produit: "Produit", message: "Message" };

export const REQ_STATUS = {
  en_attente: "En attente", en_discussion: "En discussion", accordee: "Accordée", refusee: "Refusée", question: "Question", repondu: "Répondu",
};

export function permLabel(key) {
  for (const g of PERMISSION_GROUPS) for (const it of g.items) if (it.key === key) return it.label;
  return key;
}

// Coordonnées des villes pour la carte des statistiques (les villes inconnues restent dans la liste)
export const CITY_COORDS = {
  "Brazzaville": [15.28, -4.27], "Pointe-Noire": [11.86, -4.78], "Dolisie": [12.67, -4.20], "Nkayi": [13.29, -4.18],
  "Ouesso": [16.05, 1.61], "Owando": [15.90, -0.48], "Loutété": [13.86, -4.29], "Impfondo": [18.06, 1.62],
  "Madingou": [13.55, -4.15], "Sibiti": [13.35, -3.68], "Djambala": [14.75, -2.54], "Ewo": [14.82, -0.88],
  "Kinkala": [14.76, -4.36], "Mossendjo": [12.72, -2.95], "Gamboma": [15.86, -1.87], "Oyo": [15.91, -1.16],
};
export const COUNTRY_COORDS = {
  CG: { name: "Congo", lon: 15.4, lat: -1.0 }, CD: { name: "RD Congo", lon: 23.6, lat: -2.9 },
  GA: { name: "Gabon", lon: 11.3, lat: -0.4 }, CM: { name: "Cameroun", lon: 12.4, lat: 5.7 },
  CF: { name: "Centrafrique", lon: 20.9, lat: 6.6 }, AO: { name: "Angola", lon: 17.9, lat: -11.2 },
};
