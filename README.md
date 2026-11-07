# Chalet l’étoile d’or — site

1. **Publier** : déposez tout ce dossier dans votre dépôt GitHub, puis *Settings → Pages → Deploy from a branch → main / root*.
2. **Contenu** : tout (textes FR/EN/DE, ordre des sections, thèmes, WhatsApp, e-mail) est dans `content.json`.
   - Réordonner/retirer une section : modifiez la liste `"sections"`.
   - Changer de style : `"defaultTheme"` (`or`, `glace`, `ivoire`) ou ajoutez un thème dans `"themes"`.
   - Photos : ajoutez vos images dans `photos/` avec les noms indiqués dans `"photos"` (jpg).
   - Avis : ajoutez des entrées dans `"reviews"` ; la section se masque si la liste est vide.
3. **Calendrier Airbnb** : Airbnb → Calendrier → *Disponibilité → Synchroniser → Exporter le calendrier*, copiez le lien.
   Dans GitHub : *Settings → Secrets and variables → Actions → New secret* nommé `ICAL_URL`. Le lien reste privé ; seules les dates occupées sont publiées. Lancez l’action une fois à la main (onglet *Actions*).
4. **Formulaire** : créez un formulaire gratuit sur formspree.io et collez son adresse dans `"formEndpoint"`. Sans cela, le formulaire ouvre l’application mail.
