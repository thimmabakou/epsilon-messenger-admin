// Modèles des documents publics d'Epsilon, préparés le 19/10/2026 d'après ce que fait VRAIMENT l'application.
// Le PDG les charge dans l'éditeur (Documents → « 📥 Charger le modèle »), complète les passages [À COMPLÉTER],
// relit, puis publie. Ce ne sont pas des avis juridiques : à faire relire par un juriste au Congo avant le lancement public.

const MAJ = "Dernière mise à jour : [DATE DE PUBLICATION]";
const EDITEUR = "[NOM LÉGAL DE L'ENTREPRISE], [forme juridique], RCCM [numéro], NIU [numéro], siège : [adresse], République du Congo";
const CONTACT = "le Service client dans l'application (Paramètres → Service client) ou par e-mail à [ADRESSE E-MAIL DE CONTACT]";

export const DOC_TEMPLATES = {
  // ───────────────────────────── CONDITIONS EPSILON BUSINESS ─────────────────────────────
  "conditions-business": `CONDITIONS PARTICULIÈRES D'EPSILON BUSINESS
${MAJ}

Les présentes conditions complètent les Conditions générales d'utilisation d'Epsilon. Elles s'appliquent à toute entreprise, association ou organisation (ci-après « l'Entreprise ») qui ouvre un compte Epsilon Business. Epsilon Business est édité par ${EDITEUR}.

1. LE SERVICE
Epsilon Business permet à l'Entreprise : d'organiser son équipe (organigramme, postes, rangs et pouvoirs) ; de connecter des ordinateurs et d'inviter des personnes ; de recevoir et de traiter les messages de ses clients dans une boîte de réception partagée ; d'utiliser des réponses automatiques et une assistante d'intelligence artificielle (IA) ; de présenter une fiche publique et des documents officiels ; de préparer un plan de succession. D'autres outils (messagerie interne, standard téléphonique, comptabilité) pourront être ajoutés.

2. LES FORMULES ET LEUR PRIX
• Standard mensuel : 1 200 FCFA (≈ 2 $) pour 30 jours — jusqu'à 8 ordinateurs.
• Standard annuel : 12 000 FCFA (≈ 20 $) pour 365 jours — jusqu'à 8 ordinateurs.
• Pro IA mensuel : 7 000 FCFA pour 30 jours — jusqu'à 12 ordinateurs, crédit IA renforcé.
• Pro IA annuel : 70 000 FCFA pour 365 jours — jusqu'à 12 ordinateurs, crédit IA renforcé (14 000 FCFA d'économie par rapport à 12 mois).
• Premium : 12 000 FCFA (≈ 20 $) pour 30 jours — jusqu'à 20 ordinateurs et tous les outils de l'Entreprise.
• Premium annuel : 108 000 FCFA pour 365 jours — jusqu'à 20 ordinateurs et tous les outils de l'Entreprise (25 % d'économie, soit 36 000 FCFA, par rapport à 12 mois).
Les prix en vigueur sont toujours affichés dans l'application avant le paiement. Epsilon peut les modifier en prévenant l'Entreprise au moins 30 jours à l'avance ; la période déjà payée n'est jamais modifiée.

3. PAIEMENT, RENOUVELLEMENT, RETARD
• Le paiement se fait par Mobile Money ; l'abonnement est activé après vérification du paiement par l'équipe Epsilon.
• L'abonnement n'est pas renouvelé automatiquement : l'Entreprise paie la période suivante quand elle le souhaite. Un nouveau paiement s'ajoute à la période en cours.
• Après la fin de l'abonnement, un délai de grâce de 3 jours est accordé. Ensuite, l'Entreprise ne peut plus ajouter ni réactiver d'ordinateurs ou de personnes, et ses clients ne peuvent plus lui écrire comme entreprise ; ses données sont conservées.
• Remboursement : [À COMPLÉTER PAR LE PDG — par exemple : aucun remboursement d'une période commencée, sauf erreur d'Epsilon].

4. L'ASSISTANTE IA : UTILISATION SELON LA FORMULE
• Le volume d'utilisation de l'assistante IA dépend de la formule souscrite. Selon la formule, il peut être limité par un crédit (restreint) ou proposé sans limite de volume, sous réserve d'un usage raisonnable (à volonté). Le détail de chaque formule est affiché dans l'application.
• Pour les formules actuelles, l'assistante IA est limitée par un crédit renouvelé sur 30 jours glissants, égal à une part du prix mensuel de la formule : Standard 10 %, Pro IA 50 %, Premium 35 % (pour une formule annuelle : sur le prix annuel divisé par 12). Le crédit utilisé est visible à tout moment dans l'onglet « Clients » (jauge « Crédit IA »).
• Quand le crédit est épuisé, l'assistante cesse de répondre jusqu'à ce que du crédit se libère ; l'équipe de l'Entreprise continue de répondre normalement. Le crédit non utilisé n'est ni reporté, ni remboursé, ni convertible en argent.
• Les boutons de questions fréquentes, le message d'accueil et le message d'absence ne consomment pas de crédit et restent illimités.
• Epsilon peut faire évoluer le crédit, les limites et les modèles d'IA utilisés, en prévenant l'Entreprise au moins 30 jours à l'avance en cas de réduction.

5. CE QUE FAIT L'ASSISTANTE IA, ET SES LIMITES
• L'assistante répond aux clients uniquement à partir des informations que l'Entreprise a saisies (fiche, activité, horaires, questions fréquentes). Elle ne prend aucune décision commerciale (prix, délai, remboursement, commande) et passe la main à l'équipe.
• L'IA peut se tromper. L'Entreprise est responsable des informations qu'elle fournit et des engagements pris envers ses clients ; elle vérifie et corrige si besoin les réponses données.
• Le client est informé dans la discussion qu'une assistante IA peut répondre et qu'elle lit sa question pour y répondre. L'assistante se tait dès qu'un membre de l'équipe prend la demande en charge.

6. LES DISCUSSIONS AVEC LES CLIENTS
• Les messages des clients sont lus par les membres de l'équipe à qui l'Entreprise a donné le pouvoir « Discussions clients ». Le client en est informé. Les messages restent chiffrés de bout en bout entre le client et l'équipe.
• L'Entreprise s'engage à ne pas utiliser ces discussions pour du démarchage abusif (spam) et à respecter les Règles de communauté et la Politique de confidentialité.

7. ÉQUIPE, POUVOIRS ET SUCCESSION
• Les pouvoirs appartiennent au poste le plus élevé de l'organigramme (le dirigeant), et non à la personne qui a créé le compte. Le dirigeant est responsable de l'attribution des postes, des pouvoirs et des accès.
• Le plan de succession (intérim, successeurs, règles du conseil de direction) est choisi par le dirigeant. Epsilon peut, sur présentation de pièces justificatives (par exemple un acte de décès), confirmer une succession sans attendre le délai prévu. Epsilon n'est pas juge des conflits internes à l'Entreprise.

8. DOCUMENTS OFFICIELS ET BADGE DE CERTIFICATION
• Le dépôt de documents officiels est facultatif. Le badge « ✔ Papiers vérifiés par Epsilon » n'est accordé qu'après vérification des documents exigés par la législation du pays de l'Entreprise.
• L'Entreprise garantit que les documents déposés sont authentiques et à jour. Epsilon peut refuser ou retirer le badge à tout moment, et suspendre le compte en cas de document faux.
• L'Entreprise choisit qui peut voir chaque document (tout le monde, l'équipe, la direction ou le dirigeant seul).

9. SUSPENSION ET RÉSILIATION
Epsilon peut suspendre ou fermer un compte Epsilon Business en cas de fraude, de faux documents, de non-respect des présentes conditions ou de la loi, après avoir, sauf urgence, prévenu l'Entreprise. L'Entreprise peut cesser d'utiliser Epsilon Business à tout moment ; [À COMPLÉTER PAR LE PDG : conservation et suppression des données après résiliation].

10. RESPONSABILITÉ
Epsilon fait ses meilleurs efforts pour assurer un service disponible et sûr, sans pouvoir garantir l'absence totale d'interruption. [À COMPLÉTER PAR UN JURISTE : plafond de responsabilité.]

11. DROIT APPLICABLE
Les présentes conditions sont soumises au droit de la République du Congo et à l'Acte uniforme OHADA lorsqu'il s'applique. [À COMPLÉTER PAR UN JURISTE : tribunal compétent.]
Contact : ${CONTACT}.`,

  // ───────────────────────────── CONDITIONS D'UTILISATION ─────────────────────────────
  conditions: `CONDITIONS GÉNÉRALES D'UTILISATION D'EPSILON
${MAJ}

1. QUI SOMMES-NOUS
Epsilon (l'application « Epsilon », le site Epsilon TV Studio et les services associés) est édité par ${EDITEUR}, ci-après « Epsilon » ou « nous ».
Pour nous joindre : ${CONTACT}.

2. ACCEPTATION
En créant un compte ou en utilisant Epsilon, vous acceptez les présentes conditions, la Politique de confidentialité, les Règles de communauté et, si vous achetez ou vendez, la Politique marketplace. Si vous n'êtes pas d'accord, n'utilisez pas Epsilon.

3. LES SERVICES
Epsilon permet notamment :
• d'échanger des messages, photos, vidéos, documents et messages vocaux, seul ou en groupe ;
• de passer des appels audio et vidéo, seul ou en groupe ;
• de publier des statuts (visibles 24 heures) ;
• d'ouvrir une boutique, de vendre et d'acheter des produits (Boutiques), avec suivi des commandes et, au choix de l'acheteur, un paiement sécurisé par Epsilon ;
• de regarder et de gérer des chaînes de télévision (Epsilon TV), avec programmes, grille, publicités et directs ;
• d'écouter de la musique et d'utiliser des sonneries ;
• de contacter le Service client.
Certains services sont payants (abonnements des boutiques, formules et options Epsilon TV, Epsilon TV Studio, publicités). Leurs prix sont affichés dans l'application avant tout paiement.

4. VOTRE COMPTE
• L'inscription se fait avec votre numéro de téléphone. Vous devez donner des informations exactes et un seul compte par personne, sauf autorisation d'Epsilon.
• Âge minimum : 13 ans. Pour vendre, acheter avec le paiement sécurisé, ouvrir une chaîne ou acheter une publicité, il faut avoir 18 ans (ou l'âge de la majorité dans votre pays). [À CONFIRMER PAR LE PDG]
• Vous êtes responsable de tout ce qui se fait avec votre compte. Ne partagez jamais votre code de connexion. Signalez-nous immédiatement tout usage frauduleux.
• Vous pouvez supprimer votre compte à tout moment depuis l'application ou en écrivant au Service client.

5. CE QUE VOUS PUBLIEZ
• Vous restez propriétaire de vos contenus (messages, photos, vidéos, produits, programmes TV…).
• Vous autorisez Epsilon à les héberger, les copier techniquement, les afficher et les transmettre aux personnes que vous avez choisies, uniquement pour faire fonctionner le service. Pour les contenus publics (boutiques, produits, chaînes TV, statuts publics, publicités), cette autorisation vaut pour toute la durée de leur publication.
• Vous garantissez avoir le droit de publier ce que vous publiez (droits d'auteur sur les films, séries, musiques, photos, logos…). Une chaîne TV ne doit diffuser que des programmes dont elle détient les droits.
• Vous respectez les Règles de communauté. Epsilon peut retirer un contenu, limiter ou suspendre un compte qui ne les respecte pas, après examen d'un signalement ou de sa propre initiative.

6. SERVICES PAYANTS
• Les paiements se font par Mobile Money (MTN, Airtel) aux numéros Epsilon affichés dans l'application, puis en donnant le code de la transaction reçu par SMS. Chaque code ne peut servir qu'une seule fois.
• Un service payé est activé après vérification du paiement. Sauf erreur d'Epsilon ou disposition contraire de la loi, les sommes versées pour un abonnement ou une option déjà activés ne sont pas remboursées.
• Les prix peuvent changer ; le nouveau prix s'applique à la période suivante, jamais à une période déjà payée.

7. BOUTIQUES ET COMMANDES
Les ventes se font entre l'acheteur et le vendeur. Epsilon fournit l'outil (boutique, commande, suivi du colis, paiement sécurisé facultatif) mais n'est pas le vendeur. Les règles détaillées sont dans la Politique marketplace.

8. EPSILON TV
• Le responsable d'une chaîne est seul responsable des programmes, directs, publicités, bandeaux, documents et photos qu'il diffuse, ainsi que de son équipe (régie, journalistes, statistiques).
• Les minutes de direct et l'espace de stockage dépendent de la formule choisie. Epsilon peut suspendre un direct ou une chaîne qui enfreint la loi ou les Règles de communauté.
• Epsilon TV Studio (site de gestion et logiciel de montage) est un abonnement distinct.

9. DISPONIBILITÉ
Nous faisons notre possible pour qu'Epsilon fonctionne en permanence, mais le service peut être interrompu (maintenance, panne d'Internet ou d'un prestataire, cas de force majeure). Epsilon peut faire évoluer, ajouter ou retirer des fonctions.

10. RESPONSABILITÉ
• Epsilon n'est pas responsable des contenus publiés par les utilisateurs, ni des produits vendus, ni des échanges entre utilisateurs, sauf faute prouvée de sa part.
• Epsilon n'est pas responsable des pertes dues à un mauvais usage de votre compte, à un téléphone perdu ou volé, ou à un code partagé.
• Rien dans ces conditions ne limite les droits que la loi vous accorde et qu'on ne peut pas écarter par contrat.

11. SUSPENSION ET FIN
Vous pouvez arrêter d'utiliser Epsilon à tout moment. Epsilon peut suspendre ou fermer un compte en cas de manquement grave (fraude, arnaque, contenu illégal, usurpation d'identité, non-paiement, atteinte à la sécurité), en vous en informant sauf urgence ou obligation légale.

12. MODIFICATIONS
Nous pouvons modifier ces conditions. Les changements importants vous seront annoncés dans l'application avant leur entrée en vigueur. Continuer à utiliser Epsilon après cette date vaut acceptation.

13. LOI APPLICABLE ET LITIGES
Ces conditions sont soumises au droit de la République du Congo. En cas de désaccord, contactez d'abord le Service client : nous cherchons toujours une solution à l'amiable. À défaut, les tribunaux compétents de [VILLE, ex. Brazzaville] seront saisis.`,

  // ───────────────────────────── POLITIQUE DE CONFIDENTIALITÉ ─────────────────────────────
  confidentialite: `POLITIQUE DE CONFIDENTIALITÉ D'EPSILON
${MAJ}

Cette politique explique quelles données personnelles Epsilon collecte, pourquoi, avec qui elles sont partagées et quels sont vos droits. Elle respecte la loi n° 29-2019 du 10 octobre 2019 portant protection des données à caractère personnel en République du Congo.

1. RESPONSABLE DU TRAITEMENT
${EDITEUR}. Contact pour vos données : ${CONTACT}.

2. LES DONNÉES QUE NOUS COLLECTONS
a) Votre compte : numéro de téléphone, nom, prénom, photo de profil, ville et pays, année de naissance si vous la donnez, langue et monnaie choisies, réglages (thème, notifications, confidentialité).
b) Vos contacts : si vous l'autorisez, les numéros et noms de votre répertoire sont envoyés à Epsilon pour trouver vos contacts qui utilisent Epsilon et les afficher sous le nom que vous leur avez donné. Cette liste est rattachée à votre compte, visible par vous seul, et supprimée avec votre compte.
c) Vos communications : messages, photos, vidéos, documents, messages vocaux, statuts, appels. Un participant peut enregistrer un appel sur son propre téléphone : les autres sont prévenus par un bandeau rouge pendant l'appel ; l'enregistrement reste sur le téléphone de celui qui l'a fait. Les messages des discussions sont chiffrés de bout en bout lorsque le chiffrement est activé : Epsilon ne peut pas les lire. Les fichiers sont conservés pour être livrés à leurs destinataires.
d) Service client : vos échanges avec le Service client, y compris les messages vocaux et, lorsque vous en êtes informé au début de l'appel, l'enregistrement des appels au Service client, pour la qualité et le règlement des litiges.
e) Boutiques et commandes : boutique, produits, prix, avis, offres de prix, commandes, étapes de livraison, villes de départ et d'arrivée.
f) Paiements : opérateur (MTN ou Airtel), code de transaction, montant, numéro Mobile Money pour les retraits et remboursements. Epsilon ne connaît jamais votre code secret Mobile Money.
g) Epsilon TV : chaînes suivies, vues, minutes regardées en direct, commentaires et réactions dans les directs ; pour les chaînes : programmes, statistiques, membres de l'équipe.
h) Données techniques : type de téléphone, version de l'application, jeton de notification, présence « en ligne », journaux techniques (pour la sécurité et le dépannage).
i) Centres d'intérêt : catégories de produits et de contenus que vous consultez, pour vous proposer des produits et des publicités adaptés à votre zone et à vos goûts.

3. POURQUOI NOUS LES UTILISONS
• Faire fonctionner Epsilon (comptes, messages, appels, boutiques, commandes, TV, paiements) — exécution du contrat ;
• Sécurité : prévenir la fraude, les arnaques, les faux comptes et les abus ; traiter les signalements — intérêt légitime ;
• Paiements, comptabilité et obligations légales — obligation légale ;
• Publicité et recommandations par zone et centres d'intérêt — votre consentement, que vous pouvez retirer ;
• Améliorer le service grâce à des statistiques globales.
Nous ne vendons jamais vos données personnelles.

4. QUI PEUT VOIR VOS DONNÉES
• Les personnes avec qui vous échangez ; le public pour ce que vous rendez public (boutique, produits, chaîne, statut public) ; selon vos réglages de confidentialité pour le reste (photo, « en ligne »…).
• L'équipe Epsilon habilitée (Service client, modération, validation des paiements), chacun selon ses permissions ; chaque action sensible est inscrite au journal de sécurité.
• Nos prestataires techniques, qui agissent sur nos instructions : hébergement de la base de données (Supabase), stockage des fichiers, site et diffusion des vidéos et directs (Cloudflare), envoi d'e-mails (Brevo), notifications (Google Firebase). Certains de ces serveurs sont situés hors du Congo ; nous choisissons des prestataires offrant un niveau de protection adapté, conformément à la loi.
• Les autorités, uniquement lorsque la loi l'exige.

5. DURÉE DE CONSERVATION
• Compte : tant qu'il est actif ; supprimé dans un délai de [30] jours après la suppression du compte, sauf obligation légale.
• Statuts : 24 heures. Messages et fichiers : jusqu'à leur suppression par vous ou par la suppression du compte.
• Paiements, commandes et grand livre du paiement sécurisé : [5 à 10] ans, pour les obligations comptables et les litiges. [À CONFIRMER]
• Enregistrements d'appels du Service client : [6] mois. Journaux techniques : quelques jours à quelques semaines.

6. SÉCURITÉ
Chiffrement des connexions, chiffrement de bout en bout des messages lorsqu'il est activé, accès de l'équipe limité par permissions et validés par double authentification, double vérification des codes de paiement, journal de sécurité. En cas de violation de données, nous informons l'autorité compétente dans les 72 heures et les personnes concernées si le risque est important.

7. VOS DROITS
Vous pouvez à tout moment : accéder à vos données, les faire corriger, demander leur suppression, vous opposer à certains usages (dont la publicité personnalisée) et retirer votre consentement. Écrivez au Service client : nous répondons dans un délai d'un mois. Vous pouvez aussi saisir la Commission nationale de protection des données à caractère personnel lorsqu'elle sera en place.

8. MINEURS
Epsilon est interdit aux moins de 13 ans. Les données des mineurs sont protégées avec une attention particulière ; un parent peut demander la suppression du compte de son enfant.

9. CHANGEMENTS
Nous vous informerons dans l'application de toute modification importante de cette politique.`,

  // ───────────────────────────── RÈGLES DE COMMUNAUTÉ ─────────────────────────────
  "regles-communaute": `RÈGLES DE COMMUNAUTÉ D'EPSILON
${MAJ}

Epsilon doit rester un lieu sûr et respectueux. Ces règles s'appliquent partout : discussions, groupes, statuts, appels, boutiques, avis, chaînes TV, directs, commentaires et publicités.

CE QUI EST INTERDIT
1. Nudité et contenu sexuel, et TOUT contenu sexuel impliquant un mineur (signalé immédiatement aux autorités).
2. Harcèlement, intimidation, menaces, chantage, partage de photos, d'informations privées ou d'enregistrements d'appels d'une personne sans son accord.
3. Violence : appels à la violence, apologie du terrorisme, contenus choquants ou cruels.
4. Discours haineux contre une personne ou un groupe en raison de son origine, ethnie, religion, sexe, handicap ou autre.
5. Arnaques et fraudes : faux produits, faux paiements, faux codes de transaction, demandes d'argent trompeuses, chaînes de Ponzi.
6. Usurpation d'identité et faux comptes trompeurs (se faire passer pour une personne, une entreprise ou l'équipe Epsilon).
7. Fausses informations dangereuses (santé, élections, catastrophes).
8. Produits et services interdits : armes, drogues, médicaments sans autorisation, animaux protégés, documents officiels falsifiés, contenus piratés.
9. Atteinte aux droits d'auteur : diffuser films, séries, matchs, musiques ou logos sans en avoir les droits, notamment sur Epsilon TV.
10. Spam et messages publicitaires non désirés en masse.

SIGNALER
Appuyez longuement sur un message, un statut, un produit ou une chaîne → « Signaler ». Choisissez le motif. L'équipe de modération examine chaque signalement.

CE QUI PEUT ARRIVER
Selon la gravité : retrait du contenu, avertissement, suspension de 24 heures, 7 jours ou 30 jours, suspension définitive. Les cas les plus graves sont transmis aux autorités. Une boutique ou une chaîne peut être mise en pause. Vous pouvez contester une décision auprès du Service client.`,

  // ───────────────────────────── POLITIQUE MARKETPLACE ─────────────────────────────
  "politique-marketplace": `POLITIQUE MARKETPLACE (BOUTIQUES, COMMANDES, PAIEMENT SÉCURISÉ)
${MAJ}

1. LES BOUTIQUES
• Ouvrir une boutique : 600 FCFA le premier mois, puis 1 000 FCFA par mois (Standard) ou 3 000 FCFA par mois (Pro, plus de visibilité). Sponsoriser un produit : 200 FCFA pour 7 jours. [Vérifier que ces prix sont toujours à jour]
• Le vendeur s'engage à décrire honnêtement ses produits (photos réelles, prix, état, délais), à respecter ses conditions de vente (livraison, retrait, envoi à l'étranger, douane) et la loi.
• Produits interdits : voir les Règles de communauté.

2. LES COMMANDES
• Chaque commande a un numéro (ex. EPS-00012) et un suivi étape par étape. Le vendeur coche les étapes ; seul l'acheteur peut dire « Commande reçue ».
• L'acheteur peut annuler tant que le vendeur n'a pas confirmé ; le vendeur tant que le colis n'est pas parti.

3. LE PAIEMENT
Au choix de l'acheteur :
a) Paiement direct au vendeur (Mobile Money ou espèces), sans protection d'Epsilon ;
b) Paiement sécurisé par Epsilon :
• l'acheteur envoie le montant au numéro Epsilon affiché et donne le code de la transaction ;
• après vérification, Epsilon GARDE l'argent pendant la livraison ;
• l'argent est versé au vendeur, moins une commission de 3 %, quand l'acheteur touche « J'ai reçu ma commande », ou automatiquement 3 jours après la dernière étape de livraison si l'acheteur ne signale aucun problème ;
• le vendeur retire son solde par Mobile Money (500 FCFA minimum) ;
• les commandes en FCFA seulement.

4. PROBLÈME AVEC UNE COMMANDE (LITIGE)
• Avant de confirmer la réception, l'acheteur peut « Signaler un problème » : l'argent reste bloqué.
• Epsilon examine les éléments des deux parties (messages, photos, étapes de livraison) et décide : payer le vendeur ou rembourser l'acheteur. La décision est expliquée aux deux parties.
• Si une commande payée par Epsilon est annulée, l'acheteur est remboursé intégralement.
• Un faux code de paiement, une fausse déclaration de livraison ou un litige abusif entraînent la suspension du compte.

5. RESPONSABILITÉ
Le vendeur est seul responsable de ses produits et de sa livraison. Epsilon intervient comme intermédiaire technique et, pour le paiement sécurisé, comme tiers de confiance qui garde et reverse l'argent selon les règles ci-dessus.`,

  // ───────────────────────────── FAQ ─────────────────────────────
  faq: `QUESTIONS FRÉQUENTES (FAQ)
${MAJ}

COMPTE
• Comment créer un compte ? Téléchargez Epsilon, entrez votre numéro de téléphone et le code reçu par SMS, puis votre nom et votre photo.
• J'ai changé de téléphone. Installez Epsilon et connectez-vous avec le même numéro. Pour retrouver vos messages chiffrés, gardez votre clé de récupération.
• Comment supprimer mon compte ? Écrivez au Service client depuis l'application. [Préciser s'il existe un bouton dans les Paramètres]

DISCUSSIONS ET APPELS
• Mes messages sont-ils privés ? Oui. Quand le chiffrement de bout en bout est activé, même Epsilon ne peut pas les lire.
• Puis-je appeler en groupe ? Oui, en audio et en vidéo, depuis un groupe ou l'onglet Appels.
• Un statut dure combien de temps ? 24 heures.

BOUTIQUES ET ACHATS
• Comment ouvrir une boutique ? Onglet Boutiques → « Ma boutique » → suivez les étapes et payez l'ouverture (600 FCFA le premier mois).
• Comment suivre ma commande ? Boutiques → 📦 Mes commandes. Le colis avance en temps réel.
• Qu'est-ce que le paiement sécurisé ? Vous payez Epsilon au lieu du vendeur ; Epsilon garde l'argent et ne le verse au vendeur que lorsque vous avez reçu votre commande. En cas de problème, Epsilon tranche.
• Je suis vendeur : quand suis-je payé ? Quand le client confirme la réception, ou automatiquement 3 jours après la livraison. Retirez ensuite votre solde depuis « Mes ventes » → Mon solde.

EPSILON TV
• Comment regarder une chaîne ? Onglet TV : choisissez une chaîne, les programmes passent 24 h/24 selon sa grille.
• Comment ouvrir ma chaîne ? Contactez le Service client pour choisir une formule.
• Puis-je gérer ma chaîne sur un ordinateur ? Oui, avec Epsilon TV Studio (abonnement de 10 000 FCFA par mois), qui comprend aussi la régie du direct et un logiciel de montage.
• Mon équipe peut-elle m'aider ? Oui : ajoutez une régie, un journaliste ou une personne aux statistiques dans « 👥 Équipe de la chaîne ». Chacun utilise son propre compte.

PAIEMENTS
• Comment payer ? Par MTN Mobile Money ou Airtel Money aux numéros Epsilon affichés, puis donnez le code de la transaction reçu par SMS.
• Mon paiement est refusé. Vérifiez que vous avez recopié exactement le code du SMS de confirmation. Un code ne sert qu'une fois.

SÉCURITÉ
• Epsilon me demande-t-il mon code Mobile Money ? JAMAIS. Ne donnez jamais votre code secret, même à quelqu'un qui dit travailler pour Epsilon.
• Comment signaler un abus ? Appui long sur le contenu → « Signaler », ou écrivez au Service client.

BESOIN D'AIDE ?
Paramètres → Service client : écrivez ou envoyez un message vocal, l'équipe vous répond.`,
};
