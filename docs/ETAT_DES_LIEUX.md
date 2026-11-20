# État des lieux — Lecture Louange

Où en est le projet : ce qui est fait, ce qui est en cours, ce qui reste à faire.
Présentation du projet : [README](../README.md). Règles d'écriture : [GUIDE_REDACTION.md](GUIDE_REDACTION.md).

> Le tableau d'avancement plus bas est **généré** à partir de `content/*.txt`.
> Pour le mettre à jour : `npm run etat`. Le reste de ce document est écrit à la main
> (dernière mise à jour : 20 novembre 2026).
>
> Au moment de cet état des lieux, la rédaction des conversations est **en cours** :
> plusieurs tranches sont écrites en parallèle et les chiffres changent d'heure en heure.

## En bref

- **Fait** : le guide de rédaction, toute la chaîne d'outils (validation, génération du site,
  export Anki), le lecteur et toutes les pages du site, et environ la moitié des
  conversations.
- **En cours** : la rédaction des conversations, tranche par tranche (voir le tableau).
- **Reste à faire** : finir les 300 conversations (le niveau 5 n'en est qu'au tout début),
  écrire le **glossaire français** (plus de 2 500 mots n'ont pas de définition au toucher),
  harmoniser le pinyin, trier les avertissements, relire l'ensemble.

---

## ✅ Déjà fait

### Cadrage éditorial
- **Guide de rédaction** complet ([GUIDE_REDACTION.md](GUIDE_REDACTION.md)) : format des fichiers source,
  règles de pinyin et de segmentation, chinois traditionnel de Taïwan, règles sur les versets
  (和合本 / Segond 1910) et sur les chants (titres seulement, jamais de paroles), personnages,
  progression sur 6 niveaux avec longueurs cibles, arc narratif complet de 001 à 300.
- **Liste des titres de chants** de 讚美之泉 (environ 540 titres) relevés sur la chaîne YouTube :
  [chants_streamofpraise.txt](chants_streamofpraise.txt).

### Outils (`scripts/`)
| Script | Commande | Rôle |
|---|---|---|
| `lib/parse.js` | — | lecture du format source (séries, en-têtes, mots `漢字/pinyin`, traductions), niveaux, zhuyin |
| `validate.js` | `npm run validate` | format, pinyin comparé au dictionnaire `pinyin-pro`, caractères simplifiés (OpenCC), longueur selon le niveau, mots clés présents dans le texte |
| `build.js` | `npm run build` | génère tout le site statique dans `site/` et la liste `data/mots_sans_definition.tsv` |
| `extract_words.js` | `npm run mots` | extrait par lots les mots à définir (`data/a_definir/lot-XX.tsv`) pour écrire le glossaire |
| `serve.js` | `npm run serve` | petit serveur local sur http://localhost:8123/ |
| `etat.js` | `npm run etat` | met à jour le tableau d'avancement de ce document |

### Lecteur et site (`src/assets/` → `site/`)
- **Lecteur** : interrupteurs pinyin / zhuyin, traduction française, 简 / 繁 ; toucher un mot affiche
  son pinyin, sa définition et la traduction de la phrase ; prononciation par la voix chinoise
  du système. Les réglages sont mémorisés.
- **Pages** : accueil par niveau et par série, une page par niveau, une page par conversation
  (bannière illustrée, chant associé, mots clés), vocabulaire filtrable, chants, grammaire
  (points de grammaire par niveau, avec des exemples tirés automatiquement des conversations),
  cartes de révision (boîtes de Leitner), recherche, « Reprendre » et suivi des conversations lues.
- **Export Anki** : un fichier par niveau et un fichier global (`site/anki/`).
- Le site est régénéré à partir du contenu actuel au moment de ce commit.

### Contenu
Voir le tableau d'avancement ci-dessous : les tranches marquées ✅ sont complètes.

---

## 🔄 En cours

- **Rédaction des conversations** : les tranches marquées 🔄 dans le tableau sont commencées.
  Plusieurs tranches sont écrites en parallèle, puis validées avec
  `node scripts/validate.js content/NNN-NNN.txt`.
- **Séries ouvertes** : une série commencée dans une tranche se poursuit dans la suivante
  (ex. « La répétition du samedi » commence à 020). La tranche qui suit doit reprendre la même
  série avant d'en ouvrir une nouvelle.
- Une tranche en cours d'écriture peut momentanément faire échouer la validation (conversation
  à moitié écrite) : ce n'est réglé qu'une fois la tranche terminée.

## 📊 Avancement détaillé

<!-- ETAT:DEBUT (bloc généré par npm run etat, ne pas modifier à la main) -->
_Généré le 20 novembre 2026 à 07:19._

