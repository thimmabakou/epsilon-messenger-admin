// Fiches pratiques du Service client : pour guider au téléphone (ou par message) une personne qui ne s'en sort pas.
// Chaque étape est écrite pour être lue telle quelle au client, ou copiée et envoyée dans sa discussion.
// Les prix et les noms de boutons correspondent à l'application actuelle : à mettre à jour ici si ça change.

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
      { t: "Confirmer la réception (acheteur)", d: "Quand le colis est en main (devant le livreur, ou à la poste), toucher « 📦 J'ai reçu ma commande ». Ne jamais le faire avant d'avoir le colis : plus tard, avec le paiement sécurisé, c'est ce bouton qui versera l'argent au vendeur." },
      { t: "Annuler", d: "L'acheteur peut annuler tant que le vendeur n'a pas confirmé. Le vendeur peut annuler tant que le colis n'est pas parti. Ensuite, il faut s'arranger dans la discussion ou contacter le Service client." },
    ],
    tips: [
      "Pour l'instant, le paiement se règle directement entre l'acheteur et le vendeur (Mobile Money ou espèces). Bientôt : l'argent sera gardé par Epsilon et versé au vendeur seulement à « Commande reçue ».",
      "Les conditions de vente du produit (livraison, envoi à l'étranger, douane, taxes) sont recopiées dans le message de commande.",
      "On ne peut pas commander dans sa propre boutique.",
    ],
    problems: [
      { q: "« Je ne vois pas ma commande dans Mes commandes. »", a: "Vérifier l'onglet (Mes achats / Mes ventes). Les commandes passées avant le 16/10/2026 n'ont pas de suivi : elles restent seulement en message dans la discussion." },
      { q: "« Le vendeur n'avance pas mon colis. »", a: "Lui écrire avec le bouton « 💬 Écrire » de la commande. S'il ne répond pas, le client peut contacter le Service client avec le numéro EPS-… de la commande." },
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
      "Contenus interdits : piratage (films, matchs, émissions d'autres chaînes sans droits), violence, contenu sexuel, appels à la haine. Une chaîne qui ne respecte pas cela est mise en pause sans remboursement.",
      "Pour diffuser des matchs ou des films, le responsable doit posséder les droits. Au moindre doute, demander l'avis du PDG avant d'ouvrir la chaîne.",
      "Une église ou une association qui veut seulement annoncer un événement n'a pas besoin d'une chaîne : orientez-la vers la publicité ou un communiqué (voir ces fiches).",
      "Numéro de canal : chaque chaîne a un numéro (canal 1, 2, 3…). Pour aider quelqu'un à trouver une chaîne, donnez-lui simplement ce numéro : dans l'onglet TV, il touche « 🔢 Aller au canal », tape le numéro, puis OK. Une nouvelle chaîne reçoit le numéro suivant ; le PDG peut le changer dans le site (Epsilon TV → « 🔢 Numéro de canal »).",
      "Genres et diffusion : en publiant (ou avec « Ranger »), le responsable choisit le GENRE (🎬 Cinéma, 📺 Séries, 📰 Journal, 🎵 Musique, 🌍 Documentaires, 🎙️ Émissions) et la DIFFUSION : 🔁 en boucle (24 h/24, les uns après les autres), ⏰ à heure fixe (jour et heure à la seconde, heure de Brazzaville) ou 📢 publicité. Toutes les pubs ensemble forment la PAGE DE PUB (avec l'animation « Publicité » / « Fin de la publicité ») qui sépare les programmes. Films, épisodes de séries et documentaires de plus de 30 minutes ont une page de pub avant, une au MILIEU exact et une à la fin, puis reprennent à la seconde près. La musique n'est jamais coupée, et il n'y a pas de pub entre deux chansons qui se suivent. Avant un rendez-vous à heure fixe, la page de pub est placée pour se terminer PILE à l'heure (ex. 3 min 09 s de pub avant 20:00:00 → elle commence à 19:56:51) ; ensuite le programme interrompu reprend là où il s'était arrêté. L'onglet « 📅 Grille » montre les 48 prochaines heures, seconde par seconde.",
      "Grille type de la journée : dans 📅 Grille → « Grille type », la chaîne décrit sa journée UNE fois, sans nommer les fichiers (ex. 19:00:00 → 3 épisodes de la série ; 09:00:00 → rediffusion des épisodes 1 et 2 de la veille ; 12:00:00 → épisode 3 ; 14:00:00 → documentaire ; 16:30:00 → film ; 00:00:00 → musique avec photo ; 05:00:00 → musique avec pub). L'application choisit les vidéos du bon genre (épisodes dans l'ordre, une série après l'autre) et calcule les durées toute seule, chaque jour. La musique remplit les trous sans jamais être coupée ; les espaces encore « libres » sont affichés en jaune, avec leurs heures, pour les compléter.",
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
      { t: "Se connecter", d: "Avec le compte Epsilon du responsable de la chaîne : même numéro, même code que dans l'application. Un compte sans chaîne voit « Accès refusé »." },
      { t: "Payer l'abonnement", d: "Sans abonnement, le site affiche le prix (10 000 FCFA par mois, converti dans la monnaie du client) et les numéros Mobile Money d'Epsilon. Le responsable paie, puis écrit au Service client « Abonnement Studio — nom de la chaîne » avec le code du SMS." },
      { t: "Activer (PDG)", d: "Site administrateur → Epsilon TV → la chaîne → « 🖥️ Studio (site) » : choisir 1, 3, 6 ou 12 mois, recopier le code du paiement (ou « Payé en espèces »), confirmer avec le code PDG. Le responsable recharge la page du Studio : sa régie s'ouvre." },
      { t: "Régie du direct à deux", d: "Le journaliste lance le direct avec le TÉLÉPHONE (onglet TV → Ma chaîne → Passer en direct) et reste sur l'écran de la caméra. La régie, sur le site, voit le direct, les commentaires, et touche une vidéo pour la balancer à l'antenne (reportage, publicité), puis « 📷 Revenir à la caméra ». Elle peut aussi terminer le direct pour tout le monde." },
    ],
    tips: [
      "Le Studio et l'application montrent la même chaîne : ce qui est fait sur l'un apparaît aussitôt sur l'autre.",
      "Sur un ordinateur avec webcam, le direct peut aussi être lancé depuis le site (même bouton « Passer en direct »).",
      "À la fin de l'abonnement, le site redemande le paiement ; la chaîne, elle, continue de passer normalement, et le responsable la gère depuis son téléphone.",
    ],
    problems: [
      { q: "« Le site me dit Accès refusé. »", a: "Le compte connecté n'est pas celui du responsable de la chaîne. Se déconnecter (« Changer de compte ») et se connecter avec le numéro qui gère la chaîne." },
      { q: "« J'ai payé mais le site demande toujours l'abonnement. »", a: "Vérifier dans le site administrateur (Epsilon TV → la chaîne) la ligne « Epsilon TV Studio ». Si le paiement est reçu, l'activer avec « 🖥️ Studio (site) », puis demander au client de recharger la page." },
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
