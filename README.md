# Lecture Louange — 300 conversations en chinois traditionnel

Application de lecture graduée, au format du lecteur de
[literatelanguages.com](https://literatelanguages.com/chinese/reading-practice/), pour apprendre
le chinois **et** le vocabulaire de la foi chrétienne (prière, louange, Bible, théologie).
Chaque conversation s'inspire du titre d'un chant de
[讚美之泉 Stream of Praise](https://www.youtube.com/@streamofpraise/videos).

- 300 conversations, difficulté croissante sur 6 niveaux (≈ HSK 1 → HSK 6), en **chinois traditionnel**.
- Interrupteurs **Pinyin** / **Traduction** (français) / **简 繁**, réglages mémorisés.
- Touchez un mot : pinyin, définition française, traduction de la phrase, prononciation
  (voix chinoise du système).
- Sous chaque texte : le chant associé (lien YouTube) et les mots clés.
- Pages : accueil par niveau et par série, une page par niveau, vocabulaire (filtrable), chants, grammaire
  (points de grammaire par niveau, avec des exemples tirés des conversations), cartes de révision
  (boîtes de Leitner), recherche, « Reprendre » et suivi des conversations lues.
- Export **Anki** : un fichier par niveau et un fichier global dans `site/anki/`.

**Avancement** : voir [docs/ETAT_DES_LIEUX.md](docs/ETAT_DES_LIEUX.md) (fait / en cours / reste à faire),
tableau mis à jour par `npm run etat`.

## Lire

Ouvrir `site/index.html` dans le navigateur (double-clic), ou lancer le petit serveur local :

```powershell
npm run serve
```

puis aller sur http://localhost:8123/.

## Modifier ou régénérer

| Fichier | Rôle |
|---|---|
| `content/*.txt` | les conversations (format décrit dans `docs/GUIDE_REDACTION.md`) |
| `data/glossaire.tsv` | dictionnaire français des mots (mot, pinyin numérique, définition, séparés par des tabulations) ; les mots clés `vocab:` de chaque conversation ont priorité |
| `data/mots_sans_definition.tsv` | mots encore sans définition (généré par `npm run build`) |
| `docs/chants_streamofpraise.txt` | titres de chants relevés sur la chaîne YouTube |
| `src/assets/` | feuille de style et scripts du lecteur |
| `scripts/` | validation, extraction des mots, génération du site |

```powershell
npm install
npm run validate           # format, pinyin, caractères simplifiés, longueurs, mots clés
npm run build              # génère site/ (pages, Anki, grammaire, cartes de révision)
npm run etat               # met à jour le tableau d'avancement de docs/ETAT_DES_LIEUX.md
npm run mots               # extrait les mots à définir (data/a_definir/) pour compléter le glossaire
npm run pinyin:variantes   # liste les mots écrits avec plusieurs pinyin
npm run pinyin:harmoniser  # remet tout le corpus sur la norme de pinyin de Taïwan
```

`npm run validate` vérifie le format, le pinyin (contre le dictionnaire de `pinyin-pro`),
l'absence de caractères simplifiés (OpenCC), la présence des mots clés dans le texte et la longueur de chaque
conversation selon son niveau. Le pinyin suit la **norme de Taïwan** (voir `docs/GUIDE_REDACTION.md`).

## Droits

Aucune parole de chant n'est reproduite : seuls les titres servent de point de départ, avec un
lien de recherche YouTube. Les versets cités viennent du 和合本 (1919) et de la Bible Louis Segond
(1910), tous deux dans le domaine public.
