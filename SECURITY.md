# GPTBreaker Security Checklist

Ce projet est un front statique avec authentification Supabase. La sécurité ne dépend pas uniquement du code présent ici.

## Déjà appliqué dans ce repo

- clé `service_role` retirée du front et remplacée par une clé `anon`
- flux OAuth Supabase configuré en `pkce`
- authentification bloquée hors `HTTPS` en production
- messages d'erreur d'authentification rendus moins verbeux
- Content Security Policy de base ajoutée sur les pages publiques
- `Permissions-Policy` et politique `Referrer` ajoutées

## Obligatoire avant mise en ligne

### 1. Supabase Auth

- définir `Site URL` sur l'URL publique principale
- ajouter toutes les `Redirect URLs` exactes:
  - `http://localhost:8000/index.html`
  - `http://localhost:8000/market.html`
  - URL de prod exactes pour chaque domaine/app
- activer la confirmation email si tu acceptes les comptes email/mot de passe
- activer la protection contre les mots de passe compromis si disponible
- réduire la durée de vie des sessions si ton produit manipule des données sensibles
- activer les limites de débit auth si disponibles

### 2. Google OAuth

- n'utiliser que le callback Supabase fourni par ton projet
- déclarer le domaine de production dans Google Cloud
- vérifier l'écran de consentement avant ouverture publique
- ne jamais utiliser plusieurs domaines non listés dans Supabase et Google

### 3. Base de données Supabase

- activer le RLS sur chaque table exposée au front
- écrire des policies minimales, par défaut refus total
- vérifier que les buckets Storage ont aussi des policies strictes
- ne jamais appeler d'opérations admin depuis le front
- garder les clés `service_role` uniquement côté serveur

### 4. Hébergement

- forcer HTTPS
- ajouter des headers serveur si ton hébergeur le permet:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-site`
- limiter les domaines autorisés si tu ajoutes des appels API additionnels

### 5. Secrets

- ne jamais committer de `service_role`, clés privées, tokens API OpenAI, Stripe secret, etc.
- si une clé sensible a déjà été exposée, la révoquer immédiatement
- stocker les secrets futurs dans l'environnement de l'hébergeur, jamais dans le front

## Vérifications à faire avant ouverture publique

- tester la connexion email
- tester la création de compte
- tester Google OAuth sur le vrai domaine
- tester la déconnexion et la persistance de session
- vérifier qu'une URL non autorisée est bien refusée par Supabase
- vérifier qu'un utilisateur non connecté ne lit aucune donnée privée

## Limite importante

Une application 100% statique ne peut pas protéger des secrets applicatifs. Si tu ajoutes plus tard:

- paiements
- accès admin
- appels à des modèles IA payants
- logique métier sensible

alors il faudra un backend sécurisé ou des Edge Functions avec contrôle d'accès.