**161 / 300 conversations rédigées** (54 %), 32 séries déclarées. Validation : 20 fichier(s) — 0 erreur(s), 44 avertissement(s).

| Niveau | Numéros | Rédigées |
|---|---|---|
| 1 | 001–060 | 30 / 60 |
| 2 | 061–120 | 30 / 60 |
| 3 | 121–180 | 40 / 60 |
| 4 | 181–230 | 34 / 50 |
| 5 | 231–270 | 5 / 40 |
| 6 | 271–300 | 22 / 30 |

| Tranche | Niveau | État | Séries |
|---|---|---|---|
| 001–010 | 1 | ✅ 10/10 | Arrivée à Taipei · Premier dimanche |
| 011–020 | 1 | ✅ 10/10 | Premier dimanche · Chez Xiao En · La répétition du samedi |
| 021–030 | 1 | ✅ 10/10 | La répétition du samedi · Les questions de Xiao Guang |
| 031–040 | 1 | ⏳ 0/10 | — |
| 041–050 | 1 | ⏳ 0/10 | — |
| 051–060 | 1 | ⏳ 0/10 | — |
| 061–070 | 2 | ✅ 10/10 | Noël approche · Annoncer la bonne nouvelle |
| 071–080 | 2 | ✅ 10/10 | Annoncer la bonne nouvelle · Une année nouvelle · Le groupe de maison du mercredi |
| 081–090 | 2 | ✅ 10/10 | Le groupe de maison du mercredi · Le Nouvel An chinois · Lire l'Évangile de Jean |
| 091–100 | 2 | ⏳ 0/10 | — |
| 101–110 | 2 | ⏳ 0/10 | — |
| 111–120 | 2 | ⏳ 0/10 | — |
| 121–130 | 3 | ✅ 10/10 | Préparer le baptême · Rejoindre l'équipe de louange |
| 131–140 | 3 | ✅ 10/10 | Rejoindre l'équipe de louange · Le jour du baptême |
| 141–150 | 3 | ⏳ 0/10 | — |
| 151–160 | 3 | ✅ 10/10 | Premiers pas dans le service · Papa Chen à l'hôpital |
| 161–170 | 3 | ✅ 10/10 | Papa Chen à l'hôpital · Le différend des guitaristes · L'appel de Hualien |
| 171–180 | 3 | ⏳ 0/10 | — |
| 181–190 | 4 | ✅ 10/10 | Mission à Hualien · Le grand rassemblement |
| 191–200 | 4 | ✅ 10/10 | Étudier l'épître aux Romains · Le combat spirituel |
| 201–210 | 4 | 🔄 8/10 (201, 202, 203, 206, 207, 208, 209, 210) | Le combat spirituel · Pâques · Dialogues avec David |
| 211–220 | 4 | 🔄 6/10 (211, 212, 213, 214, 215, 216) | Le fruit de l'Esprit |
| 221–230 | 4 | ⏳ 0/10 | — |
| 231–240 | 5 | 🔄 5/10 (231, 232, 233, 234, 235) | Endormie dans le Seigneur |
| 241–250 | 5 | ⏳ 0/10 | — |
| 251–260 | 5 | ⏳ 0/10 | — |
| 261–270 | 5 | ⏳ 0/10 | — |
| 271–280 | 6 | ✅ 10/10 | Le Dieu trinitaire et l'incarnation · Des credo à la Réforme · Des cantiques aux chants nouveaux |
| 281–290 | 6 | ✅ 10/10 | Des cantiques aux chants nouveaux · Mon Seigneur et mon Dieu · Théologie de l'adoration |
| 291–300 | 6 | 🔄 2/10 (291, 292) | Le premier sermon |

**Manquantes (139)** : 031–060 (30), 091–120 (30), 141–150 (10), 171–180 (10), 204–205 (2), 217–230 (14), 236–270 (35), 293–300 (8).
<!-- ETAT:FIN -->

---

## ⏳ Reste à faire

### 1. Rédiger les conversations manquantes
Les numéros exacts qui manquent sont listés sous le tableau d'avancement. Pour chaque partie
de l'arc narratif, ce que le guide prévoit pour la fin de la partie (les débuts sont souvent
déjà écrits) :

