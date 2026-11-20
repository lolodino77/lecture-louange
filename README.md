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
- Pages : accueil par niveau et par série, une page par niveau, vocabulaire (filtrable), chants.

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
| `data/glossaire.tsv` | dictionnaire français des mots (mot, pinyin numérique, définition) |
| `docs/chants_streamofpraise.txt` | titres de chants relevés sur la chaîne YouTube |
| `src/assets/` | feuille de style et scripts du lecteur |
| `scripts/` | validation, extraction des mots, génération du site |

```powershell
npm install
npm run validate
npm run build
```

`npm run validate` vérifie le format, le pinyin (contre le dictionnaire de `pinyin-pro`),
l'absence de caractères simplifiés (OpenCC) et la longueur de chaque conversation selon son niveau.

## Droits

Aucune parole de chant n'est reproduite : seuls les titres servent de point de départ, avec un
lien de recherche YouTube. Les versets cités viennent du 和合本 (1919) et de la Bible Louis Segond
(1910), tous deux dans le domaine public.
