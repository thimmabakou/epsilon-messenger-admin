# Epsilon Messenger — Site web et espace administration

Site React (Vite) relié à la base Supabase d'Epsilon Messenger.

## Pages

| Adresse | Contenu |
|---|---|
| `#/` | Site public : présentation, documents officiels |
| `#/doc/<id>` | Un document officiel (dernière version **publiée**) |
| `#/aide` | Centre d'aide et de sécurité |
| `#/admin` | Espace administration (mot de passe + code SMS) |

## Espace administration

13 écrans : Vue d'ensemble, Utilisateurs, Appels, Marketplace, Service client, Signalements, Statistiques, Documents, Administrateurs, Versions, Demandes au PDG, Sécurité, Paramètres.

Chaque administrateur ne voit que les écrans permis par ses permissions. Toutes les règles sont **aussi** vérifiées par la base elle-même : même en contournant le site, une action non autorisée est refusée.

## Réglages

Le fichier `.env` contient l'adresse du projet Supabase et sa clé **publique** (faite pour être dans un site). La clé secrète (`service_role` / `sb_secret_…`) ne doit **jamais** apparaître ici.

## Organisation du code

- `src/lib/` : connexion à Supabase, connexion administrateur, textes et listes fixes, outils d'affichage
- `src/pages/` : pages publiques, écran de connexion, cadre de l'administration
- `src/screens/` : un fichier par écran d'administration
- `src/components/` : éléments réutilisés (graphiques, carte, panneau de sanction, code de sécurité)
- `src/styles.css` : l'apparence validée sur la maquette

## Lancer

```
npm install
npm run dev
```
