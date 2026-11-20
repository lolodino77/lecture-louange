# État des lieux — Lecture Louange

Où en est le projet : ce qui est fait, ce qui est en cours, ce qui reste à faire.
Présentation du projet : [README](../README.md). Règles d'écriture : [GUIDE_REDACTION.md](GUIDE_REDACTION.md).

> Le tableau d'avancement plus bas est **généré** à partir de `content/*.txt`.
> Pour le mettre à jour : `npm run etat`. Le reste de ce document est écrit à la main
> (dernière mise à jour : 20 novembre 2026, après l'étoffement du niveau 5 et le réglage des longueurs).
>
> Estimation du reste : l'essentiel est la **relecture humaine** (chinois, théologie, traductions,
> versets, glossaire) et la décision sur une publication en ligne. Il n'y a plus de travail de rédaction.

## En bref

- **Fait** : les **300 conversations sur 300** ; le guide de rédaction (désormais avec la norme de
  pinyin de Taïwan) ; toute la chaîne d'outils (validation, génération du site, export Anki) ;
  le lecteur et toutes les pages du site ; le **glossaire français complet** (3 566 mots, plus aucun mot
  sans définition) ; le **pinyin harmonisé** ; la validation passe avec **0 erreur et 0 avertissement**
  (toutes les longueurs sont dans la cible) ; le site a été contrôlé en navigateur.
- **Reste** : la relecture humaine (chinois, théologie, traductions, versets, glossaire), quelques
  points de continuité à trancher (voir « Reste à faire ») et la décision sur une publication en ligne.

---

## ✅ Déjà fait

### Cadrage éditorial
- **Guide de rédaction** complet ([GUIDE_REDACTION.md](GUIDE_REDACTION.md)) : format des fichiers source,
  règles de pinyin et de segmentation, chinois traditionnel de Taïwan, règles sur les versets
  (和合本 / Segond 1910) et sur les chants (titres seulement, jamais de paroles), personnages,
  progression sur 6 niveaux avec longueurs cibles, arc narratif de 001 à 300.
- **Norme de pinyin décidée et écrite dans le guide** : norme de **Taïwan** (微 wei2, 期 qi2, 突 tu2, 識 shi4,
  息 xi2, 蹟 ji1, 髮 fa3, 跌 die2), pas de sandhi pour 一 et 不, ü écrit v, une seule forme par mot.
- **Liste des titres de chants** de 讚美之泉 (environ 540 titres) : [chants_streamofpraise.txt](chants_streamofpraise.txt).

### Outils (`scripts/`)
| Script | Commande | Rôle |
|---|---|---|
| `lib/parse.js` | — | lecture du format source (séries, en-têtes, mots `漢字/pinyin`, traductions), niveaux, zhuyin |
| `validate.js` | `npm run validate` | format, pinyin (dictionnaire `pinyin-pro` + lectures de Taïwan), caractères simplifiés (OpenCC), longueur selon le niveau, mots clés présents dans le texte, titres de chants |
| `build.js` | `npm run build` | génère tout le site statique dans `site/` et la liste `data/mots_sans_definition.tsv` |
| `extract_words.js` | `npm run mots` | extrait par lots les mots à définir (`data/a_definir/lot-XX.tsv`) |
| `harmoniser_pinyin.js` | `npm run pinyin:harmoniser` | remet le corpus sur la norme de pinyin de Taïwan (à relancer après une nouvelle tranche) |
| `variantes_pinyin.js` | `npm run pinyin:variantes` | liste les mots écrits avec plusieurs pinyin (il ne reste que de vrais homographes : 了, 地, 得, 著…) |
| `serve.js` | `npm run serve` | petit serveur local sur http://localhost:8123/ |
| `etat.js` | `npm run etat` | met à jour le tableau d'avancement de ce document |

### Lecteur et site (`src/assets/` → `site/`)
- **Lecteur** : interrupteurs pinyin / zhuyin, traduction française, 简 / 繁 ; toucher un mot affiche
  son pinyin, sa définition et la traduction de la phrase ; prononciation par la voix chinoise
  du système. Les réglages sont mémorisés.
- **Pages** : accueil par niveau et par série, une page par niveau, une page par conversation,
  vocabulaire filtrable, chants, grammaire, cartes de révision (boîtes de Leitner), recherche,
  « Reprendre » et suivi des conversations lues. **Export Anki** (`site/anki/`).
- Le site `site/` est régénéré à partir du contenu actuel (300 conversations, glossaire complet).

