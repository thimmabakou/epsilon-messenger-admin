// Fiches pratiques du Service client : pour guider au téléphone (ou par message) une personne qui ne s'en sort pas.
// Chaque étape est écrite pour être lue telle quelle au client, ou copiée et envoyée dans sa discussion.
// Les prix et les noms de boutons correspondent à l'application actuelle : à mettre à jour ici si ça change.
// Epsilon IA (l'assistante du Service client) répond à partir de ces fiches : après une modification, refabriquer
// sa copie dans le dépôt de l'application avec  node scripts/ia-docs.mjs ../epsilon-messenger-admin

export const TV_PRICE_PER_MIN = 1.2; // FCFA par minute regardée (1 spectateur × 1 minute), validé par le PDG le 11/10/2026

export const HELP_SHEETS = [
  // ───────────────────────────── STATUTS ─────────────────────────────
  {
    id: "statuts",
    icon: "🟢",
    title: "Publier un statut",
    who: "Tous les utilisateurs",
    intro:
      "Un statut, c'est une photo, une vidéo, un texte sur fond de couleur ou une chanson que la personne partage avec ses contacts. Il reste visible 24 heures, puis il disparaît tout seul.",
    steps: [
      { t: "Ouvrir l'onglet Statuts", d: "En bas de l'écran (ou en haut selon le téléphone), touchez « Statuts ». Tout en haut, vous voyez « Mon statut »." },
      { t: "Commencer un nouveau statut", d: "Touchez « Mon statut ». Un écran s'ouvre avec, en bas, une barre pour écrire et des boutons pour la photo et la vidéo." },
      { t: "Choisir le genre de statut", d: "Pour un texte : écrivez directement dans la barre du bas, puis changez la couleur du fond avec la palette en haut. Pour une photo ou une vidéo déjà dans le téléphone : touchez « Galerie (photos et vidéos) ». Pour en faire une tout de suite : « Prendre une photo » ou « Filmer une vidéo ». On peut mélanger plusieurs photos et vidéos d'un coup." },
      { t: "Ajouter une légende (facultatif)", d: "Sous une photo ou une vidéo, écrivez quelques mots dans « Ajouter une légende… ». Les liens qui commencent par https:// deviennent cliquables." },
      { t: "Ajouter une musique (facultatif)", d: "En haut à droite, touchez « Musique », cherchez une chanson ou un artiste, choisissez le moment où elle doit commencer, puis « Utiliser cette musique ». La musique s'ajoute aux photos et aux textes (20 secondes). Une vidéo garde son propre son." },
      { t: "Vidéo selfie avec chanson (façon TikTok)", d: "Dans le choix de la musique, la personne peut aussi se filmer pendant que la chanson joue, la mimer ou chanter avec sa propre voix. La vidéo est publiée avec la chanson déjà dedans." },
      { t: "Publier et régler les options", d: "Touchez le bouton d'envoi, puis « Publier ». Une petite fenêtre propose deux choix : « Republication autorisée / bloquée » (les autres peuvent-ils republier ce statut ?) et « Téléchargement autorisé / bloqué » (peuvent-ils l'enregistrer dans leur téléphone ?). Le message « Statut publié ✓ » confirme que c'est fait." },
      { t: "Voir qui a regardé", d: "Rouvrez « Mon statut » : en bas, le nombre de vues. Touchez-le pour voir qui a regardé, les réactions et les réponses. On peut aussi supprimer un statut avant la fin des 24 heures." },
    ],
    tips: [
      "20 statuts en ligne au maximum en même temps. Si la personne est à la limite, elle doit attendre qu'un ancien disparaisse ou en supprimer un.",
      "Une vidéo de plus de 5 minutes est coupée toute seule en plusieurs statuts de 5 minutes, qui se suivent.",
      "Une vidéo ne doit pas dépasser 50 Mo. Si elle est trop lourde : la filmer plus courte, ou en qualité plus basse dans l'appareil photo du téléphone.",
      "Pour regarder un statut : toucher à droite pour avancer, à gauche pour reculer, et garder le doigt posé pour mettre en pause. Quand on écrit une réponse, le statut se met en pause tout seul.",
      "Pour voir les statuts des autres sans qu'ils le sachent : Paramètres → « Voir les statuts en mode invisible ».",
    ],
    problems: [
      { q: "« Je ne trouve pas où publier. »", a: "Onglet Statuts → tout en haut, « Mon statut ». C'est la première ligne de la liste." },
      { q: "« Ma vidéo ne part pas. »", a: "Souvent elle dépasse 50 Mo, ou la connexion a coupé. Vérifier le réseau, puis réessayer avec une vidéo plus courte." },
      { q: "« Mes contacts ne voient pas mon statut. »", a: "Ils doivent être dans les contacts de la personne et avoir eux aussi Epsilon Messenger. Le statut disparaît après 24 heures." },
      { q: "« Je ne peux pas télécharger le statut de quelqu'un. »", a: "La personne qui l'a publié a choisi « Téléchargement bloqué ». On ne peut rien y faire, c'est son choix." },
    ],
  },

  // ───────────────────────────── APPELS ─────────────────────────────
  {
    id: "appels",
    icon: "📞",
    title: "Les appels : audio, vidéo, en groupe et Mode Débat",
    who: "Tous les utilisateurs",
    intro:
      "Les appels passent par Internet (données mobiles ou Wi-Fi), pas par le crédit téléphonique. Ils sont gratuits sur Epsilon, mais consomment des données : la vidéo en consomme beaucoup plus que l'audio.",
    steps: [
      { t: "Appel audio à une personne", d: "Ouvrez la discussion avec la personne. En haut à droite, touchez le combiné 📞. Son téléphone sonne ; dès qu'elle décroche, vous vous entendez." },
      { t: "Appel vidéo à une personne", d: "Dans la même discussion, touchez la caméra 🎥 en haut à droite. La personne apparaît en grand, et vous en petit dans un coin." },
      { t: "Les boutons pendant l'appel", d: "Micro (couper / remettre votre voix), Haut-parleur, Caméra (couper / remettre l'image), Changer de caméra (avant / arrière), Raccrocher (rouge). On peut sortir de l'écran d'appel pour écrire dans une discussion : une petite barre en haut permet d'y revenir." },
      { t: "Arrière-plan pendant un appel vidéo", d: "Touchez « Arrière-plan » : choisissez Flou, Drapeau du Congo, Ma photo, ou une photo de la Galerie. Les autres ne voient plus la pièce derrière vous. « Aucun » enlève l'effet." },
      { t: "Enregistrer un appel", d: "Touchez « Enregistrer ». Les autres voient un bandeau « … enregistre l'appel » : on n'enregistre jamais quelqu'un en cachette. À la fin, l'enregistrement est rangé dans la galerie du téléphone." },
      { t: "Appel de groupe (audio ou vidéo)", d: "Ouvrez la discussion du groupe et touchez 📞 ou 🎥 en haut. L'application demande « Quel type d'appel ? ». Choisissez « Appel normal » : tout le monde peut parler librement. Les membres reçoivent la sonnerie et touchent « Rejoindre ». La personne qui parle s'affiche en grand, les autres en petit en bas." },
      { t: "Ajouter ou faire sonner quelqu'un", d: "Pendant l'appel de groupe, touchez « Ajouter quelqu'un à l'appel » : choisissez un membre du groupe, puis « Faire sonner »." },
      { t: "Quitter ou terminer l'appel de groupe", d: "« Quitter l'appel » : vous partez, les autres continuent. Seule la personne qui a lancé l'appel voit aussi « Terminer l'appel pour tout le monde »." },
    ],
    debate: {
      title: "Le Mode Débat (appel de groupe avec temps de parole)",
      intro: "Pour une réunion, un cours, une assemblée d'église ou un débat : une seule personne parle à la fois, avec un temps de parole, et un modérateur organise.",
      steps: [
        { t: "Lancer le débat", d: "Dans le groupe, touchez 📞 ou 🎥, puis choisissez « Faire un débat ». Réglez le temps de parole de chacun : 1, 2, 3 ou 5 minutes. Touchez « Lancer l'appel »." },
        { t: "Désigner le modérateur", d: "Au début, les participants votent pour le modérateur (« Voter »). La personne qui a lancé l'appel touche « Désigner le modérateur » quand il y a des votes. Le nom du modérateur s'affiche en haut du panneau." },
        { t: "Demander la parole", d: "Les micros sont fermés. Pour parler, touchez « Demander la parole » (on lève la main). Le message « Votre micro s'ouvrira quand vous aurez la parole » rappelle d'attendre. On peut « Baisser la main » si on change d'avis." },
        { t: "Le rôle du modérateur", d: "Il voit les mains levées et donne la « Parole » à quelqu'un. Un chrono décompte le temps. Il peut passer au « Suivant », « Couper » quelqu'un qui dépasse, « Retirer » une personne qui dérange, puis la « Réadmettre »." },
        { t: "Finir le débat", d: "Le modérateur touche « Terminer le débat (retour à l'appel normal) ». L'appel continue, et tout le monde peut de nouveau parler librement." },
      ],
    },
    tips: [
      "Si la voix coupe ou l'image se fige : souvent un réseau faible. Couper la caméra aide beaucoup ; un appel audio passe mieux qu'un appel vidéo.",
      "Le journal des appels (reçus, passés, manqués) est dans l'onglet « Appels », avec un bouton pour rappeler.",
      "La première fois, le téléphone demande l'autorisation pour le micro et la caméra : il faut répondre « Autoriser ».",
    ],
    problems: [
      { q: "« L'autre ne m'entend pas. »", a: "Vérifier que le micro n'est pas coupé (bouton barré). Sinon, dans les réglages du téléphone : Applications → Epsilon Messenger → Autorisations → Micro → Autoriser." },
      { q: "« Mon téléphone ne sonne pas quand on m'appelle. »", a: "Vérifier que les notifications d'Epsilon sont activées dans le téléphone, et que le mode « Ne pas déranger » est coupé." },
      { q: "« Je ne trouve pas le Mode Débat. »", a: "Il n'existe que dans les groupes. Dans une discussion à deux, l'appel est toujours normal." },
    ],
  },

  // ───────────────────────────── BOUTIQUES ─────────────────────────────
  {
    id: "boutique",
    icon: "🏪",
    title: "Ouvrir une boutique",
    who: "Commerçants, artisans, vendeurs",
    intro:
      "Une boutique permet de vendre ses articles dans l'onglet Boutiques (Epsilon Market). Les clients voient les produits, les mettent dans leur panier, et la commande arrive au vendeur dans une discussion.",
    prices: [
      ["Ouverture (comprend le 1er mois)", "600 FCFA"],
      ["Formule Standard, chaque mois", "1 000 FCFA"],
      ["Formule Pro, chaque mois (produits montrés plus souvent, en meilleure place)", "3 000 FCFA"],
    ],
    steps: [
      { t: "Aller dans les Boutiques", d: "Ouvrez l'onglet « Boutiques », puis touchez « Créer ma boutique »." },
      { t: "Lire et accepter les conditions", d: "Une page explique les prix et les règles. Lisez jusqu'en bas, cochez « J'ai lu et j'accepte ces conditions », puis « Suivant »." },
      { t: "Remplir la fiche de la boutique", d: "Nom de la boutique, ville, une courte description de ce que vous vendez, le logo (une photo carrée, nette) et la photo de couverture (la grande image du haut). Enregistrez." },
      { t: "Choisir la monnaie des prix", d: "Dans la même fiche, « Monnaie de vos prix » : franc CFA (Congo et zone CFA), franc congolais (RDC), euro, dollar américain ou dollar canadien. L'application propose celle du pays du vendeur. Attention : dès que la boutique a un produit, la monnaie ne peut plus changer (sinon tous les prix seraient faux)." },
      { t: "Ajouter les premiers produits", d: "Vous pouvez déjà ajouter vos produits (voir la fiche « Ajouter un produit »). La boutique reste cachée au public tant que l'ouverture n'est pas payée." },
      { t: "Payer l'ouverture", d: "Touchez « Payer l'ouverture ». L'application affiche les numéros MTN Mobile Money et Airtel Money d'Epsilon, avec le nom du titulaire. Envoyez 600 FCFA à l'un de ces numéros, depuis votre téléphone, comme un transfert ordinaire." },
      { t: "Recopier la référence du SMS", d: "Après le paiement, MTN ou Airtel envoie un SMS de confirmation. Il contient la référence de la transaction (exemple : « ID : 2610091234567 »). Recopiez-la exactement dans la case, puis touchez « J'ai payé 600 FCFA »." },
      { t: "Attendre la validation", d: "L'équipe Epsilon vérifie que l'argent est bien arrivé avec cette référence, en général le jour même. Dès que c'est validé, la boutique devient visible par tout le monde pendant 30 jours." },
      { t: "Renouveler chaque mois", d: "Tout se gère dans la boutique, menu ⋮ en haut → « Abonnement de la boutique ». L'application prévient avant la fin. Sans paiement, la boutique est cachée au bout de 3 jours, mais rien n'est effacé : il suffit de payer pour réapparaître." },
    ],
    tips: [
      "Une référence de paiement ne sert qu'une seule fois. Si le client recopie une ancienne référence, la demande est refusée.",
      "Le menu ⋮ de la boutique regroupe tout : modifier la boutique, ajouter un produit, mes produits, négociation des prix, faire une publicité, abonnement.",
      "Les clients d'un autre pays voient les prix convertis dans leur monnaie, au taux du jour (« ≈ »), avec le prix exact du vendeur en petit dessous. Le prix fixé par le vendeur ne change jamais tout seul.",
      "Epsilon ne prélève aucune taxe sur les ventes : chaque vendeur fixe ses prix et reste responsable de ses propres taxes.",
      "Règles : produits réels et légaux, prix honnêtes, photos de ses propres articles. Un produit interdit ou trompeur est retiré ; en cas d'abus, la boutique peut être suspendue sans remboursement.",
    ],
    problems: [
      { q: "« J'ai payé mais ma boutique n'apparaît pas. »", a: "Vérifier dans le site (Paiements boutiques) que la déclaration est arrivée. Si la référence n'a pas été saisie, la faire recopier depuis le SMS. Si l'argent n'est pas arrivé sur le compte d'Epsilon, demander une capture du SMS." },
      { q: "« Je ne retrouve pas le SMS. »", a: "Dans le téléphone, ouvrir les messages de MTN MoMo ou d'Airtel Money. On peut aussi composer le menu Mobile Money → Mes transactions." },
      { q: "« Les numéros de paiement ne s'affichent pas. »", a: "C'est de notre côté : prévenir le PDG pour qu'il vérifie les numéros dans le site (Publicités → numéros de paiement)." },
    ],
  },

  // ───────────────────────────── PRODUITS ─────────────────────────────
  {
    id: "produit",
    icon: "🛍️",
    title: "Ajouter un produit dans sa boutique",
    who: "Propriétaires de boutique",
    intro: "Un produit bien présenté se vend mieux : de bonnes photos, un prix clair, une description honnête.",
    steps: [
      { t: "Ouvrir sa boutique", d: "Onglet Boutiques → « Ma boutique ». En haut à droite, touchez les trois points ⋮ → « Ajouter un produit »." },
      { t: "Ajouter les photos et vidéos", d: "Jusqu'à 10 photos ou vidéos, mélangées. La première est celle que les clients voient en premier : choisissez la plus belle. Photographiez de jour, sur un fond simple." },
      { t: "Nom et prix", d: "Un nom clair (exemple : « Pagne wax 6 yards bleu »). Le prix dans la monnaie de la boutique (FCFA, FC, €, $) : en FCFA et en FC sans espace ni point (exemple : 15000) ; en euro ou en dollar, on peut mettre les centimes avec une virgule (exemple : 5,99). Si le prix n'est pas fixé, laisser vide : le client verra « Prix sur demande »." },
      { t: "Prix promo, stock, catégorie", d: "Prix promo (facultatif) : l'ancien prix apparaît barré avec le pourcentage de réduction. Stock : combien d'articles il reste. Catégorie : pour que les clients trouvent le produit plus vite." },
      { t: "Description", d: "Taille, couleur, matière, état (neuf ou occasion). Plus c'est précis, moins le vendeur reçoit de questions." },
      { t: "Livraison et taxes", d: "Cadre « 📦 Livraison et taxes » : dire clairement ce que le prix comprend. Livraison : incluse dans le prix, en plus (avec le montant), à venir chercher, ou à discuter — et la zone (exemple : Brazzaville et Pointe-Noire). Envoi à l'étranger : non, oui avec frais en plus (montant), ou oui inclus. Douane : payée par l'acheteur à l'arrivée, ou comprise dans le prix. Taxes : comprises (TTC) ou hors taxes (HT). Rien n'est obligatoire, mais un prix clair inspire confiance : tout s'affiche sur la fiche du produit et dans le message de commande." },
      { t: "Autorisations", d: "« Republication » : les clients peuvent-ils partager le produit ? « Téléchargement » : peuvent-ils enregistrer les photos ? Le vendeur décide." },
      { t: "Négociation (facultatif)", d: "Si le vendeur accepte que le client propose un prix : activer la négociation, fixer la remise maximale (exemple : 15 %). Il peut aussi choisir d'accepter automatiquement les offres qui restent dans cette limite." },
      { t: "Enregistrer", d: "Touchez Enregistrer. Le produit apparaît tout de suite dans la boutique, et dans l'onglet Boutiques si l'abonnement est payé." },
    ],
    tips: [
      "Pour modifier ou retirer un produit : ⋮ → « Mes produits » → toucher le produit.",
      "Les commandes arrivent dans une discussion avec le client : le vendeur et le client se mettent d'accord sur le paiement et la livraison.",
      "Une offre de prix reste valable 48 heures : passé ce délai, le client doit en refaire une.",
      "Le panier des clients n'a pas de limite. La seule limite est le stock indiqué par le vendeur : sans stock indiqué, le client peut en commander autant qu'il veut.",
    ],
    problems: [
      { q: "« Mon produit n'apparaît pas aux clients. »", a: "La boutique doit être payée et active. Vérifier aussi que le produit n'a pas été retiré pour non-respect des règles." },
      { q: "« La vidéo ne passe pas. »", a: "Vidéo trop lourde ou réseau faible : essayer une vidéo plus courte, ou une photo." },
    ],
  },

  // ───────────────────────────── PORTÉE ET SPONSORING ─────────────────────────────
  {
    id: "portee",
    icon: "🚀",
    title: "Portée des produits et sponsoring",
    who: "Propriétaires de boutique",
    intro:
      "Chaque produit est montré en priorité aux clients proches : à 100 km autour de la ville de la boutique. Les clients plus loin le voient aussi, mais plus bas dans le fil. Pour toucher plus loin, le vendeur peut sponsoriser un produit : sa portée est multipliée par 4 (400 km) pendant 7 jours. Exemple : un produit de Pointe-Noire sponsorisé est montré en priorité jusqu'à Dolisie, Sibiti et Brazzaville.",
    prices: [
      ["Portée normale (comprise dans l'abonnement)", "100 km autour de la ville"],
      ["Sponsoring d'un produit : portée ×4 (400 km) pendant 7 jours", "200 FCFA"],
    ],
    steps: [
      { t: "Bien choisir la ville de la boutique", d: "Menu ⋮ de la boutique → « Modifier la boutique » → Ville : choisir une ville de la liste proposée (exemple : Brazzaville, Pointe-Noire, Dolisie). Une ville non reconnue empêche le calcul de la distance : le produit est alors montré partout, sans priorité." },
      { t: "Ouvrir le produit à sponsoriser", d: "Menu ⋮ → « Mes produits » → toucher le produit. Descendre jusqu'au cadre « 📍 Portée du produit »." },
      { t: "Payer le sponsoring", d: "Touchez « Sponsoriser ce produit ». Envoyez 200 FCFA à l'un des numéros MTN Mobile Money ou Airtel Money d'Epsilon affichés, puis recopiez la référence du SMS de confirmation et touchez « J'ai payé »." },
      { t: "Attendre la validation", d: "L'équipe Epsilon vérifie le code (site : Paiements boutiques). Dès la validation, le produit porte la mention « 🚀 Sponsorisé » et touche les clients à 400 km pendant 7 jours. On peut prolonger de 7 jours à tout moment." },
    ],
    tips: [
      "Le sponsoring se paie produit par produit : on choisit ceux qu'on veut vendre plus vite.",
      "La position du client vient de la ville de son profil (pas du GPS) : rien n'est demandé à son téléphone.",
      "La boutique doit être ouverte (abonnement payé) pour sponsoriser un produit.",
    ],
    problems: [
      { q: "« Mon produit n'est pas vu à Brazzaville. »", a: "Vérifier la ville de la boutique (elle doit être dans la liste). Depuis Pointe-Noire, Brazzaville est à environ 390 km : il faut sponsoriser le produit pour l'atteindre en priorité." },
      { q: "« J'ai payé mais rien ne change. »", a: "Le sponsoring démarre à la validation. Vérifier dans le site (Paiements boutiques) que la déclaration est arrivée et que le code correspond au SMS." },
    ],
  },

  // ───────────────────────────── COMMANDES ─────────────────────────────
  {
    id: "commandes",
    icon: "📦",
    title: "Commandes et suivi du colis",
    who: "Acheteurs et vendeurs",
    intro:
      "Chaque commande passée sur Epsilon (fiche du produit, panier ou prix négocié) est enregistrée avec un numéro (ex. EPS-00012). L'acheteur et le vendeur suivent le colis étape par étape, sur un petit graphique du trajet, mis à jour en temps réel. Le vendeur coche les étapes ; seul l'acheteur peut dire « Commande reçue ».",
    steps: [
      { t: "Passer commande (acheteur)", d: "Sur la fiche du produit : « Acheter » → choisir la quantité → « Envoyer la commande ». Ou depuis le panier : « Confirmer ». Le vendeur reçoit la commande dans une discussion, avec la ligne « 📦 Suivi : Boutiques → Mes commandes (EPS-…) »." },
      { t: "Trouver ses commandes", d: "Acheteur : onglet Boutiques → bouton 📦 à côté de « Ma boutique » (ou « Mes commandes » dans le panier) → onglet « Mes achats ». Vendeur : sa boutique → menu ⋮ → « 🚚 Commandes reçues » (onglet « Mes ventes »)." },
      { t: "Faire avancer le colis (vendeur)", d: "Ouvrir la commande et toucher le bouton « ✅ Marquer : … » pour l'étape suivante. On peut ajouter un petit mot (numéro de suivi, nom du livreur). Chaque étape envoie un message au client, avec une notification." },
      { t: "Les étapes selon la livraison", d: "En ville : commande passée → confirmée → le livreur est en route → reçue. À venir chercher : confirmée → prête → reçue. Par la poste : confirmée → expédiée → disponible à la poste → reçue. À l'étranger : confirmée → expédiée → au port / à l'aéroport de départ → arrivée au port / à l'aéroport → dédouanée → en route ou à la poste → reçue." },
      { t: "Confirmer la réception (acheteur)", d: "Quand le colis est en main (devant le livreur, ou à la poste), toucher « 📦 J'ai reçu ma commande ». Ne jamais le faire avant d'avoir le colis : si la commande a été payée par Epsilon, c'est ce bouton qui verse l'argent au vendeur." },
      { t: "Annuler", d: "L'acheteur peut annuler tant que le vendeur n'a pas confirmé. Le vendeur peut annuler tant que le colis n'est pas parti. Ensuite, il faut s'arranger dans la discussion ou contacter le Service client." },
    ],
    tips: [
      "Paiement au choix de l'acheteur : directement au vendeur (Mobile Money ou espèces), ou « 🔒 Payer par Epsilon » (voir la fiche Paiement sécurisé).",
      "Les conditions de vente du produit (livraison, envoi à l'étranger, douane, taxes) sont recopiées dans le message de commande.",
      "On ne peut pas commander dans sa propre boutique.",
    ],
    problems: [
      { q: "« Je ne vois pas ma commande dans Mes commandes. »", a: "Vérifier l'onglet (Mes achats / Mes ventes). Les commandes passées avant le 16/10/2026 n'ont pas de suivi : elles restent seulement en message dans la discussion." },
      { q: "« Le vendeur n'avance pas mon colis. »", a: "Lui écrire avec le bouton « 💬 Écrire » de la commande. S'il ne répond pas, le client peut contacter le Service client avec le numéro EPS-… de la commande." },
    ],
  },

  // ───────────────────────────── DOCUMENTS OFFICIELS ─────────────────────────────
  {
    id: "documents-officiels",
    icon: "📜",
    title: "FAQ, conditions d'utilisation et confidentialité",
    who: "Tous les utilisateurs",
    intro:
      "Les documents officiels d'Epsilon (FAQ, conditions d'utilisation, politique de confidentialité, règles de communauté, politique des boutiques et du paiement sécurisé) se lisent dans l'application. Ils sont préparés et publiés par le PDG sur le site administrateur (Documents).",
    steps: [
      { t: "Les lire dans l'application", d: "Paramètres → « 📜 Aide et documents » → choisir le document." },
      { t: "Mettre à jour un document (équipe)", d: "Site administrateur → Documents → le document → « ✏️ Modifier » (ou « 📥 Charger le modèle préparé ») → « 💾 Enregistrer en brouillon ». Le public voit toujours la dernière version publiée." },
      { t: "Publier (PDG)", d: "Même écran → « 🚀 Publier » avec une note de version. La nouvelle version apparaît aussitôt dans l'application." },
    ],
    tips: [
      "Données personnelles : pour une demande d'accès, de correction ou de suppression, noter la demande, vérifier l'identité (numéro du compte) et transmettre au PDG ; réponse sous un mois.",
      "Epsilon ne demande JAMAIS le code secret Mobile Money d'un client : le rappeler à toute personne qui dit avoir été contactée par un faux agent.",
    ],
    problems: [
      { q: "« Le document dit : bientôt disponible. »", a: "Il n'a pas encore été publié par le PDG (Documents → Publier), ou le fichier SQL 77 n'est pas encore exécuté." },
    ],
  },

  // ───────────────────────────── PAIEMENT SÉCURISÉ ─────────────────────────────
  {
    id: "paiement-securise",
    icon: "🔒",
    title: "Paiement sécurisé par Epsilon",
    who: "Acheteurs et vendeurs",
    intro:
      "L'acheteur peut payer sa commande à Epsilon au lieu du vendeur. Epsilon garde l'argent pendant la livraison, puis le verse au vendeur (moins 3 % de commission) quand l'acheteur confirme la réception. S'il y a un problème, l'argent reste bloqué et Epsilon tranche : remboursement ou paiement du vendeur. C'est au choix de l'acheteur : payer directement le vendeur reste possible (sans cette protection).",
    steps: [
      { t: "Payer par Epsilon (acheteur)", d: "Mes commandes → ouvrir la commande → « 🔒 Payer par Epsilon ». Choisir MTN MoMo ou Airtel Money, envoyer le montant exact au numéro Epsilon affiché (touchez-le pour le copier)." },
      { t: "Donner le code du SMS (acheteur)", d: "Recopier le code de la transaction indiqué dans le SMS de confirmation, puis « J'ai payé — envoyer le code ». La commande affiche « ⏳ Paiement en vérification »." },
      { t: "Vérification par Epsilon", d: "Sur le site : « Paiements sécurisés » → « À vérifier ». On recopie le code du SMS reçu sur le téléphone d'Epsilon : il doit être identique. La commande passe à « 🔒 Payée — argent gardé par Epsilon » chez l'acheteur et le vendeur." },
      { t: "Expédier (vendeur)", d: "Attendre « 🔒 Payée » avant d'expédier, puis cocher les étapes comme d'habitude. La commande indique combien le vendeur recevra (montant moins 3 %)." },
      { t: "Versement au vendeur", d: "Dès que l'acheteur touche « 📦 J'ai reçu ma commande », l'argent passe dans le solde du vendeur. Si l'acheteur ne fait rien, le versement se fait tout seul 3 jours après la dernière étape de livraison, sans réclamation." },
      { t: "Retirer son argent (vendeur)", d: "Mes commandes → onglet « Mes ventes » → carte « 💼 Mon solde » → « Retirer » (500 FCFA minimum), choisir MTN ou Airtel et le numéro. Sur le site, la demande arrive dans « Versements à faire » : on envoie l'argent, on recopie le code de la transaction, puis « Payé »." },
      { t: "Problème avec la commande (acheteur)", d: "Avant de confirmer la réception : « ⚠️ Signaler un problème » sur la commande, et expliquer. L'argent est bloqué. Sur le site, « Litiges » : on écoute les deux côtés, puis « Payer le vendeur » ou « Rembourser l'acheteur » (le remboursement arrive dans « Versements à faire »)." },
    ],
    tips: [
      "Seules les commandes en FCFA peuvent être payées par Epsilon (Mobile Money Congo).",
      "Un code de transaction ne peut servir qu'une seule fois, pour toujours.",
      "Si la commande est annulée alors que l'argent est gardé, l'acheteur est remboursé automatiquement (le remboursement apparaît dans « Versements à faire »).",
      "La commission et le délai du versement automatique se règlent sur le site (« Paiements sécurisés » → Réglages, PDG).",
    ],
    problems: [
      { q: "« Mon paiement est refusé. »", a: "Le motif est écrit sur la commande. Le plus souvent, le code ne correspond pas : recopier exactement le code du SMS de confirmation et le renvoyer depuis la commande." },
      { q: "« Je n'ai pas encore reçu mon argent (vendeur). »", a: "Vérifier sur la commande : l'argent est versé quand le client confirme la réception, ou automatiquement 3 jours après la livraison. Ensuite il faut demander un « Retrait » depuis « Mon solde »." },
      { q: "« J'ai été remboursé mais je n'ai rien reçu. »", a: "Le remboursement est envoyé par Mobile Money par l'équipe Epsilon, en général le jour même. Vérifier dans « Paiements sécurisés » → « Versements à faire »." },
    ],
  },

  // ───────────────────────────── MONNAIES ET PAYS ─────────────────────────────
  {
    id: "monnaies",
    icon: "💱",
    title: "Pays, monnaies et prix convertis",
    who: "Tous les utilisateurs, surtout hors du Congo",
    intro:
      "Epsilon est ouvert dans 14 pays : Congo, RDC, Sénégal, Mali, Burkina Faso, Niger, Côte d'Ivoire, Cameroun, Bénin, Tchad, Gabon, France, Belgique, États-Unis / Canada. Chaque boutique choisit sa monnaie ; chaque client voit les prix dans la sienne, convertis au taux du jour. Les prix fixés par les vendeurs ne changent jamais tout seuls.",
    prices: [
      ["Franc CFA (zone CFA)", "fixe : 1 € = 655,957 francs CFA"],
      ["Franc congolais, dollar US, dollar canadien", "taux du jour, mis à jour chaque jour"],
    ],
    steps: [
      { t: "S'inscrire depuis un autre pays", d: "Sur l'écran d'inscription, toucher le drapeau 🇨🇬 +242 à côté du numéro et choisir son pays. Le code arrive par e-mail, gratuitement, dans tous les pays." },
      { t: "Choisir la monnaie de sa boutique (vendeur)", d: "Boutique → ⋮ → « Modifier la boutique » → « Monnaie de vos prix ». Attention : dès que la boutique a un produit, la monnaie ne peut plus changer." },
      { t: "Lire un prix converti (client)", d: "Un prix venant d'une boutique d'une autre monnaie s'affiche avec « ≈ » (ex. « ≈ 0,99 € »), et le prix exact du vendeur en petit dessous (ex. « 650 FCFA »). La commande se règle au prix exact du vendeur." },
      { t: "Changer la monnaie d'affichage", d: "Paramètres → « 💱 Monnaie des prix » : choisir une autre monnaie (ex. un Congolais en France qui veut voir en euros, un Canadien en dollars canadiens), ou « Celle de mon pays »." },
    ],
    tips: [
      "Les tarifs d'Epsilon (abonnement, sponsoring, publicités, chaînes TV) sont en FCFA ; un vendeur étranger voit l'équivalent dans sa monnaie.",
      "Dans le Service client, « 📘 Envoyer une fiche » convertit automatiquement les montants dans la monnaie du pays du client.",
    ],
    problems: [
      { q: "« Le prix converti n'est pas exactement le même qu'hier. »", a: "C'est normal : le taux du dollar et du franc congolais change chaque jour. Le prix du vendeur, lui, ne change pas." },
    ],
  },

  // ───────────────────────────── COMPTE ET SÉCURITÉ ─────────────────────────────
  {
    id: "compte",
    icon: "🔐",
    title: "Compte : inscription, connexion, deux comptes et code secret",
    who: "Tous les utilisateurs",
    intro:
      "Un compte Epsilon, c'est un numéro de téléphone (il identifie le compte) et une adresse e-mail (elle sert à recevoir le code de connexion et à récupérer le compte). Les discussions sont chiffrées de bout en bout et protégées par un code secret que seule la personne connaît.",
    steps: [
      { t: "S'inscrire", d: "Ouvrir l'application, entrer son numéro de téléphone et son adresse e-mail, puis « Continuer ». Un code à 6 chiffres arrive par e-mail : le taper dans l'application. Si l'e-mail contient un lien au lieu d'un code, toucher simplement ce lien." },
      { t: "Créer son profil", d: "Prénom, nom, âge, sexe, ville, région et photo de profil, plus une petite phrase de statut (ex. « Disponible »). Toucher « Terminer »." },
      { t: "Créer son code secret", d: "L'application demande un code secret pour protéger les discussions : au moins 8 caractères, avec des lettres et des chiffres. Le retaper, cocher « J'ai écrit mon code secret quelque part », puis « Activer le chiffrement »." },
      { t: "Se connecter sur un nouveau téléphone", d: "Entrer le numéro du compte et son adresse e-mail, taper le code reçu par e-mail, puis entrer le code secret pour retrouver ses anciennes discussions. Sur le même téléphone, le code secret n'est jamais redemandé." },
      { t: "Changer de code secret", d: "Paramètres → « Chiffrement de bout en bout » → entrer le nouveau code deux fois → « Enregistrer le nouveau code »." },
      { t: "Avoir deux comptes sur le même téléphone", d: "Paramètres → « Changer de compte » → « Ajouter un compte ». 2 comptes au maximum. On passe de l'un à l'autre d'un toucher, sans se déconnecter." },
      { t: "Se déconnecter ou retirer un compte", d: "« Se déconnecter » laisse le compte sur le téléphone (on y revient d'un toucher). « Retirer de ce téléphone » l'enlève de la liste, sans le supprimer : on peut revenir plus tard avec son numéro et le code reçu par e-mail." },
    ],
    tips: [
      "Personne ne peut lire les discussions : ni Epsilon, ni un pirate. C'est pour ça que l'équipe ne peut PAS retrouver un code secret oublié. Conseiller de l'écrire sur papier, dans un carnet.",
      "Une même adresse e-mail peut servir à plusieurs numéros (par exemple pour un proche qui n'a pas d'e-mail). C'est le numéro qui identifie le compte.",
      "Le numéro et l'adresse e-mail ne sont pas visibles par les autres utilisateurs.",
      "Langue : Paramètres → « Langue de l'application » (français, anglais, chinois, espagnol) ; elle s'applique à toute l'application. Thème : Paramètres → Apparence (clair, moyen, sombre).",
      "Nouvelle version : un bandeau « Nouvelle version d'Epsilon disponible » apparaît dans Discussions. Toucher « Mettre à jour », puis « Installer ». Les discussions sont conservées.",
      "Ne pas apparaître « en ligne » : Paramètres → « Masquer quand je suis en ligne ».",
    ],
    problems: [
      { q: "« Je ne reçois pas le code. »", a: "Regarder dans les courriers indésirables (spam) de la boîte e-mail, vérifier que l'adresse est bien écrite, attendre une minute puis toucher « Renvoyer le code »." },
      { q: "« J'ai oublié mon code secret. »", a: "Personne ne peut le retrouver, pas même Epsilon. Sur l'écran du code, toucher « J'ai oublié mon code » puis « Continuer sans mes anciens messages » : le compte repart avec un nouveau code, mais les anciens messages ne pourront plus être lus sur ce téléphone." },
      { q: "« Ce numéro est déjà lié à une autre adresse e-mail. »", a: "Il faut entrer l'adresse e-mail utilisée à l'inscription de ce numéro. Si la personne ne s'en souvient plus, la passer à un conseiller." },
      { q: "« Je ne peux pas ajouter un troisième compte. »", a: "2 comptes au maximum par téléphone : retirer d'abord l'un des deux (« Retirer de ce téléphone »)." },
    ],
  },

  // ───────────────────────────── DISCUSSIONS, GROUPES, SIGNALER ─────────────────────────────
  {
    id: "discussions",
    icon: "💬",
    title: "Discussions et groupes : écrire, bloquer, signaler",
    who: "Tous les utilisateurs",
    intro:
      "Les discussions marchent en temps réel : le message arrive tout de suite, et on voit quand l'autre est en train d'écrire. On peut envoyer du texte, des messages vocaux, des photos, des vidéos, des documents et des produits des boutiques. Les groupes réunissent jusqu'à 256 membres.",
    steps: [
      { t: "Commencer une discussion", d: "Onglet Discussions → bouton « + » en bas à droite → choisir un contact. Seules les personnes inscrites sur Epsilon apparaissent dans « Contacts sur Epsilon »." },
      { t: "Envoyer une photo, une vidéo ou un vocal", d: "Dans la discussion : l'icône appareil photo (prendre une photo/vidéo ou choisir dans la galerie), le trombone (document ou produit), et le micro (garder le doigt pour un message vocal)." },
      { t: "Créer un groupe", d: "Onglet Discussions → bouton « + » en bas à droite → « Nouveau groupe ». Donner un nom (et une photo si on veut), « Suivant », puis choisir les membres." },
      { t: "Gérer un groupe", d: "Ouvrir le groupe → toucher son nom en haut (« Infos du groupe »). Les admins peuvent ajouter ou retirer des membres, changer le nom et la photo, nommer d'autres admins et supprimer un message pour tout le monde." },
      { t: "Bloquer quelqu'un", d: "Ouvrir son profil (toucher son nom en haut de la discussion) → « Bloquer … ». Cette personne ne pourra plus vous envoyer de messages ; elle n'est pas prévenue. Pour annuler : même endroit → « Débloquer »." },
      { t: "Signaler un message", d: "Garder le doigt sur le message → « Signaler » → choisir le motif → « Envoyer le signalement ». Le téléphone envoie à l'équipe ce message et les 10 messages précédents, rien d'autre de la discussion." },
    ],
    tips: [
      "Un message commencé et pas envoyé est gardé (brouillon), même si on quitte l'application.",
      "Pour un statut, un profil ou un produit : toucher « ⋮ » puis « Signaler ».",
      "Le fond d'écran des discussions se change dans Paramètres → « Fond d'écran des discussions ».",
    ],
    problems: [
      { q: "« Je ne trouve pas mon ami dans les contacts. »", a: "Son numéro doit être enregistré dans le téléphone et il doit être inscrit sur Epsilon. Bouton « + » des Discussions → « Mettre à jour mes contacts ». Sinon, l'inviter avec le bouton « Inviter »." },
      { q: "« Message illisible sur ce téléphone. »", a: "Le compte a été ouvert sur un nouveau téléphone sans le code secret. Il faut entrer le bon code secret pour lire les anciens messages (voir la fiche Compte)." },
      { q: "« Quelqu'un me harcèle. »", a: "Le bloquer depuis son profil, et signaler ses messages. L'équipe examine chaque signalement. En cas de danger, contacter aussi la police." },
    ],
  },

  // ───────────────────────────── EPSILON IA ─────────────────────────────
  {
    id: "epsilon-ia",
    icon: "🤖",
    title: "Epsilon IA : l'assistante du Service client",
    who: "Tous les utilisateurs (et l'équipe du Service client)",
    intro:
      "Epsilon IA est l'assistante automatique d'Epsilon. Elle répond tout de suite, jour et nuit, dans la discussion « Service client Epsilon », à partir de ces fiches pratiques, dans la langue de la personne. Quand la réponse n'est pas dans les fiches, ou quand il faut une décision humaine, elle passe la main à un conseiller.",
    steps: [
      { t: "Poser une question", d: "Ouvrir la discussion « Service client Epsilon » (épinglée en premier) et écrire sa question. Epsilon IA répond en quelques secondes ; ses messages portent la mention « 🤖 Epsilon IA »." },
      { t: "Parler à un conseiller", d: "Sous la réponse d'Epsilon IA, toucher « 👤 Parler à un conseiller ». Un membre de l'équipe répond dans la même discussion dès que possible ; Epsilon IA se tait pendant 24 heures." },
      { t: "Pour l'équipe : suivre Epsilon IA", d: "Site administrateur → « Epsilon IA » : l'allumer ou l'éteindre, voir les questions du jour, celles qu'elle a transmises et celles où la personne a demandé un conseiller. Une question sans réponse = une fiche à compléter." },
    ],
    tips: [
      "Epsilon IA ne valide jamais un paiement, ne débloque pas un compte, ne traite pas un signalement et ne rembourse pas : elle transmet à l'équipe.",
      "Elle ne répond pas aux messages vocaux : un conseiller les écoute.",
      "Quand un conseiller répond dans une discussion, Epsilon IA se tait pendant 12 heures dans cette discussion.",
      "Elle peut se tromper : en cas de doute, demander un conseiller.",
    ],
    problems: [
      { q: "« L'IA ne m'a pas compris. »", a: "Reformuler la question en une phrase simple, ou toucher « 👤 Parler à un conseiller »." },
    ],
  },

  // ───────────────────────────── CONTACTS ─────────────────────────────
  {
    id: "contacts",
    icon: "👥",
    title: "Contacts : retrouver ses proches sur Epsilon",
    who: "Tous les utilisateurs",
    intro:
      "Epsilon retrouve tout seul, dans le répertoire du téléphone, les personnes déjà inscrites (comme WhatsApp). La liste se met à jour à chaque ouverture de l'application, et avec le bouton « Actualiser mes contacts ».",
    steps: [
      { t: "Autoriser l'accès aux contacts", d: "À la première ouverture, Android demande l'autorisation : toucher « Autoriser ». Si elle a été refusée : Paramètres du téléphone → Applications → Epsilon → Autorisations → Contacts → Autoriser." },
      { t: "Voir ses contacts", d: "Discussions → bouton de nouvelle discussion : en haut, « … contacts sur Epsilon », puis la liste. Les contacts pas encore inscrits sont plus bas, avec « Inviter »." },
      { t: "Un nouveau contact enregistré dans le téléphone", d: "Fermer et rouvrir Epsilon, ou toucher « Actualiser mes contacts ». Il apparaît s'il est inscrit sur Epsilon avec CE numéro." },
      { t: "Ajouter un contact à la main", d: "« Ajouter un contact » : nom + numéro (choisir le pays devant le numéro). Le message dit tout de suite si la personne est sur Epsilon ou non." },
    ],
    tips: [
      "Les contacts sont reconnus quelle que soit l'écriture du numéro : 06 123 45 67, +242 06 123 45 67, 00242…",
      "Le compteur d'abonnés d'une chaîne ou d'une boutique compte tout le monde, sans montrer qui sont les abonnés.",
    ],
    problems: [
      { q: "« Mon ami est inscrit mais n'apparaît pas. »", a: "Vérifier qu'il s'est inscrit avec le même numéro que celui enregistré dans le téléphone (beaucoup ont deux puces MTN / Airtel). Puis fermer et rouvrir Epsilon." },
      { q: "« Un message rouge apparaît en actualisant. »", a: "Faire une capture du message et l'envoyer au PDG : le détail (en petit) permet de corriger tout de suite." },
    ],
  },

  // ───────────────────────────── PARTAGE ─────────────────────────────
  {
    id: "partage",
    icon: "📤",
    title: "Partager une photo, une vidéo ou un fichier",
    who: "Tous les utilisateurs",
    intro: "Une photo, une vidéo, un vocal ou un document reçu dans une discussion peut être envoyé vers WhatsApp, Facebook, Bluetooth, e-mail… comme sur les grands réseaux sociaux.",
    steps: [
      { t: "Ouvrir le menu du message", d: "Dans la discussion, appuyer longtemps sur la photo, la vidéo ou le fichier." },
      { t: "Partager", d: "Toucher « Partager ». Epsilon affiche « ⏳ Préparation du partage… » le temps de récupérer le fichier, puis Android propose la liste des applications." },
      { t: "Mettre l'application à jour si besoin", d: "Si Epsilon propose une mise à jour, accepter : le partage des fichiers demande la version d'Epsilon du 12/10/2026 ou plus récente. Ou : Paramètres → « Mises à jour de l'application »." },
    ],
    problems: [
      { q: "« Le partage copie seulement un texte. »", a: "L'application du téléphone est trop ancienne : la mettre à jour (Paramètres → Mises à jour de l'application)." },
      { q: "« Le fichier n'a pas pu être préparé. »", a: "Connexion trop faible pour une grosse vidéo : réessayer avec une meilleure connexion (Wi-Fi ou 4G)." },
    ],
  },

  // ───────────────────────────── PUBLICITÉS ─────────────────────────────
  {
    id: "publicite",
    icon: "📣",
    title: "Faire une publicité dans Epsilon Market",
    who: "Propriétaires de boutique",
    intro:
      "La publicité met une boutique ou un produit tout en haut de l'onglet Boutiques, vu par tous les utilisateurs. Chacun voit les publicités dans un ordre différent, pour que tout le monde ait sa chance.",
    prices: [
      ["2 jours", "500 FCFA"],
      ["5 jours", "1 000 FCFA"],
      ["7 jours (1 semaine)", "1 500 FCFA"],
    ],
    steps: [
      { t: "Ouvrir le formulaire", d: "Dans sa boutique : ⋮ → « Faire une publicité ». On le trouve aussi en touchant le cadre « 📣 Votre publicité ici » en haut de l'onglet Boutiques (quand il est libre)." },
      { t: "Choisir ce qu'on met en avant", d: "Toute la boutique, ou un produit précis." },
      { t: "Choisir le visuel", d: "Soit une vidéo de 30 secondes au maximum, soit de 1 à 5 images qui défilent (un diaporama de 30 secondes en tout). Si la vidéo est plus longue, l'application propose de garder les 30 premières secondes, celles du milieu ou les dernières. Ajouter un court texte si on veut." },
      { t: "Choisir la durée", d: "2 jours, 5 jours ou 1 semaine. Le prix s'affiche." },
      { t: "Payer", d: "Envoyer le montant par MTN Mobile Money ou Airtel Money à l'un des numéros d'Epsilon affichés, puis recopier la référence du SMS de confirmation." },
      { t: "Envoyer la demande", d: "Touchez Envoyer. L'application prépare et allège la vidéo avant l'envoi (cela prend environ le temps de la vidéo) : il faut garder l'application ouverte pendant ce temps." },
      { t: "Validation par le PDG", d: "La demande attend la validation d'Epsilon. Après vérification du paiement, la publicité passe en ligne. Elle s'arrête toute seule à la fin de la durée choisie." },
      { t: "Suivre ses publicités", d: "⋮ → « Mes publicités » : en attente, en ligne, terminées, ou refusées (avec le motif)." },
    ],
    tips: [
      "Une référence de paiement ne sert qu'une fois, comme pour les boutiques.",
      "Une vidéo nette, tournée de jour, avec le produit bien visible dès les premières secondes, donne de bien meilleurs résultats.",
      "Publicités refusées : contenu trompeur, produit interdit, ou paiement introuvable.",
    ],
    problems: [
      { q: "« Ma publicité n'est pas encore en ligne. »", a: "Elle attend la validation du PDG. Vérifier dans le site (Publicités → en attente) que le paiement correspond bien à la référence." },
      { q: "« L'envoi de la vidéo reste bloqué. »", a: "Réseau faible ou application fermée pendant la préparation. Recommencer avec l'application ouverte, ou choisir des images à la place." },
    ],
  },

  // ───────────────────────────── COMMUNIQUÉS ─────────────────────────────
  {
    id: "communiques",
    icon: "📢",
    title: "Les communiqués",
    who: "Équipe Epsilon · entreprises et organisations qui le demandent",
    intro:
      "Un communiqué officiel arrive chez tous les utilisateurs, dans la discussion « Service client Epsilon », avec une notification sur le téléphone. C'est un canal précieux : on ne l'utilise que pour des informations importantes, sinon les gens finissent par ne plus lire.",
    steps: [
      { t: "Qui peut envoyer un communiqué", d: "Seule l'équipe Epsilon, depuis le site, rubrique Service client → « 📢 Annonce à tous les utilisateurs ». Le texte peut être envoyé par un administrateur qui a la permission « Répondre aux messages des clients ». Les photos, vidéos et documents sont réservés au PDG." },
      { t: "Écrire le communiqué", d: "Un titre clair au début (exemple : « 📢 Coupure de service samedi »). Ensuite : ce qui se passe, quand, ce que les gens doivent faire. Des phrases courtes, sans fautes, et signé « L'équipe Epsilon Messenger »." },
      { t: "Relire avant d'envoyer", d: "Une fois parti, le message arrive chez tout le monde en même temps. Faire relire par une deuxième personne si le sujet est sensible (santé, sécurité, argent)." },
      { t: "Envoyer", d: "Touchez « 📢 Envoyer à tous » : l'annonce est publiée dans la discussion Service client de chaque utilisateur, puis les notifications partent. Une annonce envoyée par erreur peut être retirée depuis la même rubrique." },
      { t: "Quand une entreprise, une église ou une association veut faire passer un communiqué", d: "La personne contacte le Service client Epsilon (la discussion épinglée en haut de l'application). On note : le nom de l'organisation, un responsable joignable, le texte exact, la date souhaitée. On transmet au PDG, qui décide : on ne diffuse jamais le message d'un tiers à tous les utilisateurs sans son accord." },
      { t: "Proposer la bonne solution au demandeur", d: "Pour vendre ou faire connaître un produit : la publicité dans Epsilon Market (dès 500 FCFA). Pour une télé, une église ou un média qui veut parler régulièrement à son public : une chaîne Epsilon TV. Pour toucher seulement ses contacts : un simple statut." },
    ],
    tips: [
      "Les messages automatiques (bienvenue, maintenance) se règlent juste au-dessus, dans « Messages automatiques ». Ce ne sont pas des communiqués : ils partent tout seuls.",
      "Éviter d'envoyer plus d'un communiqué par semaine, sauf urgence.",
      "Ne jamais mettre de numéro de paiement dans un communiqué sans l'accord du PDG : les escrocs copient ce genre de message.",
    ],
    problems: [
      { q: "« J'ai reçu un message d'Epsilon, c'est vrai ? »", a: "Les vrais communiqués arrivent uniquement dans la discussion « Service client Epsilon », épinglée en haut. Un message venu d'un autre numéro qui se présente comme Epsilon est faux : demander au client de le signaler." },
    ],
  },

  // ───────────────────────────── EPSILON TV ─────────────────────────────
  {
    id: "tv",
    icon: "📺",
    title: "Ouvrir une chaîne Epsilon TV",
    who: "Télévisions, radios, églises, entreprises, associations, artistes",
    intro:
      "Une chaîne Epsilon TV diffuse des vidéos dans l'onglet TV de l'application : en différé (vidéos publiées, regardables à tout moment) et en direct. Les gens suivent la chaîne comme on s'abonne à une page. C'est Epsilon qui ouvre la chaîne, après paiement.",
    pricing: {
      base: "Tarif : 1,20 FCFA par minute regardée, avec des minutes offertes dans les formules (Bronze +5 %, Argent +10 %, Platine +15 %, Or +20 %). Une « minute regardée », c'est 1 spectateur qui regarde le direct pendant 1 minute : si 100 personnes regardent 1 heure, cela fait 100 × 60 = 6 000 minutes, soit 7 200 FCFA. Les vidéos en différé ne consomment pas de minutes : elles se paient à part, selon l'espace occupé (voir la fiche « Epsilon TV : stockage des vidéos »).",
      head: ["Formule (1 mois)", "Prix", "Minutes regardées", "1 émission d'1 h par semaine : spectateurs", "1 h de direct chaque jour : spectateurs"],
      priceCol: 1,
      rows: [
        ["Bronze", "24 000 FCFA", "21 000 min (+5 % offerts)", "jusqu'à 85", "jusqu'à 10"],
        ["Argent", "120 000 FCFA", "110 000 min (+10 % offerts)", "jusqu'à 455", "jusqu'à 60"],
        ["Platine", "300 000 FCFA", "287 500 min (+15 % offerts)", "jusqu'à 1 195", "jusqu'à 155"],
        ["Or", "600 000 FCFA", "600 000 min (+20 % offerts)", "jusqu'à 2 500", "jusqu'à 330"],
        ["Sur mesure", "1,20 FCFA la minute", "au choix", "selon l'événement", "selon l'événement"],
      ],
      tables: [
        { title: "Combien coûte UN direct (au prix de base, 1,20 FCFA la minute)", head: ["Spectateurs en moyenne", "1 heure", "2 heures", "3 heures", "4 heures"], rows: [
          ["50", "3 600 FCFA", "7 200 FCFA", "10 800 FCFA", "14 400 FCFA"],
          ["100", "7 200 FCFA", "14 400 FCFA", "21 600 FCFA", "28 800 FCFA"],
          ["200", "14 400 FCFA", "28 800 FCFA", "43 200 FCFA", "57 600 FCFA"],
          ["500", "36 000 FCFA", "72 000 FCFA", "108 000 FCFA", "144 000 FCFA"],
          ["1 000", "72 000 FCFA", "144 000 FCFA", "216 000 FCFA", "288 000 FCFA"],
        ] },
        { title: "Bronze — 24 000 FCFA (21 000 minutes, bonus compris) : combien de directs par mois", head: ["Spectateurs", "Directs d'1 h", "Directs de 2 h", "Directs de 3 h", "Directs de 4 h"], rows: [
          ["50", "7", "3", "2", "1"],
          ["100", "3", "1", "1", "—"],
          ["200", "1", "—", "—", "—"],
        ] },
        { title: "Argent — 120 000 FCFA (110 000 minutes, bonus compris) : combien de directs par mois", head: ["Spectateurs", "Directs d'1 h", "Directs de 2 h", "Directs de 3 h", "Directs de 4 h"], rows: [
          ["50", "36", "18", "12", "9"],
          ["100", "18", "9", "6", "4"],
          ["200", "9", "4", "3", "2"],
          ["500", "3", "1", "1", "—"],
          ["1 000", "1", "—", "—", "—"],
        ] },
        { title: "Platine — 300 000 FCFA (287 500 minutes, bonus compris) : combien de directs par mois", head: ["Spectateurs", "Directs d'1 h", "Directs de 2 h", "Directs de 3 h", "Directs de 4 h"], rows: [
          ["50", "95", "47", "31", "23"],
          ["100", "47", "23", "15", "11"],
          ["200", "23", "11", "7", "5"],
          ["500", "9", "4", "3", "2"],
          ["1 000", "4", "2", "1", "1"],
        ] },
        { title: "Or — 600 000 FCFA (600 000 minutes, bonus compris) : combien de directs par mois", head: ["Spectateurs", "Directs d'1 h", "Directs de 2 h", "Directs de 3 h", "Directs de 4 h"], rows: [
          ["50", "200", "100", "66", "50"],
          ["100", "100", "50", "33", "25"],
          ["200", "50", "25", "16", "12"],
          ["500", "20", "10", "6", "5"],
          ["1 000", "10", "5", "3", "2"],
        ] },
      ],
      examples: [
        "Journal télévisé d'1 h chaque jour (30 directs) devant 100 personnes : 30 × 60 × 100 = 180 000 minutes → formule Platine (287 500 minutes, 47 directs d'1 h possibles) : il reste de la marge pour les jours de forte audience. En Sur mesure, ce serait 216 000 FCFA, sans aucune marge.",
        "Église : culte de 3 h chaque dimanche (4 directs) devant 50 fidèles : 4 × 180 × 50 = 36 000 minutes → 43 200 FCFA en Sur mesure (Bronze ne suffit pas, Argent en donne trois fois plus).",
        "Radio : émission de 2 h chaque semaine (4 directs) devant 200 auditeurs : 4 × 120 × 200 = 96 000 minutes → formule Argent (110 000 minutes avec le bonus) pour 120 000 FCFA, au lieu de 115 200 FCFA en Sur mesure sans marge.",
        "Concert de 4 h, une seule fois, devant 1 000 personnes : 240 000 minutes → formule Platine (287 500 minutes) pour 300 000 FCFA, ou 288 000 FCFA en Sur mesure.",
        "Les formules donnent des minutes en plus (bonus de 5 à 20 %) : dès que le besoin approche d'une formule, elle est plus avantageuse que le Sur mesure.",
      ],
      note: "« — » : la formule ne suffit pas, même pour un seul direct. Les spectateurs sont une moyenne : les gens arrivent et repartent pendant le direct.",
      extra: [
        "Recharge en cours de mois : 10 000 minutes = 12 000 FCFA (ou toute autre quantité, à 1,20 FCFA la minute).",
        "On peut payer 1, 3, 6 ou 12 mois d'avance : le prix et les minutes sont multipliés par le nombre de mois.",
        "La chaîne ne paie jamais plus que ce qu'elle a acheté : quand ses minutes sont épuisées, elle recharge.",
        "Si la chaîne renouvelle avant la fin de sa formule, les minutes qui lui restent sont gardées.",
      ],
    },
    steps: [
      { t: "Premier contact", d: "Le responsable de la chaîne écrit ou appelle le Service client Epsilon. On note : le nom de la chaîne, le type (télé, radio, église, entreprise…), la ville, le nom et le numéro du responsable, ce qu'il veut diffuser, et à quelle fréquence." },
      { t: "Le responsable crée son compte", d: "Il doit avoir un compte Epsilon Messenger à son nom, sur le numéro qui gérera la chaîne. Sans compte, on ne peut pas lui confier la chaîne." },
      { t: "Choisir la formule", d: "On l'aide à calculer avec une question simple : combien d'heures de direct par mois, et combien de personnes regardent à peu près ? On multiplie : heures × 60 × spectateurs. Exemple : une église qui fait 4 cultes d'1 h par mois, suivis par 50 fidèles en ligne → 4 × 60 × 50 = 12 000 minutes → formule Bronze (21 000 minutes avec le bonus), avec de la marge. Les tableaux ci-dessus donnent directement la réponse. Au début, conseiller la plus petite formule qui suffit : la chaîne pourra toujours recharger." },
      { t: "Préparer le logo et la présentation", d: "Le logo de la chaîne (image carrée, nette) et deux ou trois lignes de présentation. Ils seront affichés dans l'onglet TV." },
      { t: "Paiement", d: "Le responsable envoie le total du contrat (formule de direct + stockage, voir la fiche du stockage) par MTN Mobile Money ou Airtel Money aux numéros d'Epsilon, puis transmet la référence du SMS de confirmation. Le paiement en espèces est possible, avec un reçu." },
      { t: "Création et activation (PDG)", d: "Dans le site : Epsilon TV → « Nouvelle chaîne » (nom, présentation, logo, numéro du responsable) → « Créer la chaîne ». Puis activer sa formule : choisir la formule et la durée, recopier la référence du paiement (ou cocher « Payé en espèces ») et confirmer avec le code PDG. La chaîne apparaît aussitôt dans l'onglet TV." },
      { t: "Publier des vidéos (différé)", d: "Le responsable ouvre l'onglet TV → sa chaîne (« Ma chaîne ») → « Publier une vidéo » : un titre, la vidéo (1 Go au maximum ; au-delà de 90 Mo elle part en plusieurs morceaux, avec le pourcentage affiché : il faut rester sur l'écran avec une bonne connexion), puis « Publier ». Il peut supprimer une vidéo à tout moment." },
      { t: "Le direct", d: "Onglet TV → Ma chaîne → « 🔴 Passer en direct » (le bouton montre les minutes restantes) : autoriser la caméra et le micro, taper un titre, puis « Démarrer le direct ». Les abonnés reçoivent une notification ; les spectateurs voient « EN DIRECT », écrivent des commentaires et envoient des ❤️. Le présentateur peut changer de caméra, couper le micro, et toucher « 🎞️ Régie » pour balancer une vidéo de la chaîne (reportage, publicité) : tout le monde la voit en même temps, puis l'image revient sur la caméra. Important : rester sur l'écran du direct (si on quitte Epsilon, la caméra du téléphone s'arrête). Chaque minute regardée par chaque spectateur est décomptée de la formule ; le direct s'arrête tout seul quand les minutes sont épuisées." },
      { t: "Directs programmés", d: "Onglet « 🔴 Directs » de la chaîne → « Programmer un direct » : titre, jour et heure à la seconde (ex. 20:00:00), durée prévue. La page de pub qui précède se termine pile à l'heure ; les spectateurs voient « le direct va commencer » jusqu'à ce que le présentateur le lance." },
      { t: "Suivi et renouvellement", d: "Sur sa chaîne, le responsable voit sa formule, les jours restants et les minutes déjà consommées. L'application le prévient avant la fin. Sans renouvellement, la chaîne n'est plus visible, mais ses vidéos ne sont pas effacées." },
    ],
    tips: [
      "Formats de vidéo : MP4 (H.264) de préférence. Les fichiers AVI, WMV, FLV ou MPEG sont refusés à l'envoi, car les téléphones ne savent pas les lire ; une vidéo de ce format déjà publiée n'est jamais diffusée (⚠️ dans la liste des vidéos) : la convertir en MP4 et la republier.",
      "Si une vidéo ne se lit pas ou reste bloquée chez un spectateur, la chaîne passe toute seule à la suite (pub ou programme suivant) au bout de quelques secondes : l'antenne ne reste jamais figée.",
      "Contenus interdits : piratage (films, matchs, émissions d'autres chaînes sans droits), violence, contenu sexuel, appels à la haine. Une chaîne qui ne respecte pas cela est mise en pause sans remboursement.",
      "Pour diffuser des matchs ou des films, le responsable doit posséder les droits. Au moindre doute, demander l'avis du PDG avant d'ouvrir la chaîne.",
      "Une église ou une association qui veut seulement annoncer un événement n'a pas besoin d'une chaîne : orientez-la vers la publicité ou un communiqué (voir ces fiches).",
      "Numéro de canal : chaque chaîne a un numéro (canal 1, 2, 3…). Pour aider quelqu'un à trouver une chaîne, donnez-lui simplement ce numéro : dans l'onglet TV, il touche « 🔢 Aller au canal », tape le numéro, puis OK. Une nouvelle chaîne reçoit le numéro suivant ; le PDG peut le changer dans le site (Epsilon TV → « 🔢 Numéro de canal »).",
      "Genres et diffusion : en publiant (ou avec « Ranger »), le responsable choisit le GENRE (🎬 Cinéma, 📺 Séries, 😂 Comédie, 📰 Journal, 🎵 Musique, 🌍 Documentaires, 🎙️ Émissions) et la DIFFUSION : 🔁 en boucle (24 h/24, les uns après les autres), ⏰ à heure fixe (jour et heure à la seconde, heure de Brazzaville), 📢 publicité ou 🎛️ Régie (reportages, photos et documents gardés pour le direct, jamais diffusés seuls). Toutes les pubs ensemble forment la PAGE DE PUB (avec l'animation « Publicité » / « Fin de la publicité ») qui sépare les programmes. Films, épisodes de séries et documentaires de plus de 30 minutes ont une page de pub avant, une au MILIEU exact et une à la fin, puis reprennent à la seconde près. Les comédies, journaux et émissions passent en entier (une page de pub avant et après). La musique n'est jamais coupée, et il n'y a pas de pub entre deux chansons qui se suivent. Avant un rendez-vous à heure fixe, la page de pub est placée pour se terminer PILE à l'heure (ex. 3 min 09 s de pub avant 20:00:00 → elle commence à 19:56:51) ; ensuite le programme interrompu reprend là où il s'était arrêté. L'onglet « 📅 Grille » montre les 48 prochaines heures, seconde par seconde.",
      "Grille type de la journée : dans 📅 Grille → « Grille type », la chaîne décrit sa journée UNE fois, sans nommer les fichiers (ex. 19:00:00 → 3 épisodes de la série ; 09:00:00 → rediffusion des épisodes 1 et 2 de la veille ; 12:00:00 → épisode 3 ; 14:00:00 → documentaire ; 16:30:00 → film ; un créneau 😂 Comédie possible ; 00:00:00 → musique avec photo ; 05:00:00 → musique avec pub). L'application choisit les vidéos du bon genre (épisodes dans l'ordre, une série après l'autre) et calcule les durées toute seule, chaque jour. La musique remplit les trous sans jamais être coupée ; les espaces encore « libres » sont affichés en jaune, avec leurs heures, pour les compléter.",
      "Floutage : sous chaque vidéo de sa chaîne, le responsable touche « 🔲 Flouter », ajoute une zone et la fait glisser sur ce qu'il faut cacher (logo d'un partenaire, filigrane, plaque, nom). Le coin rose change la taille ; « Début ici » / « Fin ici » limitent le flou à un passage. Les spectateurs voient la zone floutée, à l'antenne et en replay. Pour des VISAGES qui bougent (reportage), conseiller CapCut (outil flou / mosaïque qui suit le visage), puis publier la vidéo exportée en MP4.",
      "Chaîne privée : sur demande du responsable, SEUL le PDG peut rendre une chaîne privée (site → Epsilon TV → « 🔒 Rendre privée »). Un code est créé (ex. EPS-7KQ4-M9XA) ; le responsable le voit dans « Gérer ma chaîne » et le donne à son public, qui touche « 🔐 Code privé » dans l'onglet TV et le tape. L'équipe Epsilon voit toujours les chaînes privées pour contrôler leur contenu. Le PDG peut changer le code (« 🔄 Nouveau code ») ou retirer tous les accès d'un coup.",
      "L'heure de Brazzaville s'affiche en direct sur l'écran de chaque chaîne (au début du bandeau INFO, ou en haut à gauche s'il n'y a pas de bandeau). Les pubs sont signalées par la mention PUBLICITÉ et ne peuvent pas être sautées. Toutes les vidéos (pubs comprises) comptent dans l'espace de stockage de la chaîne.",
      "Bandeaux défilants : chaque chaîne écrit elle-même les messages qui défilent en bas de ses vidéos (onglet TV → Ma chaîne → « Bandeaux défilants » : un carreau par message, 5 au maximum, chacun avec son bouton Supprimer). Elle peut y mettre ses annonces, ses flash infos, ou des publicités qu'elle vend elle-même à ses annonceurs, au prix qu'elle veut : Epsilon ne prend rien sur ces ventes. C'est un bon argument pour convaincre une chaîne de venir sur Epsilon.",
      "Les bandeaux respectent les mêmes règles que le reste (pas d'arnaque, de haine ni de contenu choquant). En cas d'abus, le PDG peut les retirer dans le site : Epsilon TV → la chaîne → « Retirer les bandeaux ».",
    ],
    problems: [
      { q: "« Ma chaîne n'apparaît plus. »", a: "La formule est sans doute terminée, ou la chaîne a été mise en pause. Vérifier dans le site (Epsilon TV) la date de fin et l'historique des paiements." },
      { q: "« Ma vidéo ne se publie pas. »", a: "Elle dépasse 1 Go, ou le réseau a coupé pendant l'envoi. Réessayer avec une meilleure connexion (Wi-Fi si possible) ; pour une vidéo de plus de 1 Go, la couper en plusieurs parties ou la réenregistrer en qualité plus basse." },
    ],
  },

  // ───────────────────────────── EPSILON TV : STOCKAGE ─────────────────────────────
  {
    id: "tv-stockage",
    icon: "💾",
    title: "Epsilon TV : stockage des vidéos (différé) et total du contrat",
    who: "Chaînes Epsilon TV · à joindre au contrat avec la fiche du direct",
    intro:
      "Les vidéos qu'une chaîne publie pour être regardées à tout moment (émissions passées, rediffusions, reportages) sont gardées sur les serveurs d'Epsilon. Cet espace se paie au mois, en plus des minutes de direct. Le contrat d'une chaîne comprend donc deux parties : le direct (sa formule) et le stockage du différé.",
    prices: [
      ["Prix de l'espace", "90 FCFA le Go par mois"],
      ["Bronze : 10 Go compris", "900 FCFA par mois"],
      ["Argent : 30 Go compris", "2 700 FCFA par mois"],
      ["Platine : 60 Go compris", "5 400 FCFA par mois"],
      ["Or : 100 Go compris", "9 000 FCFA par mois"],
      ["Sur mesure : 10 Go compris", "900 FCFA par mois"],
      ["Espace en plus (n'importe quelle formule)", "90 FCFA le Go par mois"],
    ],
    pricing: {
      base: "Total du contrat = prix de la formule de direct + prix du stockage. Les deux se paient ensemble, au même moment, pour la même durée.",
      head: ["Formule", "Direct (minutes regardées)", "Stockage du différé", "Total par mois", "Total 3 mois", "Total 12 mois"],
      priceCol: 3,
      rows: [
        ["Bronze", "24 000 FCFA (21 000 min)", "900 FCFA (10 Go)", "24 900 FCFA", "74 700 FCFA", "298 800 FCFA"],
        ["Argent", "120 000 FCFA (110 000 min)", "2 700 FCFA (30 Go)", "122 700 FCFA", "368 100 FCFA", "1 472 400 FCFA"],
        ["Platine", "300 000 FCFA (287 500 min)", "5 400 FCFA (60 Go)", "305 400 FCFA", "916 200 FCFA", "3 664 800 FCFA"],
        ["Or", "600 000 FCFA (600 000 min)", "9 000 FCFA (100 Go)", "609 000 FCFA", "1 827 000 FCFA", "7 308 000 FCFA"],
        ["Sur mesure", "1,20 FCFA × minutes", "900 FCFA (10 Go)", "minutes × 1,20 + 900", "", ""],
      ],
      extra: [
        "Exemple Sur mesure : 36 000 minutes pour une église → 43 200 + 900 = 44 100 FCFA pour le mois.",
        "Exemple avec espace en plus : Bronze + 20 Go en plus → 24 900 + 1 800 = 26 700 FCFA pour le mois.",
        "Option Epsilon TV Studio (gestion de la chaîne sur le site, en grand) : 10 000 FCFA par mois en plus. Exemple : Bronze + Studio → 24 900 + 10 000 = 34 900 FCFA pour le mois. Sans le Studio, la chaîne se gère gratuitement depuis le téléphone.",
      ],
    },
    steps: [
      { t: "Estimer l'espace nécessaire", d: "Repère simple : 1 Go contient environ 1 à 2 heures de vidéo en qualité normale (720p). Une chaîne qui garde 4 émissions d'1 heure par mois utilise environ 2 à 4 Go par mois. Les vidéos restent tant que la chaîne ne les supprime pas : l'espace se remplit donc de mois en mois." },
      { t: "Choisir la formule", d: "L'espace compris dans la formule suffit dans la plupart des cas. Si la chaîne garde beaucoup de vidéos (archives, séries, cultes de toute l'année), ajouter de l'espace en plus." },
      { t: "Calculer le total du contrat", d: "Prendre le prix de la formule de direct, ajouter le stockage (tableau ci-dessus), puis multiplier par le nombre de mois payés d'avance. Le total s'affiche aussi tout seul dans le site, au moment d'activer la formule." },
      { t: "Encaisser et activer", d: "Le responsable paie le total par MTN Mobile Money ou Airtel Money (ou en espèces avec reçu). Dans le site : Epsilon TV → « Activer » ou « Renouveler » : le montant proposé comprend déjà le stockage." },
      { t: "Vendre de l'espace en plus", d: "Dans le site : Epsilon TV → la chaîne → « 💾 Espace en plus ». Indiquer le nombre de Go : le prix se calcule tout seul (90 FCFA le Go). L'espace en plus reste valable jusqu'à la fin de la formule en cours ; il faut le reprendre au renouvellement." },
      { t: "Quand l'espace est plein", d: "Le responsable voit sur sa chaîne « Espace pour les vidéos : … Go utilisés sur … Go ». Quand c'est plein, l'application refuse les nouvelles vidéos et lui dit de supprimer d'anciennes vidéos ou de demander plus d'espace au Service client." },
    ],
    tips: [
      "Chaque vidéo publiée peut aller jusqu'à 1 Go (environ 1 h à 1 h 30 en bonne qualité pour téléphone). Pour une émission plus lourde, la couper en plusieurs parties.",
      "Supprimer une vidéo libère son espace tout de suite.",
      "Si la formule n'est pas renouvelée, la chaîne n'est plus visible, mais ses vidéos ne sont pas effacées : elles réapparaissent au renouvellement.",
    ],
    problems: [
      { q: "« L'application refuse ma vidéo. »", a: "Soit la vidéo dépasse 1 Go, soit l'espace de la chaîne est plein. Regarder la ligne « Espace pour les vidéos » sur la chaîne, puis proposer de supprimer d'anciennes vidéos ou de vendre de l'espace en plus." },
      { q: "« Pourquoi je paie le stockage en plus du direct ? »", a: "Le direct, c'est la diffusion en temps réel. Le stockage, c'est la garde de vos vidéos jour et nuit pour que votre public les revoie quand il veut : ce sont deux services différents." },
    ],
  },

  // ───────────────────────────── EPSILON TV STUDIO (site) ─────────────────────────────
  {
    id: "tv-studio",
    icon: "🖥️",
    title: "Epsilon TV Studio : gérer sa chaîne sur le site (ordinateur, tablette)",
    who: "Chaînes Epsilon TV qui veulent une régie en grand",
    intro:
      "Epsilon TV Studio est le logiciel de gestion des chaînes, sur un site : epsilon-messenger-app.pages.dev/studio (lien direct dans l'application : Paramètres → « Epsilon TV Studio », ou Ma chaîne → « 🖥️ Epsilon TV Studio »). La chaîne s'y gère en grand : programmes par genre, grille à la seconde, pages de pub, directs programmés, bandeaux, floutage, statistiques et régie du direct. Gérer sa chaîne depuis le téléphone reste GRATUIT : le Studio est une option pour ceux qui veulent une meilleure vue et une meilleure gestion.",
    prices: [
      ["Epsilon TV Studio (accès au site)", "10 000 FCFA par mois"],
      ["3 mois", "30 000 FCFA"],
      ["6 mois", "60 000 FCFA"],
      ["12 mois", "120 000 FCFA"],
      ["Gestion depuis le téléphone (application)", "gratuite, comprise dans la formule"],
    ],
    steps: [
      { t: "Ouvrir le site", d: "Dans l'application : Paramètres → « 📺 Epsilon TV Studio ↗ » (ou Ma chaîne → « 🖥️ Epsilon TV Studio »). Sur un ordinateur, taper l'adresse epsilon-messenger-app.pages.dev/studio." },
      { t: "Se connecter", d: "Avec son PROPRE compte Epsilon (même numéro, même code que dans l'application) : le responsable de la chaîne, ou un membre de son équipe (régie, journaliste, statistiques — voir la fiche « Équipe d'une chaîne »). Un compte sans chaîne et hors équipe voit « Accès refusé »." },
      { t: "Payer l'abonnement", d: "Sans abonnement, le site affiche le prix (10 000 FCFA par mois, converti dans la monnaie du client) et les numéros Mobile Money d'Epsilon. Le responsable paie, puis écrit au Service client « Abonnement Studio — nom de la chaîne » avec le code du SMS." },
      { t: "Activer (PDG)", d: "Site administrateur → Epsilon TV → la chaîne → « 🖥️ Studio (site) » : choisir 1, 3, 6 ou 12 mois, recopier le code du paiement (ou « Payé en espèces »), confirmer avec le code PDG. Le responsable recharge la page du Studio : sa régie s'ouvre." },
      { t: "Régie du direct à deux", d: "Le journaliste lance le direct avec le TÉLÉPHONE (onglet TV → la chaîne → Passer en direct) et reste sur l'écran de la caméra. Sur le site apparaît le pupitre de régie : à gauche l'aperçu de l'antenne, à droite les reportages, documents et photos de l'onglet 🎛️ Régie. Voir la fiche « Régie du direct » (curseur, vitesse, photo épinglée, documents, Retour antenne)." },
      { t: "Logiciel de montage", d: "En haut du Studio : « ✂️ Montage ». Voir la fiche « Montage vidéo (Studio) »." },
    ],
    tips: [
      "Le Studio et l'application montrent la même chaîne : ce qui est fait sur l'un apparaît aussitôt sur l'autre.",
      "Sur un ordinateur avec webcam, le direct peut aussi être lancé depuis le site (même bouton « Passer en direct »).",
      "À la fin de l'abonnement, le site redemande le paiement ; la chaîne, elle, continue de passer normalement, et le responsable la gère depuis son téléphone.",
    ],
    problems: [
      { q: "« Le site me dit Accès refusé. »", a: "Le compte connecté n'est ni le responsable de la chaîne, ni dans son équipe. Soit se connecter avec le numéro qui gère la chaîne, soit demander au responsable d'ajouter ce numéro dans « 👥 Équipe de la chaîne » (fiche « Équipe d'une chaîne »). L'abonnement Studio de la chaîne vaut pour toute l'équipe." },
      { q: "« J'ai payé mais le site demande toujours l'abonnement. »", a: "Vérifier dans le site administrateur (Epsilon TV → la chaîne) la ligne « Epsilon TV Studio ». Si le paiement est reçu, l'activer avec « 🖥️ Studio (site) », puis demander au client de recharger la page." },
    ],
  },

  // ───────────────────────────── IMPRIMER UN DOCUMENT ─────────────────────────────
  {
    id: "imprimer-documents",
    icon: "🖨️",
    title: "Imprimer les documents officiels (conditions, confidentialité, règles…)",
    who: "Utilisateurs de l'application et équipe du site administrateur",
    intro:
      "Les documents officiels d'Epsilon s'impriment maintenant directement. Le bouton « 🖨️ Imprimer » ouvre la fenêtre d'impression du téléphone ou de l'ordinateur : on y choisit l'imprimante (Wi-Fi, USB ou Bluetooth) ou « Enregistrer en PDF ». La page imprimée est propre : logo Epsilon, titre, version, texte, date d'impression — sans menus ni boutons.",
    steps: [
      { t: "Dans l'application", d: "Paramètres → « 📜 Aide et documents » → ouvrir le document → « 🖨️ Imprimer » (à côté de la version). Sur Android, il faut la dernière version de l'application (bouton « Mettre à jour »)." },
      { t: "Sur le site administrateur", d: "Documents publics → ouvrir le document → « 🖨️ Imprimer » (imprime le texte affiché ; s'il n'est pas publié, la page indique « Brouillon — non publié »). Dans l'historique, le petit 🖨️ imprime une ancienne version." },
      { t: "Tout le reste du site administrateur", d: "Chaque page a maintenant son bouton 🖨️ : « 🖨️ Imprimer » en haut à droite (la page affichée, sans boutons) ; Epsilon TV — Chaînes : « 🖨️ Liste des chaînes », « 🖨️ Registre des codes », « 📄 Contrat d'abonnement » (à signer en deux exemplaires), et dans « 🧾 Paiements » l'historique et un « 🧾 Reçu » avec sa souche ; Utilisateurs, Paiements des boutiques, Paiements sécurisés, Publicités : la liste en tableau ; Statistiques : « 👥 abonnés » (avec le 📅 rapport mensuel) et « 🛍️ produits vendus » ; Service client : chaque fiche pratique et tout le classeur." },
      { t: "Choisir l'imprimante", d: "En haut de la fenêtre d'impression : « Sélectionner une imprimante » (Android) ou « Destination » (ordinateur). Choisir l'imprimante, le nombre de copies, puis Imprimer." },
    ],
    tips: [
      "« Enregistrer en PDF » permet d'envoyer le document par WhatsApp ou par e-mail.",
      "Le format est A4.",
    ],
    problems: [
      { q: "« Mon imprimante n'apparaît pas sur le téléphone. »", a: "Brancher le téléphone sur le même Wi-Fi que l'imprimante, puis installer le service d'impression de la marque depuis le Play Store (HP Print Service Plugin, Canon Print Service, Epson Print Enabler… ou « Mopria Print Service » pour la plupart des marques). Ensuite : Paramètres du téléphone → Impression → activer ce service." },
      { q: "« Mon imprimante n'apparaît pas sur l'ordinateur. »", a: "Vérifier qu'elle est allumée, branchée (USB) ou sur le même réseau, et installée dans l'ordinateur (Windows : Paramètres → Imprimantes et scanners → Ajouter)." },
      { q: "« Le bouton ne fait rien dans l'application. »", a: "Mettre à jour l'application (bouton « Mettre à jour » ou epsilon-messenger-app.pages.dev/epsilon.apk)." },
    ],
  },

  // ───────────────────────────── TV EN ARRIÈRE-PLAN / PETITE FENÊTRE ─────────────────────────────
  {
    id: "tv-arriere-plan",
    icon: "⧉",
    title: "Regarder Epsilon TV en arrière-plan et en petite fenêtre",
    who: "Tous les spectateurs d'Epsilon TV (application Android)",
    intro:
      "Comme sur YouTube : une chaîne continue de jouer quand on quitte l'application, dans une petite fenêtre flottante par-dessus les autres applications (Facebook, WhatsApp…), et le son continue même téléphone en veille. Un lecteur apparaît dans les notifications et sur l'écran verrouillé. Il faut la dernière version de l'application (bouton « Mettre à jour »).",
    steps: [
      { t: "Petite fenêtre", d: "Pendant qu'une chaîne joue, appuyer sur le bouton ⧉ (à droite de ⛶, en haut à gauche de l'image), ou simplement quitter l'application avec le bouton/geste Accueil : l'image passe dans une petite fenêtre. On peut la déplacer avec le doigt et aller dans d'autres applications." },
      { t: "Revenir dans Epsilon TV", d: "Toucher la petite fenêtre puis l'icône d'agrandissement (↗ / carré), ou toucher la notification « Epsilon TV » : on revient en grand dans l'onglet TV, sur la même chaîne." },
      { t: "Écouter téléphone en veille", d: "Éteindre l'écran pendant qu'une chaîne joue : le son continue (journal, émission, musique). Pour économiser la batterie, c'est l'idéal." },
      { t: "La télécommande (sous l'écran)", d: "Sous la chaîne, après « Gérer ma chaîne » / « Toutes les vidéos » : un rond transparent. ▲ CH+ et ▼ CH− changent de chaîne (le nom de la chaîne suivante est écrit au-dessus) ; ◀ VOL− et ▶ VOL+ baissent ou montent le son par paliers de 10 % ; le bouton du milieu coupe ou remet le son. 100 % = le volume du téléphone : pour aller plus fort, utiliser aussi les boutons du téléphone. Avec une seule chaîne, ▲▼ sont grisés." },
      { t: "La liste des chaînes (☰ Chaînes)", d: "Bouton « ☰ Chaînes » en haut à droite de l'image, aussi en plein écran (à l'horizontale ou en portrait) : les chaînes s'affichent en fenêtres en bas de l'écran, avec le programme qui passe maintenant (▶) et le suivant avec son heure (⏭). Faire défiler de droite à gauche, toucher une chaîne : on y va tout de suite, en restant en plein écran. ✕ pour fermer la liste." },
      { t: "Plein écran", d: "Bouton ⛶ en haut à gauche de l'image : le téléphone passe à l'horizontale, les barres d'Android se cachent et toute l'image tient dans l'écran, avec le bandeau INFO en bas. ⛶ ou la touche « retour » pour sortir (application à jour nécessaire)." },
      { t: "Le lecteur dans les notifications", d: "Tirer la barre de notifications (ou regarder l'écran verrouillé) : ⏸ Pause / ▶ Lecture, et « Arrêter ». « Arrêter » coupe tout ; dans l'onglet TV, « ▶ Reprendre la chaîne » relance l'antenne." },
    ],
    tips: [
      "Fermer la petite fenêtre (✕) n'arrête pas forcément le son : utiliser « Arrêter » dans la notification.",
      "Les directs se regardent aussi en petite fenêtre et en arrière-plan.",
      "Sur ordinateur (navigateur), le bouton ⧉ ouvre la vidéo dans une petite fenêtre du navigateur, si celui-ci le permet.",
    ],
    problems: [
      { q: "« Je ne vois pas le bouton ⧉ / ça ne passe pas en petite fenêtre. »", a: "Mettre à jour l'application (bouton « Mettre à jour » ou epsilon-messenger-app.pages.dev/epsilon.apk). Sur certains téléphones : Paramètres → Applications → Epsilon → « Image dans l'image » (ou « Picture-in-picture ») → Autoriser. Il faut Android 8 ou plus récent." },
      { q: "« Le son s'arrête quand j'éteins l'écran. »", a: "Vérifier la dernière version, puis Paramètres → Applications → Epsilon → Batterie → « Sans restriction » (certaines marques comme Tecno, Itel, Infinix, Xiaomi coupent les applications pour économiser la batterie)." },
      { q: "« Je ne vois pas le lecteur dans les notifications. »", a: "Autoriser les notifications d'Epsilon (Paramètres → Applications → Epsilon → Notifications) et vérifier que le canal « Epsilon TV en arrière-plan » est activé." },
    ],
  },

  // ───────────────────────────── ÉQUIPE D'UNE CHAÎNE ─────────────────────────────
  {
    id: "tv-equipe",
    icon: "👥",
    title: "Équipe d'une chaîne : régie, journaliste, caméraman, statistiques",
    who: "Responsables de chaînes Epsilon TV et leurs collaborateurs",
    intro:
      "Le responsable d'une chaîne peut ajouter jusqu'à 10 personnes à son équipe. Chacune se connecte avec SON propre compte Epsilon (dans l'application ou sur Epsilon TV Studio) et retrouve la chaîne selon son rôle. Jamais de partage de code ou de compte.",
    steps: [
      { t: "Les quatre rôles", d: "🎛️ RÉGIE : gère tout (programmes, grille, pubs, directs programmés, bandeaux, onglet Régie, pupitre du direct, choix des caméras) et voit les statistiques. S'il n'y a personne aux statistiques, la régie fait tout le travail. 🎥 JOURNALISTE : lance le direct avec la caméra de son téléphone et peut se servir du pupitre de régie et choisir les caméras. 📷 CAMÉRAMAN : son téléphone sert seulement de caméra pendant le direct (bouton « 📷 Servir de caméra »), rien d'autre. 📊 STATISTIQUES : voit l'onglet 📊 Statistiques sans rien pouvoir modifier." },
      { t: "Ajouter un membre (responsable)", d: "Application → TV → la chaîne → « 👥 Équipe de la chaîne » → taper le numéro Epsilon de la personne → choisir le rôle → « Ajouter ». Le message « ✅ … ajouté(e) » confirme." },
      { t: "Le membre retrouve la chaîne", d: "Dans l'application (onglet TV → la chaîne, avec « Votre rôle dans l'équipe ») ou sur Epsilon TV Studio, connecté avec son propre compte." },
      { t: "Changer de rôle ou retirer", d: "Même fenêtre : ajouter à nouveau le même numéro avec un autre rôle, ou « Retirer » à côté de son nom." },
    ],
    tips: [
      "L'abonnement Studio (10 000 FCFA/mois) est un par chaîne : il vaut pour toute l'équipe.",
      "Le PDG peut aussi ajouter un membre à n'importe quelle chaîne (même fenêtre, depuis son compte).",
    ],
    problems: [
      { q: "« Aucun compte Epsilon avec ce numéro. »", a: "La personne doit d'abord s'inscrire dans l'application avec ce numéro, puis le responsable l'ajoute." },
      { q: "« Mon collègue a Accès refusé sur le Studio. »", a: "Il n'est pas encore dans l'équipe, ou il s'est connecté avec un autre numéro. Vérifier la liste dans « 👥 Équipe de la chaîne »." },
      { q: "« Le journaliste ne voit pas le bouton Passer en direct. »", a: "Vérifier son rôle (🎥 Journaliste ou 🎛️ Régie), qu'il est bien connecté avec le bon compte, et que la formule de la chaîne n'est pas expirée." },
    ],
  },

  // ───────────────────────────── DIRECT À PLUSIEURS TÉLÉPHONES ─────────────────────────────
  {
    id: "tv-multicam",
    icon: "🎥",
    title: "Direct à plusieurs téléphones (multi-caméras)",
    who: "Chaînes Epsilon TV sans matériel de tournage (responsable, régie, journaliste, caméramans)",
    intro:
      "Une chaîne peut faire son direct avec jusqu'à 6 téléphones comme caméras, sans acheter de kit. Chaque téléphone envoie son image ; la régie (sur ordinateur avec Epsilon TV Studio, ou sur le téléphone du journaliste) voit toutes les caméras en petits écrans et choisit celle qui passe à l'antenne, et de quel téléphone vient le son. Les spectateurs ne reçoivent toujours qu'une seule image : leur consommation ne change pas.",
    steps: [
      { t: "Préparer l'équipe", d: "Application → TV → la chaîne → « 👥 Équipe de la chaîne » : ajouter chaque personne qui tiendra un téléphone, avec le rôle 📷 Caméraman (ou Journaliste / Régie). Chacun se connecte avec SON compte Epsilon." },
      { t: "Brancher les téléphones-caméras", d: "Sur chaque téléphone : Epsilon → TV → la chaîne → « 📷 Servir de caméra » → donner un nom à la caméra (Plan large, Public, Tribune…) → « 📷 Rejoindre le direct comme caméra ». Le téléphone affiche CAMÉRA 1, 2, 3 ou 4. Le poser sur un support ou un trépied, chargeur branché si possible." },
      { t: "Régie sur ordinateur (conseillé)", d: "Epsilon TV Studio → « 🎥 Régie multi-caméras » → « Ouvrir ». Toutes les caméras connectées apparaissent. Avant le direct : toucher la caméra de départ, écrire le titre, puis « 🔴 Démarrer le direct avec la caméra … ». Pendant le direct : cliquer une caméra (ou touches 1 à 6 du clavier) pour la mettre à l'antenne ; « 🎤 Prendre le son » pour choisir de quel téléphone vient le son. « 🔇 Couper son micro » / « 🎤 Rétablir son micro » coupe ou rétablit à distance le micro de n'importe quelle caméra. Le pupitre (reportages, photo épinglée, documents) reste en dessous." },
      { t: "Écran partagé (duplex)", d: "Pour montrer plusieurs caméras EN MÊME TEMPS (ex. le journaliste au studio + des correspondants dans d'autres villes) : dans la régie, « 🔲 Écran partagé » → toucher les caméras dans l'ordre des cases (2 à 6) → « Mettre l'écran partagé à l'antenne ». Les spectateurs voient chaque image dans sa case, séparées par un trait, avec le nom de la caméra (mettre le nom de la ville comme nom de caméra), et entendent toutes ces caméras. Les caméras de l'écran s'entendent aussi entre elles pour se parler : mettre des écouteurs pour éviter l'écho. Pour revenir à une seule image : « 📺 Une caméra » puis toucher la caméra voulue." },
      { t: "Image plein écran, format télé 16:9", d: "Chaque téléphone envoie TOUJOURS une image au format télévision 16:9, plein cadre (comme une caméra de journal ou de cinéma) : plus de bandes noires chez les spectateurs. Le cadre affiché sur le téléphone est exactement ce que voient les spectateurs. Pour une image large, tenir le téléphone à l'horizontale ; s'il est tenu à la verticale, l'image est recadrée au centre et un conseil s'affiche. Si l'image apparaît de travers (rotation automatique de l'écran coupée), toucher « ↻ Pivoter »." },
      { t: "Enregistrer le direct", d: "Sur Epsilon TV Studio (ordinateur), pendant le direct : « ⏺ Enregistrer le direct » en haut de la régie. On enregistre ce que voient les spectateurs (caméra à l'antenne ou écran partagé avec les noms des villes, reportages, photo, documents), sans les commentaires. « ⏹ Arrêter l'enregistrement » (ou fin du direct) : le panneau « 🎬 Enregistrements du direct » propose ⬇ Télécharger, 📤 Rediffuser sur la chaîne (programme avec son genre, ou régie), ✂️ Ouvrir dans le Montage, ✂️ Découper en parties de 10 min (un projet de montage par partie, à exporter). Un direct de plus d'une heure est rangé en parties d'une heure. Garder la page ouverte et affichée pendant l'enregistrement, et publier ou télécharger avant de fermer la page." },
      { t: "Zoom et caméra avant / arrière", d: "Sur chaque téléphone qui filme : pincer l'écran avec deux doigts pour zoomer ou dézoomer (ou les boutons « − 1,0× + » ; toucher le chiffre pour revenir à 1×). Les spectateurs voient le même zoom. « 🔄 Caméra » passe de la caméra arrière à la caméra selfie et inversement." },
      { t: "L'ordinateur de la régie comme caméra, et « Parler aux caméras »", d: "Epsilon TV Studio → « 💻 Webcam et micro de cet ordinateur » → donner un nom (ex. Studio Brazzaville) → « 📷 Utiliser la webcam et le micro ». L'ordinateur devient une caméra comme les téléphones : on peut le mettre à l'antenne, en écran partagé, prendre son micro comme son du direct. « 🎙️ Parler aux caméras » : tous les téléphones-caméras entendent l'ordinateur (consignes, duplex) ; mettre un casque pour éviter l'écho. Les téléphones ont le même bouton : la régie les entend aussi." },
      { t: "Régie sur téléphone", d: "Le journaliste lance le direct comme d'habitude (« 🔴 Passer en direct ») : son téléphone devient lui aussi une caméra. Pendant le direct, tout est dans la bande de boutons en bas : « 🎥 Caméras » (toucher une caméra pour la mettre à l'antenne, « 🎤 Prendre le son », couper un micro), « 🔲 Écran partagé » (choisir les caméras et les mettre à l'antenne, sans arrêter le direct), « 🎙️ Parler aux caméras »." },
      { t: "Ce que voient les caméramans", d: "Un cadre rouge et « ● À L'ANTENNE » quand leur image est diffusée ; « Prête » sinon ; « 🎤 Votre micro est le son du direct » quand leur micro est utilisé ; « 🔇 La régie a coupé votre micro » quand la régie l'a coupé. En bas de l'écran, les images de toutes les autres caméras (point rouge = à l'antenne) : toucher une caméra pour l'afficher en grand et se faire des signes, toucher encore pour revenir. « Quitter » pour arrêter." },
    ],
    tips: [
      "6 caméras au plus par direct. Le passage d'une caméra à l'autre prend environ une demi-seconde chez les spectateurs.",
      "Chaque caméra envoie deux qualités d'image en même temps : chaque spectateur reçoit automatiquement celle que sa connexion supporte. Dans une ville au réseau faible, l'image est un peu moins détaillée mais reste fluide et en direct, sans retard qui s'accumule.",
      "Chaque téléphone-caméra envoie environ 300 Mo par heure : Wi-Fi ou bonne 4G conseillés.",
      "Le son reste sur un seul micro (choisi par la régie), pour éviter l'écho et les sauts de son à chaque changement d'image.",
      "Si l'ordinateur de la régie se ferme, le direct continue tant qu'une caméra est branchée : rouvrir le Studio pour reprendre la régie. Si la caméra à l'antenne se déconnecte, une autre caméra prend le relais toute seule.",
      "Les minutes de direct sont décomptées comme d'habitude (par spectateur), quel que soit le nombre de caméras.",
    ],
    problems: [
      { q: "« Direct à plusieurs caméras pas encore activé (fichiers SQL 79). »", a: "Le PDG doit exécuter les fichiers SQL 79 (parties 1 à 3) dans Supabase." },
      { q: "« Il y a déjà 6 caméras connectées. »", a: "Faire quitter une caméra (bouton « Quitter » sur son téléphone), ou attendre 40 secondes qu'une caméra éteinte libère sa place." },
      { q: "« Le bouton Servir de caméra n'apparaît pas. »", a: "Vérifier que la personne est dans l'équipe de la chaîne (rôle 📷 Caméraman, Journaliste ou Régie), connectée avec le bon compte, et que la formule de la chaîne n'est pas expirée." },
      { q: "« L'image du téléphone ne prend pas tout l'écran. »", a: "Mettre l'application à jour (fermer et rouvrir Epsilon) : l'image est maintenant toujours en 16:9 plein cadre. Tenir le téléphone à l'horizontale pour une image plus large." },
      { q: "« Le bouton Enregistrer n'apparaît pas. »", a: "L'enregistrement se fait sur Epsilon TV Studio (ordinateur, Google Chrome à jour), pendant le direct, en haut de la régie, pour le responsable, la régie ou le journaliste." },
      { q: "« Le téléphone n'entend pas l'ordinateur pendant le direct. »", a: "L'ordinateur doit être branché comme caméra (« 💻 Webcam et micro de cet ordinateur ») et appuyer sur « 🎙️ Parler aux caméras » (fichier SQL 82 exécuté). Autoriser la webcam et le micro pour le site (icône 🔒 à gauche de l'adresse)." },
      { q: "« Le bouton Écran partagé ne fait rien. »", a: "Il faut au moins 2 caméras connectées (un deuxième téléphone, ou la webcam de l'ordinateur). Toucher les caméras dans l'ordre des cases, puis « Mettre l'écran partagé à l'antenne »." },
      { q: "« La régie a coupé le micro mais on entend toujours la caméra. »", a: "Vérifier que le fichier SQL 80 a bien été exécuté dans Supabase, et que le caméraman a rechargé l'application (Epsilon à jour). Le micro se coupe en quelques secondes au plus." },
      { q: "« L'image arrive en retard ou saccadée dans une autre ville. »", a: "Le spectateur a un réseau faible : il reçoit l'image légère, qui reste en direct. Si c'est TOUT le monde, c'est le téléphone qui filme qui a un mauvais réseau : le rapprocher du Wi-Fi ou d'une meilleure zone 4G, ou passer sur une autre caméra." },
      { q: "« La caméra à l'antenne ne répond plus. »", a: "Le téléphone a perdu le réseau ou a quitté Epsilon : la régie passe sur une autre caméra, puis le caméraman relance « Servir de caméra »." },
    ],
  },

  // ───────────────────────────── RÉGIE DU DIRECT ─────────────────────────────
  {
    id: "tv-regie",
    icon: "🎛️",
    title: "Régie du direct : reportages, photo épinglée, documents",
    who: "Chaînes Epsilon TV (régie et journalistes)",
    intro:
      "Pendant un direct, la régie (sur le Studio ou sur le téléphone) peut balancer un reportage par-dessus la caméra, le piloter (curseur, pause, vitesse), épingler une photo, afficher un document, puis revenir à l'antenne. Seuls les fichiers rangés dans l'onglet 🎛️ Régie de la chaîne apparaissent, pour ne pas confondre avec les films ou la musique.",
    steps: [
      { t: "Préparer les fichiers (avant le direct)", d: "Application ou Studio → la chaîne → onglet « 🎛️ Régie » → « ＋ Ajouter à la régie ». On peut ajouter des vidéos (reportages), des PDF (chaque page devient une image, 40 pages au plus) et des photos (JPG, PNG). Ces fichiers ne passent JAMAIS seuls à l'antenne." },
      { t: "Ouvrir le pupitre", d: "Sur le Studio : il s'affiche tout seul en haut quand la chaîne est en direct. Sur le téléphone du journaliste : bouton « 🎛️ Régie » en bas de l'écran du direct. Trois rubriques : 🎞️ Reportages, 📄 Documents, 🖼️ Photos (+ ajout rapide pendant le direct)." },
      { t: "Balancer un reportage", d: "Toucher un reportage : tous les spectateurs le voient en même temps. Le curseur permet de revenir en arrière ou d'avancer jusqu'au passage important ; boutons ⏮ début, ↺ 10 s, ❚❚ arrêt sur image, 10 s ↻ ; vitesse de 0,5× à 3× (les spectateurs voient « Ralenti », « Accéléré » ou « Arrêt sur image »). À la fin, l'image revient toute seule sur la caméra ; « ⏹ Arrêter le reportage » le coupe avant." },
      { t: "Épingler une photo (sans couper la caméra)", d: "Rubrique 🖼️ Photos → toucher une photo (ex. la personne dont on parle). Régler l'emplacement (9 positions, ou glisser la photo du doigt sur l'image), la taille, la forme ronde ou carrée, et le nom affiché dessous. Toucher une autre photo la remplace." },
      { t: "Afficher un document (sans couper la caméra)", d: "Rubrique 📄 Documents → toucher un PDF ou une image. « 📌 Épinglé » : dans un coin (emplacement et taille réglables). « ⛶ Plein écran » : tout le monde lit, la caméra continue en petite fenêtre dans le coin. « Précédente / Suivante » pour tourner les pages." },
      { t: "Enlever et revenir à l'antenne", d: "Toucher à nouveau l'élément affiché, ou « ✕ Enlever de l'écran » sur sa carte. Le grand bouton vert « 📷 Retour antenne » enlève TOUT d'un coup (reportage, photo, document) : il ne reste que la caméra." },
    ],
    tips: [
      "Prérequis : fichiers SQL 73 et 74 exécutés (déjà fait le 18/10/2026).",
      "Le journaliste peut piloter le pupitre depuis son téléphone, mais seuls le responsable et la régie peuvent ajouter des fichiers.",
      "Un PDF se prépare avec une connexion Internet (les pages sont fabriquées au moment de l'ajout).",
    ],
    problems: [
      { q: "« Mon reportage n'apparaît pas dans la régie. »", a: "Il est rangé dans un autre onglet (Cinéma, Émissions…). Sur la vidéo : « Ranger » → Diffusion « 🎛️ Régie (direct) »." },
      { q: "« Impossible d'ouvrir le PDF. »", a: "Vérifier la connexion Internet et réessayer ; sinon exporter le document en images (JPG) et les ajouter comme documents." },
      { q: "« La photo cache le visage du présentateur. »", a: "La déplacer (glisser du doigt, ou une autre des 9 positions) et réduire la taille." },
    ],
  },

  // ───────────────────────────── MONTAGE VIDÉO ─────────────────────────────
  {
    id: "tv-montage",
    icon: "✂️",
    title: "Montage vidéo (Epsilon TV Studio)",
    who: "Chaînes abonnées au Studio (responsable, régie, journaliste)",
    intro:
      "Le Studio contient un logiciel de montage simple, « façon Canva », seulement sur le site : chaque vidéo ou photo importée devient une scène, à la suite. On découpe, on ajoute des textes, des animations, une musique de fond, des transitions et le logo, puis le site fabrique UN seul fichier MP4 (en temps réel : une vidéo de 3 minutes prend environ 3 minutes), à télécharger ou à publier sur la chaîne. Il n'a rien à voir avec le direct.",
    steps: [
      { t: "Ouvrir le montage", d: "Epsilon TV Studio, dans Google Chrome à jour (ordinateur ou Android) → onglet « ✂️ Montage » en haut. Les outils sont à gauche sur ordinateur, en bas sur téléphone : 📁 Importer, 🅣 Texte, 🎵 Musique, 💫 Animations, ✨ Transitions, 📺 Logo, 📐 Format." },
      { t: "Importer", d: "« Importer des fichiers » (ou glisser-déposer les fichiers sur la page sur ordinateur) : vidéos, photos, musiques, plusieurs à la fois. Chaque vidéo ou photo devient une scène dans la bande du bas ; les musiques deviennent la musique de fond. L'import est immédiat." },
      { t: "Arranger les scènes", d: "Toucher une scène dans la bande du bas : une barre d'outils apparaît. « ✂️ Découper » ouvre une fenêtre avec deux poignées pour garder le passage voulu, et « Couper en deux ici » pour faire deux scènes. Pour une photo : « ⏱ Durée ». Aussi : 🔊 Son / 🔇 Muet, Plein cadre ou Image entière, ◀ ▶ pour changer l'ordre (ou glisser la scène sur ordinateur), « ⧉ Dupliquer », 🗑 pour supprimer. ↶ / ↷ pour annuler ou rétablir." },
      { t: "Page vierge (texte entre deux vidéos)", d: "Toucher le petit « ＋ » entre deux scènes dans la bande du bas (ou « ▭ Page vierge » dans la barre d'outils, ou dans l'onglet 📁 Importer) : une page de couleur s'insère à cet endroit, avec un titre prêt à écrire. « 🎨 Fond » pour choisir sa couleur ou un dégradé et sa durée à l'écran. On peut y mettre plusieurs textes, une animation et des transitions comme pour les autres scènes." },
      { t: "Ajouter du texte", d: "Onglet 🅣 Texte : choisir un modèle (Titre, Sous-titre, Petit texte, Bandeau nom télé, Générique de fin). Le texte s'affiche pendant toute la scène choisie. On le fait glisser directement sur l'image pour le placer ; on règle sa couleur, sa taille, sa police, son style (ombre, encadré, contour) et son animation." },
      { t: "Animer", d: "Onglet 💫 Animations : mouvement de la scène choisie (Zoom avant, Zoom arrière, Vers la gauche, Vers la droite, Entrée glissée, Battement) — idéal pour donner vie aux photos ; « Appliquer à toutes les scènes ». Les textes ont leur propre animation : Fondu, Pop, Glisser, Monter, Zoom, Machine à écrire." },
      { t: "Musique", d: "Onglet 🎵 Musique : ajouter une musique, choisir à quelle scène elle commence et après laquelle elle s'arrête, à partir de quel moment de la chanson, son volume et le fondu ; « Son des vidéos » pour baisser le son des vidéos sous la musique. La musique s'arrête toute seule en douceur à la fin de la vidéo." },
      { t: "Transitions (30 au choix)", d: "Toucher le petit rond entre deux scènes (ou onglet ✨ Transitions). Chaque transition a un petit aperçu animé ; toucher pour la choisir, elle se rejoue aussitôt sur l'image. Classiques : coupe, fondu au noir, fondu au blanc, flash, fondu enchaîné, flou. Glisser et pousser (dans les 4 sens). Balayages (4 sens), portes, stores, barres. Formes : cercle, cercle fermant, losange, cœur. Effets : zoom avant, zoom arrière, tourbillon, page tournée, glitch. Régler la durée, « ◀ ▶ » pour passer à la transition voisine, « Appliquer à toutes les scènes »." },
      { t: "Texte qui s'écrit comme au clavier", d: "Mettre une page vierge, écrire le texte, puis Animation « Machine à écrire » : les lettres apparaissent une à une avec un curseur qui clignote. Choisir la vitesse de frappe (lente, normale, rapide). « ⌨️ Son de clavier » ajoute le bruit des touches (on peut le couper ou régler son volume) ; il est aussi dans le fichier MP4." },
      { t: "Format", d: "Onglet 📐 Format : 📺 Télé / YouTube (16:9), 📱 TikTok / Statut (9:16) ou ⬜ Carré (1:1)." },
      { t: "Exporter et publier", d: "« ⤓ Exporter » : choisir HD 720p (conseillé) ou Full HD 1080p, Fichier léger ou Meilleure image, puis « Fabriquer la vidéo ». Ensuite « ⬇ Télécharger le MP4 », ou « 📤 Publier sur la chaîne » : 🎛️ Régie (pour le direct), 🔁 Programme (avec son genre) ou 📢 Publicité. Publier est réservé au responsable et à la régie, 1 Go au plus." },
    ],
    tips: [
      "L'export se fait en temps réel : il dure à peu près la durée de la vidéo. Garder la page ouverte et affichée ; s'il faut changer d'onglet ou si le téléphone se verrouille, l'export se met en pause et reprend tout seul en revenant sur la page.",
      "Le projet est enregistré automatiquement sur l'appareil : on peut fermer la page et reprendre plus tard (📁 Mes projets). Il n'est pas partagé avec les autres appareils.",
      "Raccourcis sur ordinateur : Espace = lecture, Suppr = supprimer la scène ou le texte choisi, Ctrl+Z = annuler.",
      "Pour publier un long film, choisir HD 720p / Fichier léger (environ 45 min pour 1 Go).",
    ],
    problems: [
      { q: "« Ce navigateur ne sait pas fabriquer de MP4. »", a: "Ouvrir le Studio dans Google Chrome à jour (ordinateur ou Android)." },
      { q: "« L'export est en pause. »", a: "La page n'est plus affichée (autre onglet, téléphone verrouillé). Revenir sur la page : l'export reprend tout seul." },
      { q: "« Un fichier ne peut pas être lu. »", a: "Préférer des vidéos MP4, des photos JPG/PNG et des sons MP3/M4A." },
      { q: "« Fichier trop lourd pour être publié. »", a: "Refaire l'export en HD 720p / Fichier léger, ou télécharger le fichier." },
      { q: "« Mes fichiers ont disparu du projet. »", a: "Le projet est lié à l'appareil (et au navigateur) où il a été fait. Sur un autre appareil, il faut réimporter les fichiers." },
    ],
  },
];

