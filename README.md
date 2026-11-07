# Site de location d'appartement : phase 1 (fondations)

Contenu de cette phase : projet React + TypeScript + Vite + Tailwind, connexion à Supabase,
schéma SQL complet avec règles de sécurité (RLS), connexion administrateur, tableau de bord de base.
Les phases suivantes (site public, galerie, réservations, éditeur visuel) s'appuient sur cette base.

## 1. Prérequis
- [Node.js 20+](https://nodejs.org), un compte [GitHub](https://github.com), [Supabase](https://supabase.com) et [Vercel](https://vercel.com) (offres gratuites).

## 2. Installer le projet
```bash
npm install
cp .env.example .env.local
npm run dev
```
Le site s'ouvre sur http://localhost:5173.

## 3. Créer la base Supabase
1. Sur supabase.com : **New project** (choisissez une région européenne), notez le mot de passe de la base.
2. **Project Settings > API** : copiez l'**URL** et la clé **anon public** dans `.env.local`
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Ne copiez jamais la clé `service_role`.
3. **SQL Editor > New query** : collez tout le contenu de `supabase/schema.sql` et cliquez sur **Run**.
   À exécuter une seule fois.
4. **Authentication > Providers > Email** : désactivez **Allow new users to sign up** (personne d'autre ne doit pouvoir créer de compte).

## 4. Créer votre compte
**Authentication > Users > Add user > Create new user** : saisissez votre e-mail et un mot de passe solide, cochez **Auto Confirm User**.

## 5. Vous déclarer administrateur
Un compte existant n'a aucun droit tant qu'il n'est pas dans la table `admin_profiles`.
Dans **SQL Editor**, exécutez (en remplaçant l'e-mail) :
```sql
insert into admin_profiles (user_id)
select id from auth.users where email = 'votre@email.fr';
```

## 6. Vérifier que tout fonctionne
1. Relancez `npm run dev` et ouvrez http://localhost:5173/admin.
2. Connectez-vous : vous arrivez sur le tableau de bord (quatre compteurs à 0).
3. Test de sécurité : déconnectez-vous, ouvrez la page publique `/` : le titre s'affiche.
   Un compte non listé dans `admin_profiles` est refusé avec un message explicite.

## 7. Mettre en ligne (GitHub + Vercel)
1. Créez un dépôt GitHub et envoyez-y le projet (le fichier `.env.local` est ignoré par Git : c'est voulu).
2. Sur vercel.com : **Add New > Project**, choisissez le dépôt.
3. Avant de déployer, ajoutez les deux variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
4. **Deploy**. Chaque modification poussée sur GitHub met le site à jour automatiquement.
   Le fichier `vercel.json` gère les URLs propres.

## 8. Sauvegardes
Exportez régulièrement vos données (Supabase > Table Editor > Export en CSV). L'export complet en un clic depuis l'administration arrive en phase 5.

## Sécurité : l'essentiel
- Aucun mot de passe dans le code : les identifiants sont gérés par Supabase Auth.
- La clé `anon` est publique par conception ; la protection repose sur les règles RLS du fichier `schema.sql`.
- Le public ne peut que lire le contenu publié et déposer une demande de réservation « en attente ».
  Le brouillon et les réservations ne lui sont jamais accessibles.