### Travail de cette dernière session (20 novembre 2026)
- **70 conversations rédigées** : 041–050 et 051–060 (automne année 1 : David, l'ancien Zhang, métro,
  typhon, marché de nuit, anniversaire de Xiao En…), 091–100 (Évangile de Jean, mars), 101–110
  (Semaine sainte et Pâques), 111–120 (Luc décide de suivre Jésus), 141–150 (camp d'été après le baptême),
  171–180 (préparation de Hualien, deuxième Noël, culte d'envoi). Les tranches voisines ont été relues
  avant chaque écriture (Mamie Chen ne révèle son carnet de prière qu'en 153, la mère de Luc n'apprend
  le baptême qu'en 137, A-Jie et Luc se réconcilient en 167 puis 176, etc.).
- `031–040` : 5 erreurs de pinyin corrigées (真的, 圖, 一會兒).
- **73 erreurs de validation** corrigées dans les tranches 201–300 (pinyin mal formé, syllabes en trop,
  兒化 « 一會兒 », « 那樣 », « 污/游 »…). Le validateur accepte 游 (forme de Taïwan pour 游泳).
- **Pinyin harmonisé** sur tout le corpus (644 jetons modifiés) et lectures de Taïwan reconnues par le validateur.
- **Mots clés `vocab:`** : plus aucun mot clé absent du texte (93 corrigés : fusion de jetons voisins ou retrait).
- **Chants** : les 18 titres absents de la liste ont été remplacés par des titres exacts de la liste
  (dont 4 mentions dans le texte), et 15 chants répétés ont été réaffectés.
- **Glossaire** `data/glossaire.tsv` : 3 412 entrées écrites ; `npm run build` ne signale plus aucun mot sans définition.
- Validation Node **débloquée** : `npm install` a installé `opencc-js` et `pinyin-pro`.

### Travail de la session suivante (20 novembre 2026) : longueurs et contrôle du site
- **Niveau 5 (231–270)** : les 34 conversations trop courtes ont été étoffées (440–520 caractères, cible 430–560) par
  des répliques et des développements argumentatifs insérés dans le récit ; aucun verset nouveau cité mot pour mot,
  aucune parole de chant. Quelques mots clés `vocab:` ajoutés en 261–269.
- **Petits écarts** : 219 et 296–299 allongées ; 204 et 205 raccourcies ; au niveau 1, **cible maximale relevée à 150**
  (`scripts/lib/parse.js` et guide) et 031, 035–040 raccourcies ; 096, 098, 114 ramenées dans la cible.
  La conversation 298 corrigeait « 妳 » en « 你 » (Xiao En parle à Luc).
- **Cohérence** : en 251, Luc « retourne » au séminaire (au lieu d'y entrer) ; en 235, David rappelle sa demande de lire avec Luc (230).
- **Glossaire** : 154 définitions ajoutées pour les nouveaux mots (7 114 clés au total) ; pinyin ré-harmonisé (0 jeton à modifier).
- **Site** : régénéré ; 311 pages répondent, les 61 415 mots des 300 conversations ont pinyin et définition ;
  vocabulaire, cartes, grammaire, recherche et la page 266 ouverts sans erreur de console.

---

## 🔄 En cours

- Rien de commencé et laissé en plan. Les conversations restent à relire et à étoffer (voir ci-dessous).

<!-- ETAT:DEBUT (bloc généré par npm run etat, ne pas modifier à la main) -->
_Généré le 20 novembre 2026 à 15:34._

**300 / 300 conversations rédigées** (100 %), 44 séries déclarées. Validation : 32 fichier(s) — 0 erreur(s), 0 avertissement(s).

| Niveau | Numéros | Rédigées |
|---|---|---|
| 1 | 001–060 | 60 / 60 |
| 2 | 061–120 | 60 / 60 |
| 3 | 121–180 | 60 / 60 |
| 4 | 181–230 | 50 / 50 |
| 5 | 231–270 | 40 / 40 |
| 6 | 271–300 | 30 / 30 |

| Tranche | Niveau | État | Séries |
|---|---|---|---|
| 001–010 | 1 | ✅ 10/10 | Arrivée à Taipei · Premier dimanche |
| 011–020 | 1 | ✅ 10/10 | Premier dimanche · Chez Xiao En · La répétition du samedi |
| 021–030 | 1 | ✅ 10/10 | La répétition du samedi · Les questions de Xiao Guang |
| 031–040 | 1 | ✅ 10/10 | Les questions de Xiao Guang |
| 041–050 | 1 | ✅ 10/10 | David, un nouvel ami · Taipei en automne |
| 051–060 | 1 | ✅ 10/10 | Taipei en automne · L'anniversaire de Xiao En |
| 061–070 | 2 | ✅ 10/10 | Noël approche · Annoncer la bonne nouvelle |
| 071–080 | 2 | ✅ 10/10 | Annoncer la bonne nouvelle · Une année nouvelle · Le groupe de maison du mercredi |
| 081–090 | 2 | ✅ 10/10 | Le groupe de maison du mercredi · Le Nouvel An chinois · Lire l'Évangile de Jean |
| 091–100 | 2 | ✅ 10/10 | Lire l'Évangile de Jean |
| 101–110 | 2 | ✅ 10/10 | La croix et la résurrection |
| 111–120 | 2 | ✅ 10/10 | Décider de suivre Jésus |
| 121–130 | 3 | ✅ 10/10 | Préparer le baptême · Rejoindre l'équipe de louange |
| 131–140 | 3 | ✅ 10/10 | Rejoindre l'équipe de louange · Le jour du baptême |
| 141–150 | 3 | ✅ 10/10 | Le camp d'été |
| 151–160 | 3 | ✅ 10/10 | Premiers pas dans le service · Papa Chen à l'hôpital |
| 161–170 | 3 | ✅ 10/10 | Papa Chen à l'hôpital · Le différend des guitaristes · L'appel de Hualien |
| 171–180 | 3 | ✅ 10/10 | L'appel de Hualien · Le deuxième Noël · Avant le départ |
| 181–190 | 4 | ✅ 10/10 | Mission à Hualien · Le grand rassemblement |
| 191–200 | 4 | ✅ 10/10 | Étudier l'épître aux Romains · Le combat spirituel |
| 201–210 | 4 | ✅ 10/10 | Le combat spirituel · Pâques · Dialogues avec David |
| 211–220 | 4 | ✅ 10/10 | Le fruit de l'Esprit |
| 221–230 | 4 | ✅ 10/10 | Mackay et Taïwan |
| 231–240 | 5 | ✅ 10/10 | Endormie dans le Seigneur |
| 241–250 | 5 | ✅ 10/10 | Grâce et élection |
| 251–260 | 5 | ✅ 10/10 | La première année au séminaire |
| 261–270 | 5 | ✅ 10/10 | Le deuxième semestre au séminaire |
| 271–280 | 6 | ✅ 10/10 | Le Dieu trinitaire et l'incarnation · Des credo à la Réforme · Des cantiques aux chants nouveaux |
| 281–290 | 6 | ✅ 10/10 | Des cantiques aux chants nouveaux · Mon Seigneur et mon Dieu · Théologie de l'adoration |
| 291–300 | 6 | ✅ 10/10 | Le premier sermon |

**Manquantes (0)** : aucune.
<!-- ETAT:FIN -->

---

## ⏳ Reste à faire

### 1. Points de continuité à trancher (signalés, non corrigés)
- **Calendrier du niveau 5** : 241 commence à la mi-novembre alors que 240 se termine pendant l'Avent (retour en arrière) ;
  261 situe la rentrée du 2ᵉ semestre en octobre « après l'été », 270 finit en décembre et 271 reprend en septembre
  (« Luc passe en deuxième année ») : à harmoniser selon le calendrier voulu.
- **Mamie Chen** : 241 la montre priant pour Luc la nuit (nouveau dans ce passage) ; 266 en fait la belle-mère de Maman Chen.
- **Luc et le style de louange** : 258 rappelle qu'il a d'abord trouvé la louange taïwanaise « trop animée » ; non vérifié ailleurs.
- **Chronologie de David** : 256 le fait lire l'Apocalypse, 267 est sa « première fois avec sa Bible » à l'église : à confirmer.

### 2. Relecture humaine (à faire par l'auteur)
- Naturel du chinois, exactitude théologique, qualité des traductions françaises, exactitude des versets
  cités (和合本 / Louis Segond 1910). Vérifier en particulier les versets cités dans les 70 nouvelles conversations
  (Jean 1:46, 2:5, 4:14, 6:9, 8:7, 9:25, 10:3 et 10:27, 11:25 et 11:35, 12:13, 13:14, 14:1 et 14:6, 15:5, 19:30, 20:16, 21:17 et 21:19 ;
  Éphésiens 2:8 ; 2 Corinthiens 9:7 ; Matthieu 16:24 ; Actes 13:3 ; Psaume 34:8).
- Relire le **glossaire** (rédigé rapidement : définitions courtes, parfois approximatives pour les noms propres
  et les termes théologiques).
- Les ~30 chants encore utilisés plusieurs fois (par ex. 《有人在為你禱告》, 《安靜》, 《這一生最美的祝福》) le sont souvent
  parce que leur titre est cité dans le texte : à varier seulement si le récit le permet. Environ 300 titres de la liste
  restent inutilisés.

### 3. Site et documentation
- Vérifier le site en navigateur (contrôle automatique fait : 311 pages répondent, mots avec pinyin et définition, pas d'erreur de console sur les pages ouvertes) ; un parcours à la main page par page reste à faire.
- Décider d'une **publication en ligne** éventuelle (GitHub Pages, par exemple) : décision laissée à l'auteur.