// Texte simple d'une fiche (pour la copier et l'envoyer à un client)
export function sheetAsText(s) {
  const out = [`${s.icon} ${s.title}`, "", s.intro, ""];
  if (s.prices) { out.push("Prix :"); s.prices.forEach(([a, b]) => out.push(`• ${a} : ${b}`)); out.push(""); }
  if (s.pricing) {
    out.push(s.pricing.base);
    s.pricing.rows.forEach((r) => out.push(s.id !== "tv" ? `• ${r[0]} : ` + s.pricing.head.slice(1).map((h, k) => (r[k + 1] ? `${h} ${r[k + 1]}` : "")).filter(Boolean).join(" · ") : /\d/.test(r[2]) ? `• ${r[0]} — ${r[1]} : ${r[2].replace(" min ", " minutes regardées ")} (1 émission d'1 h par semaine : ${r[3]} spectateurs ; 1 h chaque jour : ${r[4]} spectateurs)` : `• ${r[0]} — ${r[1]}, nombre de minutes au choix (pour un culte, un concert, un événement ponctuel)`));
    s.pricing.extra.forEach((e) => out.push(`• ${e}`));
    (s.pricing.tables || []).forEach((t) => {
      out.push("", t.title + " :");
      t.rows.forEach((r) => out.push(`• ${r[0]} spectateurs : ` + t.head.slice(1).map((h, i) => `${h.replace(/^Directs (de |d')/, "")} → ${r[i + 1]}`).join(" · ")));
    });
    if (s.pricing.examples) { out.push("", "Exemples :"); s.pricing.examples.forEach((e) => out.push(`• ${e}`)); }
    out.push("");
  }
  s.steps.forEach((st, i) => out.push(`Étape ${i + 1} — ${st.t}\n${st.d}\n`));
  if (s.debate) {
    out.push(s.debate.title, s.debate.intro, "");
    s.debate.steps.forEach((st, i) => out.push(`Étape ${i + 1} — ${st.t}\n${st.d}\n`));
  }
  if (s.tips?.length) { out.push("Bon à savoir :"); s.tips.forEach((t) => out.push(`• ${t}`)); }
  out.push("", "L'équipe Epsilon Messenger");
  return out.join("\n");
}