| Partie de l'arc | Niveau | Ce qui reste à raconter (d'après le guide) |
|---|---|---|
| 001–060 | 1 | automne de l'année 1 : rencontre de tous les personnages, premiers mots de la foi, scènes de vie (repas, thé aux perles, pluie, MRT, anniversaire) |
| 061–120 | 2 | Évangile de Jean, péché, pardon, croix, Pâques ; **Luc décide de suivre Jésus vers 110–115**, témoignage simple |
| 121–150 | 3 | après le baptême : équipe de louange, camp d'été (nouvelle naissance, liberté, sainteté, suivre Jésus) |
| 151–180 | 3 | fin du conflit Luc / A-Jie, préparation de la mission courte, 2ᵉ Noël |
| 181–205 | 4 | fin de l'épître aux Romains, tentation et combat spirituel, Pâques |
| 206–230 | 4 | suite du fruit de l'Esprit, Mamie Chen tombe malade, histoire de l'Église à Taïwan (Mackay) |
| 231–270 | 5 | après le décès de Mamie Chen : grâce et loi, élection, providence, appel de Luc ; séminaire : herméneutique, langues bibliques, eschatologie, ecclésiologie, mission, stage |
| 271–285 | 6 | dernières questions de David, **conversion de David vers 283** |
| 286–300 | 6 | baptême de David, mariage de Luc et Xiao En, **300 : culte final** (chant 《這是我們的敬拜》) |

Les conversations déjà écrites ont parfois décalé les jalons (le baptême de Luc tombe vers 134
au lieu de 140) : les tranches suivantes doivent partir de ce qui est **réellement écrit**,
pas seulement du guide.

### 2. Écrire le glossaire français (`data/glossaire.tsv`)
- Le fichier **n'existe pas encore** (le README le mentionne déjà comme s'il existait).
- Sans lui, seuls les mots clés (`vocab:`) de chaque conversation ont une définition au toucher ;
  tous les autres mots s'affichent sans définition. La liste des mots concernés, triée par
  fréquence, est dans `data/mots_sans_definition.tsv` (environ 2 600 mots au moment de cet état
  des lieux, et elle grandit avec le contenu).
- Marche à suivre : `npm run mots` → définir les mots des lots `data/a_definir/lot-XX.tsv` →
  les reporter dans `data/glossaire.tsv` (mot, pinyin numérique, définition, séparés par des
  tabulations) → `npm run build`.
- Le plus efficace est de le faire **une fois toutes les conversations écrites**, pour ne pas
  refaire les lots.

### 3. Harmoniser le pinyin
Les tranches écrites en parallèle ne suivent pas toutes la même norme de prononciation :
certaines utilisent la lecture taïwanaise (dictionnaire du ministère de l'Éducation de Taïwan),
d'autres la lecture continentale. Exemples relevés le 20 novembre 2026 sur les 109 premières
conversations :

| Mot | Variantes trouvées |
|---|---|
| 認識 | ren4shi4 (4×) · ren4shi5 (13×) |
| 休息 | xiu1xi2 (1×) · xiu1xi5 (4×) |
| 訊息 | xun4xi2 (3×) · xun4xi1 (2×) |
| 微笑 | wei2xiao4 (2×) · wei1xiao4 (1×) |
| 奇蹟 | qi2ji1 (1×) · qi2ji4 (1×) |

À décider : **norme taïwanaise** (cohérente avec le choix du chinois traditionnel de Taïwan :
微 wéi, 期 qí, 突 tú, 識 shì, 息 xí, 蹟 jī, 髮 fǎ, 跌 dié) **ou continentale** — puis
l'écrire dans le guide et corriger les fichiers pour qu'ils suivent tous la même.

### 4. Trier les avertissements de validation
`npm run validate` affiche une quarantaine d'avertissements :
- **tons « inhabituels »** : la plupart sont des lectures taïwanaises que le dictionnaire
  continental de `pinyin-pro` ne connaît pas (voir point 3) ;
- **« à vérifier »** : souvent des erreurs du dictionnaire automatique (樂手 yuè, 聖樂 yuè,
  哽咽 yè, 測度 duó sont corrects) ;
- **longueurs** hors de la cible du niveau et **mots clés absents du texte** : apparaissent
  parfois pendant la rédaction et sont en général corrigés en fin de tranche.

### 5. Cohérence entre tranches
- **Chants réutilisés** : près de 30 titres servent déjà dans plusieurs conversations
  (ex. 以馬內利, 喜愛祢的話, 生命的話語…), car chaque tranche choisit ses chants sans voir les
  autres. Avec environ 540 titres disponibles, il est possible de varier : à revoir quand
  toutes les tranches seront écrites.
- Continuité des personnages, des saisons et des jalons (baptême, conversion de David, mariage).

### 6. Relecture
- Relecture humaine : naturel du chinois, exactitude théologique, qualité des traductions
  françaises, exactitude des versets cités (和合本 / Louis Segond 1910).

### 7. Site et documentation
- Régénérer le site (`npm run build`) après chaque tranche : `site/` est versionné dans le dépôt.
- Compléter le README : pages grammaire, cartes de révision, export Anki, `npm run etat`.
- Publication en ligne éventuelle (GitHub Pages, par exemple), à décider.
